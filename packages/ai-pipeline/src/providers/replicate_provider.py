"""Replicate provider implementation."""

import logging
import time
from typing import Any

import httpx

from .base import ImageProvider, ProviderError

logger = logging.getLogger(__name__)

REPLICATE_BASE_URL = 'https://api.replicate.com/v1'

REPLICATE_MODEL_MAP = {
    'fast-sdxl': 'stability-ai/sdxl:latest',
    'real-esrgan': 'nightmareai/real-esrgan:latest',
    'zoedepth': 'cjwbw/zoedepth:latest',
    'clip': 'openai/clip-vit-large-patch14:latest',
}


class ReplicateProvider(ImageProvider):
    """Replicate GPU provider client."""

    def __init__(self, api_token: str):
        self._api_token = api_token
        self._client = httpx.AsyncClient(
            base_url=REPLICATE_BASE_URL,
            headers={
                'Authorization': f'Bearer {api_token}',
                'Content-Type': 'application/json',
            },
            timeout=60.0,
        )

    @property
    def name(self) -> str:
        return 'replicate'

    async def generate(
        self,
        model: str,
        input_data: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any]:
        replicate_model = REPLICATE_MODEL_MAP.get(model, model)
        version = replicate_model.split(':')[-1] if ':' in replicate_model else 'latest'
        start = time.monotonic()

        try:
            # Create prediction
            response = await self._client.post(
                '/predictions',
                json={
                    'version': version,
                    'input': input_data,
                },
                timeout=timeout,
            )
            response.raise_for_status()
            prediction = response.json()
            prediction_id = prediction.get('id', '')

            # Poll for completion
            result = await self._poll_prediction(prediction_id, timeout)
            elapsed = time.monotonic() - start

            result['_meta'] = {
                'provider': self.name,
                'model': replicate_model,
                'inference_time_ms': int(elapsed * 1000),
                'prediction_id': prediction_id,
            }
            return result

        except ProviderError:
            raise
        except httpx.TimeoutException as exc:
            logger.error('Replicate timeout for model %s: %s', model, exc)
            raise ProviderError(
                f'Replicate timeout after {timeout}s',
                provider=self.name,
                model=model,
                error_code='TIMEOUT',
            ) from exc
        except httpx.HTTPStatusError as exc:
            logger.error('Replicate HTTP error %d for model %s', exc.response.status_code, model)
            raise ProviderError(
                f'Replicate HTTP {exc.response.status_code}: {exc.response.text}',
                provider=self.name,
                model=model,
                error_code=f'HTTP_{exc.response.status_code}',
            ) from exc
        except httpx.HTTPError as exc:
            logger.error('Replicate request error for model %s: %s', model, exc)
            raise ProviderError(
                f'Replicate request failed: {exc}',
                provider=self.name,
                model=model,
                error_code='REQUEST_ERROR',
            ) from exc

    async def _poll_prediction(
        self,
        prediction_id: str,
        timeout: float,
    ) -> dict[str, Any]:
        """Poll prediction until complete or timeout."""
        import asyncio

        deadline = time.monotonic() + timeout

        while time.monotonic() < deadline:
            response = await self._client.get(f'/predictions/{prediction_id}')
            response.raise_for_status()
            data = response.json()
            status = data.get('status', '')

            if status == 'succeeded':
                return data
            if status == 'failed':
                error_msg = data.get('error', 'Unknown error')
                raise ProviderError(
                    f'Replicate prediction failed: {error_msg}',
                    provider=self.name,
                    error_code='PREDICTION_FAILED',
                )
            if status == 'canceled':
                raise ProviderError(
                    'Replicate prediction was canceled',
                    provider=self.name,
                    error_code='PREDICTION_CANCELED',
                )

            await asyncio.sleep(1.0)

        raise ProviderError(
            f'Replicate polling timeout after {timeout}s',
            provider=self.name,
            error_code='POLL_TIMEOUT',
        )

    async def get_status(self, request_id: str) -> dict[str, Any]:
        try:
            response = await self._client.get(f'/predictions/{request_id}')
            response.raise_for_status()
            data = response.json()
            return {'status': data.get('status', 'unknown')}
        except httpx.HTTPError as exc:
            raise ProviderError(
                f'Failed to get status: {exc}',
                provider=self.name,
                error_code='STATUS_ERROR',
            ) from exc

    async def get_result(self, request_id: str) -> dict[str, Any]:
        try:
            response = await self._client.get(f'/predictions/{request_id}')
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
            response = await self._client.get('/models', timeout=5.0)
            return response.status_code < 500
        except httpx.HTTPError:
            return False
