"""Depth estimation service using ZoeDepth via providers (AC2)."""

import logging
from typing import Any

from ..models.schemas import (
    DepthEstimationResponse,
    DetectedFeature,
    EstimatedDimensions,
)
from ..providers.factory import ProviderFactory

logger = logging.getLogger(__name__)


class SpatialService:
    """ZoeDepth-based depth estimation and spatial analysis."""

    def __init__(self, provider_factory: ProviderFactory):
        self._factory = provider_factory

    async def estimate_depth(self, image_url: str) -> DepthEstimationResponse:
        """Estimate depth from a room photo using ZoeDepth.

        Args:
            image_url: URL of the room photo.

        Returns:
            DepthEstimationResponse with depth map and spatial data.
        """
        logger.info('Starting depth estimation for %s', image_url)

        result = await self._factory.generate_with_fallback(
            model='zoedepth',
            input_data={'image_url': image_url},
            timeout=30.0,
        )

        meta = result.get('_meta', {})
        depth_map_url = self._extract_depth_map_url(result)
        dimensions = self._extract_dimensions(result)
        features = self._extract_features(result)

        return DepthEstimationResponse(
            depth_map_url=depth_map_url,
            estimated_dimensions=dimensions,
            detected_features=features,
            provider=meta.get('provider', 'unknown'),
            inference_time_ms=meta.get('inference_time_ms', 0),
        )

    def _extract_depth_map_url(self, result: dict[str, Any]) -> str:
        """Extract depth map URL from provider response."""
        # fal.ai returns image in 'image' or 'output'
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

    def _extract_dimensions(self, result: dict[str, Any]) -> EstimatedDimensions:
        """Extract or estimate room dimensions from depth data."""
        # Providers may include spatial_data; use defaults otherwise
        spatial = result.get('spatial_data', {})
        return EstimatedDimensions(
            width_m=spatial.get('width_m', 4.0),
            length_m=spatial.get('length_m', 5.0),
            height_m=spatial.get('height_m', 2.8),
        )

    def _extract_features(self, result: dict[str, Any]) -> list[DetectedFeature]:
        """Extract detected features from depth analysis."""
        raw_features = result.get('detected_features', [])
        features: list[DetectedFeature] = []
        for feat in raw_features:
            if isinstance(feat, dict):
                features.append(DetectedFeature(
                    type=feat.get('type', 'unknown'),
                    confidence=feat.get('confidence', 0.5),
                    position=feat.get('position', {}),
                ))
        return features
