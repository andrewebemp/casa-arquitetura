"""FastAPI entry point for DecorAI AI Pipeline."""

import logging

from fastapi import FastAPI

from .api.routes import router
from .config import get_config

config = get_config()

logging.basicConfig(
    level=getattr(logging, config.log_level.upper(), logging.INFO),
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
)

app = FastAPI(
    title='DecorAI AI Pipeline',
    version='0.1.0',
    description='AI-powered image generation and processing pipeline',
)

app.include_router(router)
