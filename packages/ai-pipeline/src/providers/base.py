"""ImageProvider abstract interface for GPU providers."""

from abc import ABC, abstractmethod
from typing import Any


class ImageProvider(ABC):
    """Abstract interface for image generation providers (fal.ai, Replicate)."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""

    @abstractmethod
    async def generate(
        self,
        model: str,
        input_data: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any]:
        """Submit a generation request and return the result.

        Args:
            model: Model identifier (e.g., 'fast-sdxl', 'zoedepth').
            input_data: Model-specific input parameters.
            timeout: Request timeout in seconds.

        Returns:
            Provider response with generation results.

        Raises:
            ProviderError: On provider failure.
        """

    @abstractmethod
    async def get_status(self, request_id: str) -> dict[str, Any]:
        """Get the status of a pending request.

        Args:
            request_id: Provider-specific request ID.

        Returns:
            Status dict with 'status' key ('pending', 'processing', 'completed', 'failed').
        """

    @abstractmethod
    async def get_result(self, request_id: str) -> dict[str, Any]:
        """Get the result of a completed request.

        Args:
            request_id: Provider-specific request ID.

        Returns:
            Result dict with provider-specific output.
        """

    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is reachable and operational.

        Returns:
            True if provider is healthy.
        """


class ProviderError(Exception):
    """Error from an image generation provider."""

    def __init__(
        self,
        message: str,
        provider: str,
        model: str = '',
        error_code: str = 'PROVIDER_ERROR',
        retry_count: int = 0,
    ):
        super().__init__(message)
        self.provider = provider
        self.model = model
        self.error_code = error_code
        self.retry_count = retry_count

    def to_dict(self) -> dict[str, Any]:
        return {
            'error': str(self),
            'provider': self.provider,
            'model': self.model,
            'error_code': self.error_code,
            'retry_count': self.retry_count,
        }
