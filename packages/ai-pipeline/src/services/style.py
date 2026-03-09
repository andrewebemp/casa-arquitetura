"""Style extraction service using CLIP (AC3)."""

import logging
from typing import Any

from ..models.schemas import (
    ControlNetParams,
    StyleExtractionResponse,
)
from ..providers.factory import ProviderFactory

logger = logging.getLogger(__name__)

# Optimized prompts per DecorStyle for SDXL generation
STYLE_PROMPTS: dict[str, dict[str, str]] = {
    'moderno': {
        'prompt': 'modern interior design, clean lines, neutral colors, open space, contemporary furniture, natural light, high quality render, photorealistic',
        'negative': 'cluttered, old-fashioned, dark, low quality, blurry, distorted',
    },
    'industrial': {
        'prompt': 'industrial interior design, exposed brick, metal beams, concrete floors, vintage lighting, raw materials, loft style, photorealistic',
        'negative': 'soft, delicate, ornate, colorful, cluttered, low quality, blurry',
    },
    'minimalista': {
        'prompt': 'minimalist interior design, white walls, few furniture pieces, zen aesthetic, clean surfaces, natural light, empty space, photorealistic',
        'negative': 'cluttered, busy, ornate, colorful, excessive decoration, low quality',
    },
    'classico': {
        'prompt': 'classic interior design, elegant furniture, crown moldings, rich fabrics, chandelier, warm colors, traditional style, photorealistic',
        'negative': 'modern, industrial, minimalist, shabby, low quality, blurry',
    },
    'escandinavo': {
        'prompt': 'scandinavian interior design, light wood, white palette, cozy textiles, functional furniture, hygge atmosphere, natural materials, photorealistic',
        'negative': 'dark, heavy, ornate, cluttered, industrial, low quality, blurry',
    },
    'rustico': {
        'prompt': 'rustic interior design, natural wood, stone walls, warm tones, handmade elements, farmhouse style, cozy atmosphere, photorealistic',
        'negative': 'modern, sleek, industrial, cold, minimalist, low quality, blurry',
    },
    'tropical': {
        'prompt': 'tropical interior design, palm plants, rattan furniture, vibrant greens, natural textures, open air feeling, resort style, photorealistic',
        'negative': 'cold, dark, industrial, minimalist, heavy, low quality, blurry',
    },
    'contemporaneo': {
        'prompt': 'contemporary interior design, bold accents, mixed materials, statement pieces, artistic elements, sophisticated palette, photorealistic',
        'negative': 'old-fashioned, cluttered, monotone, shabby, low quality, blurry',
    },
    'boho': {
        'prompt': 'bohemian interior design, eclectic patterns, macrame, layered textiles, plants, warm earth tones, artistic mix, photorealistic',
        'negative': 'minimal, sterile, industrial, cold, uniform, low quality, blurry',
    },
    'luxo': {
        'prompt': 'luxury interior design, marble surfaces, gold accents, velvet upholstery, designer furniture, crystal chandelier, opulent, photorealistic',
        'negative': 'cheap, simple, industrial, rustic, cluttered, low quality, blurry',
    },
}

# Default ControlNet params per style
STYLE_CONTROLNET: dict[str, dict[str, float | int]] = {
    'moderno': {'depth_strength': 0.7, 'edge_strength': 0.4, 'guidance_scale': 7.5, 'num_inference_steps': 30},
    'industrial': {'depth_strength': 0.8, 'edge_strength': 0.5, 'guidance_scale': 8.0, 'num_inference_steps': 35},
    'minimalista': {'depth_strength': 0.6, 'edge_strength': 0.3, 'guidance_scale': 7.0, 'num_inference_steps': 25},
    'classico': {'depth_strength': 0.7, 'edge_strength': 0.5, 'guidance_scale': 8.5, 'num_inference_steps': 35},
    'escandinavo': {'depth_strength': 0.65, 'edge_strength': 0.35, 'guidance_scale': 7.0, 'num_inference_steps': 28},
    'rustico': {'depth_strength': 0.75, 'edge_strength': 0.45, 'guidance_scale': 8.0, 'num_inference_steps': 32},
    'tropical': {'depth_strength': 0.7, 'edge_strength': 0.4, 'guidance_scale': 7.5, 'num_inference_steps': 30},
    'contemporaneo': {'depth_strength': 0.7, 'edge_strength': 0.45, 'guidance_scale': 8.0, 'num_inference_steps': 32},
    'boho': {'depth_strength': 0.65, 'edge_strength': 0.4, 'guidance_scale': 7.5, 'num_inference_steps': 30},
    'luxo': {'depth_strength': 0.75, 'edge_strength': 0.5, 'guidance_scale': 9.0, 'num_inference_steps': 40},
}


class StyleService:
    """CLIP-based style extraction and prompt optimization."""

    def __init__(self, provider_factory: ProviderFactory):
        self._factory = provider_factory

    async def extract_style(
        self,
        style: str,
        reference_image_url: str | None = None,
    ) -> StyleExtractionResponse:
        """Extract style parameters and CLIP embeddings.

        Args:
            style: One of the 10 DecorStyle values.
            reference_image_url: Optional reference image for CLIP embedding.

        Returns:
            StyleExtractionResponse with prompts and ControlNet params.
        """
        logger.info('Extracting style params for %s', style)

        style_data = STYLE_PROMPTS.get(style, STYLE_PROMPTS['moderno'])
        controlnet_data = STYLE_CONTROLNET.get(style, STYLE_CONTROLNET['moderno'])

        # Get CLIP embeddings
        clip_embeddings: list[float] = []
        provider_name = 'local'
        inference_time = 0

        clip_input: dict[str, Any] = {'text': style_data['prompt']}
        if reference_image_url:
            clip_input['image_url'] = reference_image_url

        try:
            result = await self._factory.generate_with_fallback(
                model='clip',
                input_data=clip_input,
                timeout=15.0,
            )
            meta = result.get('_meta', {})
            provider_name = meta.get('provider', 'unknown')
            inference_time = meta.get('inference_time_ms', 0)
            clip_embeddings = self._extract_embeddings(result)
        except Exception as exc:
            logger.warning('CLIP embedding failed, using empty: %s', exc)

        return StyleExtractionResponse(
            style_prompt=style_data['prompt'],
            negative_prompt=style_data['negative'],
            clip_embeddings=clip_embeddings,
            controlnet_params=ControlNetParams(**controlnet_data),
            provider=provider_name,
            inference_time_ms=inference_time,
        )

    def _extract_embeddings(self, result: dict[str, Any]) -> list[float]:
        """Extract CLIP embeddings from provider response."""
        if 'embedding' in result:
            emb = result['embedding']
            return emb if isinstance(emb, list) else []
        if 'output' in result:
            output = result['output']
            if isinstance(output, list) and output and isinstance(output[0], (int, float)):
                return [float(x) for x in output]
        return []
