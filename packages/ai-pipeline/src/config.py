"""Typed environment configuration for AI Pipeline."""

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class PipelineConfig:
    """AI Pipeline configuration from environment variables."""

    ai_provider_primary: str = field(default_factory=lambda: os.getenv('AI_PROVIDER_PRIMARY', 'fal'))
    fal_api_key: str = field(default_factory=lambda: os.getenv('FAL_API_KEY', ''))
    replicate_api_token: str = field(default_factory=lambda: os.getenv('REPLICATE_API_TOKEN', ''))
    pipeline_api_key: str = field(default_factory=lambda: os.getenv('PIPELINE_API_KEY', ''))
    supabase_url: str = field(default_factory=lambda: os.getenv('SUPABASE_URL', ''))
    supabase_service_key: str = field(default_factory=lambda: os.getenv('SUPABASE_SERVICE_KEY', ''))
    host: str = field(default_factory=lambda: os.getenv('HOST', '0.0.0.0'))
    port: int = field(default_factory=lambda: int(os.getenv('PORT', '8000')))
    log_level: str = field(default_factory=lambda: os.getenv('LOG_LEVEL', 'info'))


def get_config() -> PipelineConfig:
    """Load configuration from environment variables."""
    return PipelineConfig()
