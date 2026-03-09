"""fal.ai provider implementation."""

import logging
import time
from typing import Any

import httpx

from .base import ImageProvider, ProviderError

logger = logging.getLogger(__name__)

FAL_BASE_URL = 'https://fal.run'

FAL_MODEL_MAP = {
    'fast-sdxl': 'fal-ai/fast-sdxl',
    'real-esrgan': 'fal-ai/real-esrgan',
    'zoedepth': 'fal-ai/zoedepth',
    'clip': 'fal-ai/clip',
}


class FalProvider(ImageProvider):
    """fal.ai GPU provider client."""

    def __init__(self, api_key: str):
        self._api_key = api_key
        self._client = httpx.AsyncClient(
            base_url=FAL_BASE_URL,
            headers={
                'Authorization': f'Key {api_key}',
                'Content-Type': 'application/json',
            },
            timeout=60.0,
        )

    @property
    def name(self) -> str:
        return 'fal'

    async def generate(
        self,
        model: str,
        input_data: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any]:
        fal_model = FAL_MODEL_MAP.get(model, model)
        start = time.monotonic()

        try:
            response = await self._client.post(
                f'/{fal_model}',
                json={'input': input_data},
                timeout=timeout,
            )
            response.raise_for_status()
            elapsed = time.monotonic() - start
            result = response.json()
            result['_meta'] = {
                'provider': self.name,
                'model': fal_model,
                'inference_time_ms': int(elapsed * 1000),
            }
            return result

        except httpx.TimeoutException as exc:
            logger.error('fal.ai timeout for model %s: %s', model, exc)
            raise ProviderError(
                f'fal.ai timeout after {timeout}s',
                provider=self.name,
                model=model,
                error_code='TIMEOUT',
            ) from exc
        except httpx.HTTPStatusError as exc:
            logger.error('fal.ai HTTP error %d for model %s', exc.response.status_code, model)
            raise ProviderError(
                f'fal.ai HTTP {exc.response.status_code}: {exc.response.text}',
                provider=self.name,
                model=model,
                error_code=f'HTTP_{exc.response.status_code}',
            ) from exc
        except httpx.HTTPError as exc:
            logger.error('fal.ai request error for model %s: %s', model, exc)
            raise ProviderError(
                f'fal.ai request failed: {exc}',
                provider=self.name,
                model=model,
                error_code='REQUEST_ERROR',
            ) from exc

    async def get_status(self, request_id: str) -> dict[str, Any]:
        try:
            response = await self._client.get(f'/requests/{request_id}/status')
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise ProviderError(
                f'Failed to get status: {exc}',
                provider=self.name,
                error_code='STATUS_ERROR',
            ) from exc

    async def get_result(self, request_id: str) -> dict[str, Any]:
        try:
            response = await self._client.get(f'/requests/{request_id}')
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise ProviderError(
                f'Failed to get result: {exc}',
                provider=self.name,
                error_code='RESULT_ERROR',
            ) from exc

    async def health_check(self) -> bool:
        try:
            response = await self._client.get('/', timeout=5.0)
            return response.status_code < 500
        except httpx.HTTPError:
            return False
