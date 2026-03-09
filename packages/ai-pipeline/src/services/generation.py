"""Image generation service using SDXL + ControlNet (AC4)."""

import logging
import time
from typing import Any

import httpx

from ..models.schemas import (
    GenerationMetadata,
    GenerationResponse,
    ProgressCallback,
)
from ..providers.factory import ProviderFactory
from .upscale import UpscaleService

logger = logging.getLogger(__name__)


class GenerationService:
    """Orchestrates multi-conditioning ControlNet + SDXL generation."""

    def __init__(
        self,
        provider_factory: ProviderFactory,
        upscale_service: UpscaleService,
    ):
        self._factory = provider_factory
        self._upscale = upscale_service

    async def generate(
        self,
        source_image_url: str,
        depth_map_url: str,
        style_params: dict[str, Any],
        output_resolution: str = '1024x1024',
        callback_url: str | None = None,
    ) -> GenerationResponse:
        """Generate a decorated room image.

        Pipeline stages (AC5 progress mapping):
        - depth: 0-20% (already done, skip)
        - style: 20-30% (already done, skip)
        - generation: 30-80%
        - upscale: 80-95%
        - upload: 95-100%

        Args:
            source_image_url: Original room photo URL.
            depth_map_url: Depth map from /analyze/depth.
            style_params: Style params from /analyze/style.
            output_resolution: '1024x1024' or '2048x2048'.
            callback_url: Optional URL for progress callbacks.

        Returns:
            GenerationResponse with result image and metadata.
        """
        start = time.monotonic()
        needs_upscale = output_resolution == '2048x2048'

        # Stage: generation (30-80%)
        await self._report_progress(callback_url, 'generation', 30, 'Starting SDXL generation')

        sdxl_input = self._build_sdxl_input(
            source_image_url=source_image_url,
            depth_map_url=depth_map_url,
            style_params=style_params,
        )

        result = await self._factory.generate_with_fallback(
            model='fast-sdxl',
            input_data=sdxl_input,
            timeout=30.0,
        )

        generated_url = self._extract_image_url(result)
        meta = result.get('_meta', {})

        await self._report_progress(callback_url, 'generation', 80, 'SDXL generation complete')

        # Stage: upscale (80-95%)
        upscaled = False
        if needs_upscale and generated_url:
            await self._report_progress(callback_url, 'upscale', 80, 'Starting Real-ESRGAN upscale')
            upscale_result = await self._upscale.upscale(generated_url, scale=2)
            upscale_url = upscale_result.get('image_url', '')
            if upscale_url:
                generated_url = upscale_url
                upscaled = True
            await self._report_progress(callback_url, 'upscale', 95, 'Upscale complete')

        # Stage: upload (95-100%)
        await self._report_progress(callback_url, 'upload', 95, 'Finalizing')
        await self._report_progress(callback_url, 'upload', 100, 'Complete')

        elapsed = int((time.monotonic() - start) * 1000)

        return GenerationResponse(
            result_image_url=generated_url,
            metadata=GenerationMetadata(
                model=meta.get('model', 'fast-sdxl'),
                inference_time_ms=elapsed,
                provider=meta.get('provider', 'unknown'),
                upscaled=upscaled,
            ),
        )

    def _build_sdxl_input(
        self,
        source_image_url: str,
        depth_map_url: str,
        style_params: dict[str, Any],
    ) -> dict[str, Any]:
        """Build SDXL + ControlNet input payload."""
        prompt = style_params.get('style_prompt', '')
        negative_prompt = style_params.get('negative_prompt', '')
        controlnet_params = style_params.get('controlnet_params', {})

        return {
            'prompt': prompt,
            'negative_prompt': negative_prompt,
            'image_url': source_image_url,
            'controlnet_conditioning': [
                {
                    'type': 'depth',
                    'image_url': depth_map_url,
                    'strength': controlnet_params.get('depth_strength', 0.7),
                },
                {
                    'type': 'canny',
                    'image_url': source_image_url,
                    'strength': controlnet_params.get('edge_strength', 0.4),
                },
            ],
            'guidance_scale': controlnet_params.get('guidance_scale', 7.5),
            'num_inference_steps': controlnet_params.get('num_inference_steps', 30),
            'image_size': '1024x1024',
        }

    def _extract_image_url(self, result: dict[str, Any]) -> str:
        """Extract generated image URL from provider response."""
        if 'images' in result and isinstance(result['images'], list) and result['images']:
            img = result['images'][0]
            return img.get('url', img) if isinstance(img, dict) else str(img)
        if 'image' in result:
            img = result['image']
            return img.get('url', img) if isinstance(img, dict) else str(img)
        if 'output' in result:
            output = result['output']
            if isinstance(output, list) and output:
                return str(output[0])
            if isinstance(output, str):
                return output
        return ''

    async def _report_progress(
        self,
        callback_url: str | None,
        stage: str,
        progress: int,
        message: str,
    ) -> None:
        """Send progress update to callback URL if configured."""
        if not callback_url:
            return

        payload = ProgressCallback(
            stage=stage,
            progress=progress,
            message=message,
        )

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(callback_url, json=payload.model_dump())
        except Exception as exc:
            logger.warning('Failed to send progress callback: %s', exc)
