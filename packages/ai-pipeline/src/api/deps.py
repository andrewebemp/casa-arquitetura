"""Dependency injection for FastAPI routes."""

from functools import lru_cache

from fastapi import Depends, Header, HTTPException

from ..config import PipelineConfig, get_config
from ..providers.factory import ProviderFactory
from ..services.generation import GenerationService
from ..services.spatial import SpatialService
from ..services.style import StyleService
from ..services.upscale import UpscaleService


@lru_cache
def get_pipeline_config() -> PipelineConfig:
    return get_config()


@lru_cache
def get_provider_factory() -> ProviderFactory:
    config = get_pipeline_config()
    return ProviderFactory(
        primary=config.ai_provider_primary,
        fal_api_key=config.fal_api_key,
        replicate_api_token=config.replicate_api_token,
    )


def get_spatial_service(
    factory: ProviderFactory = Depends(get_provider_factory),
) -> SpatialService:
    return SpatialService(factory)


def get_style_service(
    factory: ProviderFactory = Depends(get_provider_factory),
) -> StyleService:
    return StyleService(factory)


def get_upscale_service(
    factory: ProviderFactory = Depends(get_provider_factory),
) -> UpscaleService:
    return UpscaleService(factory)


def get_generation_service(
    factory: ProviderFactory = Depends(get_provider_factory),
    upscale: UpscaleService = Depends(get_upscale_service),
) -> GenerationService:
    return GenerationService(factory, upscale)


async def verify_api_key(
    x_pipeline_key: str = Header(..., alias='X-Pipeline-Key'),
    config: PipelineConfig = Depends(get_pipeline_config),
) -> str:
    """AC6: All endpoints require API key authentication via X-Pipeline-Key header."""
    if not config.pipeline_api_key:
        return x_pipeline_key
    if x_pipeline_key != config.pipeline_api_key:
        raise HTTPException(status_code=401, detail='Invalid API key')
    return x_pipeline_key
