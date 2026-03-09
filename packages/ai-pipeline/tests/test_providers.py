"""Unit tests for provider clients and factory (AC1, AC7)."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from src.providers.base import ImageProvider, ProviderError
from src.providers.fal_provider import FalProvider
from src.providers.replicate_provider import ReplicateProvider
from src.providers.factory import ProviderFactory


class TestProviderError:
    def test_to_dict(self):
        err = ProviderError(
            'test error',
            provider='fal',
            model='fast-sdxl',
            error_code='TIMEOUT',
            retry_count=2,
        )
        d = err.to_dict()
        assert d['provider'] == 'fal'
        assert d['model'] == 'fast-sdxl'
        assert d['error_code'] == 'TIMEOUT'
        assert d['retry_count'] == 2
        assert 'test error' in d['error']


class TestFalProvider:
    def test_name(self):
        provider = FalProvider(api_key='test-key')
        assert provider.name == 'fal'

    @pytest.mark.asyncio
    async def test_generate_success(self):
        provider = FalProvider(api_key='test-key')
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'images': [{'url': 'https://example.com/result.png'}],
        }
        mock_response.raise_for_status = MagicMock()

        with patch.object(provider._client, 'post', new_callable=AsyncMock, return_value=mock_response):
            result = await provider.generate('fast-sdxl', {'prompt': 'test'})
            assert '_meta' in result
            assert result['_meta']['provider'] == 'fal'

    @pytest.mark.asyncio
    async def test_generate_timeout(self):
        import httpx
        provider = FalProvider(api_key='test-key')

        with patch.object(
            provider._client, 'post',
            new_callable=AsyncMock,
            side_effect=httpx.TimeoutException('timeout'),
        ):
            with pytest.raises(ProviderError) as exc_info:
                await provider.generate('fast-sdxl', {}, timeout=5.0)
            assert exc_info.value.error_code == 'TIMEOUT'

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        provider = FalProvider(api_key='test-key')
        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch.object(provider._client, 'get', new_callable=AsyncMock, return_value=mock_response):
            assert await provider.health_check() is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        import httpx
        provider = FalProvider(api_key='test-key')

        with patch.object(
            provider._client, 'get',
            new_callable=AsyncMock,
            side_effect=httpx.ConnectError('connection refused'),
        ):
            assert await provider.health_check() is False


class TestReplicateProvider:
    def test_name(self):
        provider = ReplicateProvider(api_token='test-token')
        assert provider.name == 'replicate'

    @pytest.mark.asyncio
    async def test_generate_success(self):
        provider = ReplicateProvider(api_token='test-token')

        create_response = MagicMock()
        create_response.status_code = 201
        create_response.json.return_value = {'id': 'pred-123', 'status': 'starting'}
        create_response.raise_for_status = MagicMock()

        poll_response = MagicMock()
        poll_response.status_code = 200
        poll_response.json.return_value = {
            'id': 'pred-123',
            'status': 'succeeded',
            'output': ['https://example.com/result.png'],
        }
        poll_response.raise_for_status = MagicMock()

        with patch.object(
            provider._client, 'post',
            new_callable=AsyncMock,
            return_value=create_response,
        ), patch.object(
            provider._client, 'get',
            new_callable=AsyncMock,
            return_value=poll_response,
        ):
            result = await provider.generate('fast-sdxl', {'prompt': 'test'})
            assert '_meta' in result
            assert result['_meta']['provider'] == 'replicate'


class TestProviderFactory:
    def test_primary_secondary(self):
        factory = ProviderFactory(
            primary='fal',
            fal_api_key='key1',
            replicate_api_token='key2',
        )
        assert factory.primary_provider is not None
        assert factory.primary_provider.name == 'fal'
        assert factory.secondary_provider is not None
        assert factory.secondary_provider.name == 'replicate'

    def test_no_providers(self):
        factory = ProviderFactory(primary='fal')
        assert factory.primary_provider is None
        assert factory.secondary_provider is None

    @pytest.mark.asyncio
    async def test_generate_with_fallback_primary_succeeds(self):
        factory = ProviderFactory(
            primary='fal',
            fal_api_key='key1',
            replicate_api_token='key2',
        )
        mock_result = {'images': [{'url': 'test.png'}], '_meta': {'provider': 'fal'}}

        with patch.object(
            factory.primary_provider, 'generate',
            new_callable=AsyncMock,
            return_value=mock_result,
        ):
            result = await factory.generate_with_fallback('fast-sdxl', {})
            assert result['_meta']['provider'] == 'fal'

    @pytest.mark.asyncio
    async def test_generate_with_fallback_falls_to_secondary(self):
        factory = ProviderFactory(
            primary='fal',
            fal_api_key='key1',
            replicate_api_token='key2',
        )
        fallback_result = {'output': ['test.png'], '_meta': {'provider': 'replicate'}}

        with patch.object(
            factory.primary_provider, 'generate',
            new_callable=AsyncMock,
            side_effect=ProviderError('fail', provider='fal', model='fast-sdxl'),
        ), patch.object(
            factory.secondary_provider, 'generate',
            new_callable=AsyncMock,
            return_value=fallback_result,
        ):
            result = await factory.generate_with_fallback('fast-sdxl', {})
            assert result['_meta']['provider'] == 'replicate'

    @pytest.mark.asyncio
    async def test_generate_with_fallback_all_fail(self):
        factory = ProviderFactory(
            primary='fal',
            fal_api_key='key1',
            replicate_api_token='key2',
        )

        with patch.object(
            factory.primary_provider, 'generate',
            new_callable=AsyncMock,
            side_effect=ProviderError('fail', provider='fal', model='x'),
        ), patch.object(
            factory.secondary_provider, 'generate',
            new_callable=AsyncMock,
            side_effect=ProviderError('fail too', provider='replicate', model='x'),
        ):
            with pytest.raises(ProviderError) as exc_info:
                await factory.generate_with_fallback('fast-sdxl', {})
            assert exc_info.value.error_code == 'ALL_PROVIDERS_FAILED'

    @pytest.mark.asyncio
    async def test_generate_no_providers_configured(self):
        factory = ProviderFactory(primary='fal')
        with pytest.raises(ProviderError) as exc_info:
            await factory.generate_with_fallback('fast-sdxl', {})
        assert exc_info.value.error_code == 'NO_PROVIDERS'

    @pytest.mark.asyncio
    async def test_health_check_all(self):
        factory = ProviderFactory(
            primary='fal',
            fal_api_key='key1',
        )

        with patch.object(
            factory.primary_provider, 'health_check',
            new_callable=AsyncMock,
            return_value=True,
        ):
            result = await factory.health_check_all()
            assert result['fal'] is True
