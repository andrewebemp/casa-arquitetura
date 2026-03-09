"""Provider factory with automatic fallback logic."""

import logging
from typing import Any

from .base import ImageProvider, ProviderError
from .fal_provider import FalProvider
from .replicate_provider import ReplicateProvider

logger = logging.getLogger(__name__)


class ProviderFactory:
    """Creates and manages provider instances with fallback support."""

    def __init__(
        self,
        primary: str = 'fal',
        fal_api_key: str = '',
        replicate_api_token: str = '',
    ):
        self._providers: dict[str, ImageProvider] = {}

        if fal_api_key:
            self._providers['fal'] = FalProvider(fal_api_key)
        if replicate_api_token:
            self._providers['replicate'] = ReplicateProvider(replicate_api_token)

        self._primary = primary
        self._secondary = 'replicate' if primary == 'fal' else 'fal'

    @property
    def primary_provider(self) -> ImageProvider | None:
        return self._providers.get(self._primary)

    @property
    def secondary_provider(self) -> ImageProvider | None:
        return self._providers.get(self._secondary)

    def get_provider(self, name: str) -> ImageProvider | None:
        return self._providers.get(name)

    async def generate_with_fallback(
        self,
        model: str,
        input_data: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any]:
        """Generate using primary provider, retry once, then fallback to secondary.

        AC7: retry once on primary, then fall back to secondary.
        """
        primary = self.primary_provider
        secondary = self.secondary_provider

        if not primary and not secondary:
            raise ProviderError(
                'No providers configured',
                provider='none',
                model=model,
                error_code='NO_PROVIDERS',
            )

        # Try primary provider (attempt 1)
        if primary:
            try:
                logger.info('Attempting generation on %s (attempt 1)', self._primary)
                return await primary.generate(model, input_data, timeout)
            except ProviderError as exc:
                logger.warning(
                    'Primary provider %s failed (attempt 1): %s',
                    self._primary,
                    exc,
                )
                exc.retry_count = 1

                # Retry once on primary (attempt 2)
                try:
                    logger.info('Retrying generation on %s (attempt 2)', self._primary)
                    return await primary.generate(model, input_data, timeout)
                except ProviderError as retry_exc:
                    logger.warning(
                        'Primary provider %s failed (attempt 2): %s',
                        self._primary,
                        retry_exc,
                    )
                    retry_exc.retry_count = 2

        # Fallback to secondary
        if secondary:
            try:
                logger.info('Falling back to secondary provider %s', self._secondary)
                return await secondary.generate(model, input_data, timeout)
            except ProviderError as exc:
                logger.error('Secondary provider %s also failed: %s', self._secondary, exc)
                raise ProviderError(
                    f'All providers failed. Last error: {exc}',
                    provider=self._secondary,
                    model=model,
                    error_code='ALL_PROVIDERS_FAILED',
                    retry_count=3,
                ) from exc

        raise ProviderError(
            'Primary provider failed and no secondary available',
            provider=self._primary,
            model=model,
            error_code='NO_FALLBACK',
            retry_count=2,
        )

    async def health_check_all(self) -> dict[str, bool]:
        """Check health of all configured providers."""
        results: dict[str, bool] = {}
        for name, provider in self._providers.items():
            try:
                results[name] = await provider.health_check()
            except Exception:
                results[name] = False
        return results

    async def is_any_available(self) -> bool:
        """Return True if at least one provider is healthy."""
        statuses = await self.health_check_all()
        return any(statuses.values())
