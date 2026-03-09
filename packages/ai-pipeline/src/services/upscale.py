"""Upscale service using Real-ESRGAN (AC4, Task 5)."""

import logging
from typing import Any

from ..providers.factory import ProviderFactory

logger = logging.getLogger(__name__)


class UpscaleService:
    """Real-ESRGAN upscaling for high-resolution output."""

    def __init__(self, provider_factory: ProviderFactory):
        self._factory = provider_factory

    async def upscale(
        self,
        image_url: str,
        scale: int = 2,
    ) -> dict[str, Any]:
        """Upscale an image using Real-ESRGAN.

        Args:
            image_url: URL of the image to upscale.
            scale: Upscale factor (default 2 for 1024->2048).

        Returns:
            Dict with 'image_url' and '_meta'.
        """
        logger.info('Upscaling image (scale=%d): %s', scale, image_url)

        result = await self._factory.generate_with_fallback(
            model='real-esrgan',
            input_data={
                'image_url': image_url,
                'scale': scale,
            },
            timeout=30.0,
        )

        output_url = self._extract_output_url(result)
        meta = result.get('_meta', {})

        return {
            'image_url': output_url,
            '_meta': meta,
        }

    def _extract_output_url(self, result: dict[str, Any]) -> str:
        """Extract upscaled image URL from provider response."""
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
