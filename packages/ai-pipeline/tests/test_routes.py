"""Unit tests for FastAPI routes using TestClient (AC2-AC7)."""

import pytest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from src.main import app
from src.api.deps import get_pipeline_config, get_provider_factory
from src.config import PipelineConfig
from src.providers.factory import ProviderFactory
from src.providers.base import ProviderError
from src.models.schemas import (
    DepthEstimationResponse,
    EstimatedDimensions,
    StyleExtractionResponse,
    ControlNetParams,
    GenerationResponse,
    GenerationMetadata,
)


# Test config with no auth required
test_config = PipelineConfig(
    ai_provider_primary='fal',
    fal_api_key='test-key',
    replicate_api_token='test-token',
    pipeline_api_key='test-pipeline-key',
)


def override_config():
    return test_config


def override_factory():
    return ProviderFactory(
        primary='fal',
        fal_api_key='test-key',
        replicate_api_token='test-token',
    )


app.dependency_overrides[get_pipeline_config] = override_config
app.dependency_overrides[get_provider_factory] = override_factory

client = TestClient(app)
HEADERS = {'X-Pipeline-Key': 'test-pipeline-key'}


class TestHealthRoutes:
    def test_health_check(self):
        with patch.object(
            ProviderFactory, 'health_check_all',
            new_callable=AsyncMock,
            return_value={'fal': True, 'replicate': False},
        ):
            response = client.get('/health')
            assert response.status_code == 200
            data = response.json()
            assert data['status'] == 'ok'
            assert len(data['providers']) == 2

    def test_ready_when_available(self):
        with patch.object(
            ProviderFactory, 'is_any_available',
            new_callable=AsyncMock,
            return_value=True,
        ):
            response = client.get('/ready')
            assert response.status_code == 200
            assert response.json()['ready'] is True

    def test_ready_when_unavailable(self):
        with patch.object(
            ProviderFactory, 'is_any_available',
            new_callable=AsyncMock,
            return_value=False,
        ):
            response = client.get('/ready')
            assert response.status_code == 503


class TestAuthMiddleware:
    def test_missing_api_key(self):
        response = client.post('/analyze/depth', json={'image_url': 'https://example.com/img.jpg'})
        assert response.status_code == 422  # Missing header

    def test_invalid_api_key(self):
        response = client.post(
            '/analyze/depth',
            json={'image_url': 'https://example.com/img.jpg'},
            headers={'X-Pipeline-Key': 'wrong-key'},
        )
        assert response.status_code == 401


class TestDepthRoute:
    def test_analyze_depth_success(self):
        mock_result = {
            'image': {'url': 'https://example.com/depth.png'},
            '_meta': {'provider': 'fal', 'inference_time_ms': 500},
        }

        with patch.object(
            ProviderFactory, 'generate_with_fallback',
            new_callable=AsyncMock,
            return_value=mock_result,
        ):
            response = client.post(
                '/analyze/depth',
                json={'image_url': 'https://example.com/room.jpg'},
                headers=HEADERS,
            )
            assert response.status_code == 200
            data = response.json()
            assert 'depth_map_url' in data
            assert 'estimated_dimensions' in data

    def test_analyze_depth_provider_error(self):
        with patch.object(
            ProviderFactory, 'generate_with_fallback',
            new_callable=AsyncMock,
            side_effect=ProviderError('fail', provider='fal', model='zoedepth'),
        ):
            response = client.post(
                '/analyze/depth',
                json={'image_url': 'https://example.com/room.jpg'},
                headers=HEADERS,
            )
            assert response.status_code == 502


class TestStyleRoute:
    def test_analyze_style_success(self):
        mock_result = {
            'embedding': [0.1, 0.2],
            '_meta': {'provider': 'fal', 'inference_time_ms': 200},
        }

        with patch.object(
            ProviderFactory, 'generate_with_fallback',
            new_callable=AsyncMock,
            return_value=mock_result,
        ):
            response = client.post(
                '/analyze/style',
                json={'style': 'moderno'},
                headers=HEADERS,
            )
            assert response.status_code == 200
            data = response.json()
            assert 'style_prompt' in data
            assert 'negative_prompt' in data
            assert 'controlnet_params' in data

    def test_analyze_style_invalid_style(self):
        response = client.post(
            '/analyze/style',
            json={'style': 'invalid_style'},
            headers=HEADERS,
        )
        assert response.status_code == 422


class TestGenerateRoute:
    def test_generate_success(self):
        gen_result = {
            'images': [{'url': 'https://example.com/gen.png'}],
            '_meta': {'provider': 'fal', 'model': 'fast-sdxl', 'inference_time_ms': 1000},
        }

        with patch.object(
            ProviderFactory, 'generate_with_fallback',
            new_callable=AsyncMock,
            return_value=gen_result,
        ):
            response = client.post(
                '/generate',
                json={
                    'source_image_url': 'https://example.com/room.jpg',
                    'depth_map_url': 'https://example.com/depth.png',
                    'style_params': {'style_prompt': 'modern'},
                    'output_resolution': '1024x1024',
                },
                headers=HEADERS,
            )
            assert response.status_code == 200
            data = response.json()
            assert 'result_image_url' in data
            assert 'metadata' in data

    def test_generate_invalid_resolution(self):
        response = client.post(
            '/generate',
            json={
                'source_image_url': 'https://example.com/room.jpg',
                'depth_map_url': 'https://example.com/depth.png',
                'style_params': {},
                'output_resolution': '512x512',
            },
            headers=HEADERS,
        )
        assert response.status_code == 422
