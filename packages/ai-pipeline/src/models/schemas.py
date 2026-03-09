"""Pydantic request/response models for the AI Pipeline API."""

from typing import Any, Literal

from pydantic import BaseModel, Field, HttpUrl


# --- Depth Estimation (AC2) ---

class DepthEstimationRequest(BaseModel):
    """POST /analyze/depth request."""
    image_url: str = Field(..., description='URL of the room photo to analyze')


class DetectedFeature(BaseModel):
    """A detected structural feature in the room."""
    type: str = Field(..., description='Feature type: door, window, column, wall_edge')
    confidence: float = Field(..., ge=0.0, le=1.0)
    position: dict[str, float] = Field(default_factory=dict, description='Relative position in image')


class EstimatedDimensions(BaseModel):
    """Estimated room dimensions from depth analysis."""
    width_m: float = Field(..., description='Estimated width in meters')
    length_m: float = Field(..., description='Estimated length in meters')
    height_m: float = Field(..., description='Estimated ceiling height in meters')


class DepthEstimationResponse(BaseModel):
    """POST /analyze/depth response."""
    depth_map_url: str = Field(..., description='URL of generated depth map')
    estimated_dimensions: EstimatedDimensions
    detected_features: list[DetectedFeature] = Field(default_factory=list)
    provider: str = Field(..., description='Provider used (fal/replicate)')
    inference_time_ms: int = Field(..., description='Processing time in ms')


# --- Style Extraction (AC3) ---

DECOR_STYLES = Literal[
    'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
    'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo',
]


class StyleExtractionRequest(BaseModel):
    """POST /analyze/style request."""
    style: DECOR_STYLES = Field(..., description='One of 10 DecorStyle values')
    reference_image_url: str | None = Field(None, description='Optional reference image URL')


class ControlNetParams(BaseModel):
    """ControlNet conditioning parameters."""
    depth_strength: float = Field(0.7, ge=0.0, le=1.0)
    edge_strength: float = Field(0.4, ge=0.0, le=1.0)
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0)
    num_inference_steps: int = Field(30, ge=10, le=100)


class StyleExtractionResponse(BaseModel):
    """POST /analyze/style response."""
    style_prompt: str = Field(..., description='Optimized prompt for SDXL')
    negative_prompt: str = Field(..., description='Negative prompt to avoid artifacts')
    clip_embeddings: list[float] = Field(default_factory=list, description='CLIP embedding vector')
    controlnet_params: ControlNetParams
    provider: str = Field(..., description='Provider used')
    inference_time_ms: int = Field(..., description='Processing time in ms')


# --- Image Generation (AC4) ---

class GenerationRequest(BaseModel):
    """POST /generate request."""
    source_image_url: str = Field(..., description='Original room photo URL')
    depth_map_url: str = Field(..., description='Depth map URL from /analyze/depth')
    style_params: dict[str, Any] = Field(default_factory=dict, description='Style params from /analyze/style')
    output_resolution: Literal['1024x1024', '2048x2048'] = Field('1024x1024')
    callback_url: str | None = Field(None, description='URL for progress callbacks')


class GenerationMetadata(BaseModel):
    """Metadata for a completed generation."""
    model: str = Field(..., description='Model used')
    inference_time_ms: int = Field(..., description='Total inference time')
    provider: str = Field(..., description='Provider used')
    upscaled: bool = Field(False, description='Whether Real-ESRGAN upscale was applied')


class GenerationResponse(BaseModel):
    """POST /generate response."""
    result_image_url: str = Field(..., description='URL of generated decorated room image')
    metadata: GenerationMetadata


# --- Progress Callback ---

class ProgressCallback(BaseModel):
    """Progress update sent to callback_url."""
    stage: str = Field(..., description='Current stage: depth, style, generation, upscale, upload')
    progress: int = Field(..., ge=0, le=100)
    message: str = Field('')


# --- Health / Ready (AC6) ---

class ProviderStatus(BaseModel):
    """Individual provider health status."""
    name: str
    available: bool
    models: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """GET /health response."""
    status: str = Field('ok')
    providers: list[ProviderStatus] = Field(default_factory=list)


class ReadyResponse(BaseModel):
    """GET /ready response."""
    ready: bool


# --- Error Response (AC7) ---

class ErrorDetail(BaseModel):
    """Structured error response."""
    error: str
    provider: str = ''
    model: str = ''
    error_code: str = 'INTERNAL_ERROR'
    retry_count: int = 0
