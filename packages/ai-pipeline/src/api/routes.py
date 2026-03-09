"""FastAPI route definitions for AI Pipeline (AC2-AC7)."""

import logging
import time

from fastapi import APIRouter, Depends, HTTPException

from ..models.schemas import (
    DepthEstimationRequest,
    DepthEstimationResponse,
    ErrorDetail,
    GenerationRequest,
    GenerationResponse,
    HealthResponse,
    ProviderStatus,
    ReadyResponse,
    StyleExtractionRequest,
    StyleExtractionResponse,
)
from ..providers.base import ProviderError
from ..providers.factory import ProviderFactory
from .deps import (
    get_generation_service,
    get_provider_factory,
    get_spatial_service,
    get_style_service,
    verify_api_key,
)
from ..services.generation import GenerationService
from ..services.spatial import SpatialService
from ..services.style import StyleService

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Health / Ready (AC6) ---

@router.get('/health', response_model=HealthResponse)
async def health_check(
    factory: ProviderFactory = Depends(get_provider_factory),
) -> HealthResponse:
    """AC6: Return provider connectivity status and model availability."""
    statuses = await factory.health_check_all()
    providers = [
        ProviderStatus(
            name=name,
            available=available,
            models=['fast-sdxl', 'real-esrgan', 'zoedepth', 'clip'] if available else [],
        )
        for name, available in statuses.items()
    ]
    return HealthResponse(status='ok', providers=providers)


@router.get('/ready', response_model=ReadyResponse)
async def readiness_check(
    factory: ProviderFactory = Depends(get_provider_factory),
) -> ReadyResponse:
    """AC6: Return 200 only when at least one provider is reachable."""
    ready = await factory.is_any_available()
    if not ready:
        raise HTTPException(status_code=503, detail='No providers available')
    return ReadyResponse(ready=True)


# --- Depth Estimation (AC2) ---

@router.post(
    '/analyze/depth',
    response_model=DepthEstimationResponse,
    dependencies=[Depends(verify_api_key)],
)
async def analyze_depth(
    request: DepthEstimationRequest,
    spatial: SpatialService = Depends(get_spatial_service),
) -> DepthEstimationResponse:
    """AC2: Depth estimation using ZoeDepth."""
    start = time.monotonic()
    try:
        result = await spatial.estimate_depth(request.image_url)
        elapsed = int((time.monotonic() - start) * 1000)
        logger.info('Depth estimation completed in %dms', elapsed)
        return result
    except ProviderError as exc:
        logger.error('Depth estimation failed: %s', exc)
        raise HTTPException(
            status_code=502,
            detail=ErrorDetail(**exc.to_dict()).model_dump(),
        ) from exc


# --- Style Extraction (AC3) ---

@router.post(
    '/analyze/style',
    response_model=StyleExtractionResponse,
    dependencies=[Depends(verify_api_key)],
)
async def analyze_style(
    request: StyleExtractionRequest,
    style_svc: StyleService = Depends(get_style_service),
) -> StyleExtractionResponse:
    """AC3: Style extraction using CLIP embeddings."""
    start = time.monotonic()
    try:
        result = await style_svc.extract_style(
            style=request.style,
            reference_image_url=request.reference_image_url,
        )
        elapsed = int((time.monotonic() - start) * 1000)
        logger.info('Style extraction completed in %dms', elapsed)
        return result
    except ProviderError as exc:
        logger.error('Style extraction failed: %s', exc)
        raise HTTPException(
            status_code=502,
            detail=ErrorDetail(**exc.to_dict()).model_dump(),
        ) from exc


# --- Image Generation (AC4) ---

@router.post(
    '/generate',
    response_model=GenerationResponse,
    dependencies=[Depends(verify_api_key)],
)
async def generate_image(
    request: GenerationRequest,
    gen_svc: GenerationService = Depends(get_generation_service),
) -> GenerationResponse:
    """AC4: SDXL + ControlNet image generation."""
    start = time.monotonic()
    try:
        result = await gen_svc.generate(
            source_image_url=request.source_image_url,
            depth_map_url=request.depth_map_url,
            style_params=request.style_params,
            output_resolution=request.output_resolution,
            callback_url=request.callback_url,
        )
        elapsed = int((time.monotonic() - start) * 1000)
        logger.info('Image generation completed in %dms', elapsed)
        return result
    except ProviderError as exc:
        logger.error('Image generation failed: %s', exc)
        raise HTTPException(
            status_code=502,
            detail=ErrorDetail(**exc.to_dict()).model_dump(),
        ) from exc
