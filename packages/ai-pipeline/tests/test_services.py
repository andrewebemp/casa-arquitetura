"""Unit tests for services (AC2, AC3, AC4, AC5)."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from src.providers.base import ProviderError
from src.providers.factory import ProviderFactory
from src.services.spatial import SpatialService
from src.services.style import StyleService
from src.services.upscale import UpscaleService
from src.services.generation import GenerationService


def make_factory():
    return ProviderFactory(
        primary='fal',
        fal_api_key='test-key',
        replicate_api_token='test-token',
    )


class TestSpatialService:
    @pytest.mark.asyncio
    async def test_estimate_depth_success(self):
        factory = make_factory()
        service = SpatialService(factory)

        mock_result = {
            'image': {'url': 'https://example.com/depth.png'},
            'spatial_data': {'width_m': 5.0, 'length_m': 6.0, 'height_m': 3.0},
            'detected_features': [
                {'type': 'door', 'confidence': 0.9, 'position': {'x': 0.5, 'y': 0.8}},
            ],
            '_meta': {'provider': 'fal', 'inference_time_ms': 500},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            result = await service.estimate_depth('https://example.com/room.jpg')
            assert result.depth_map_url == 'https://example.com/depth.png'
            assert result.estimated_dimensions.width_m == 5.0
            assert len(result.detected_features) == 1
            assert result.detected_features[0].type == 'door'
            assert result.provider == 'fal'

    @pytest.mark.asyncio
    async def test_estimate_depth_default_dimensions(self):
        factory = make_factory()
        service = SpatialService(factory)

        mock_result = {
            'output': ['https://example.com/depth.png'],
            '_meta': {'provider': 'fal', 'inference_time_ms': 300},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            result = await service.estimate_depth('https://example.com/room.jpg')
            assert result.estimated_dimensions.width_m == 4.0
            assert result.estimated_dimensions.length_m == 5.0
            assert result.estimated_dimensions.height_m == 2.8


class TestStyleService:
    @pytest.mark.asyncio
    async def test_extract_style_success(self):
        factory = make_factory()
        service = StyleService(factory)

        mock_result = {
            'embedding': [0.1, 0.2, 0.3],
            '_meta': {'provider': 'fal', 'inference_time_ms': 200},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            result = await service.extract_style('moderno')
            assert 'modern interior design' in result.style_prompt
            assert result.clip_embeddings == [0.1, 0.2, 0.3]
            assert result.controlnet_params.depth_strength == 0.7

    @pytest.mark.asyncio
    async def test_extract_style_with_reference(self):
        factory = make_factory()
        service = StyleService(factory)

        mock_result = {
            'embedding': [0.5, 0.6],
            '_meta': {'provider': 'fal', 'inference_time_ms': 300},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result) as mock_gen:
            result = await service.extract_style('luxo', 'https://example.com/ref.jpg')
            assert 'luxury interior design' in result.style_prompt
            call_args = mock_gen.call_args
            assert 'image_url' in call_args.kwargs.get('input_data', call_args[1].get('input_data', {}))

    @pytest.mark.asyncio
    async def test_extract_style_clip_failure_graceful(self):
        factory = make_factory()
        service = StyleService(factory)

        with patch.object(
            factory, 'generate_with_fallback',
            new_callable=AsyncMock,
            side_effect=ProviderError('fail', provider='fal'),
        ):
            result = await service.extract_style('industrial')
            assert 'industrial interior design' in result.style_prompt
            assert result.clip_embeddings == []

    @pytest.mark.asyncio
    async def test_all_styles_have_prompts(self):
        from src.services.style import STYLE_PROMPTS, STYLE_CONTROLNET
        styles = ['moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
                  'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo']
        for style in styles:
            assert style in STYLE_PROMPTS
            assert style in STYLE_CONTROLNET
            assert 'prompt' in STYLE_PROMPTS[style]
            assert 'negative' in STYLE_PROMPTS[style]


class TestUpscaleService:
    @pytest.mark.asyncio
    async def test_upscale_success(self):
        factory = make_factory()
        service = UpscaleService(factory)

        mock_result = {
            'image': {'url': 'https://example.com/upscaled.png'},
            '_meta': {'provider': 'fal', 'inference_time_ms': 400},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            result = await service.upscale('https://example.com/img.png', scale=2)
            assert result['image_url'] == 'https://example.com/upscaled.png'


class TestGenerationService:
    @pytest.mark.asyncio
    async def test_generate_1024_no_upscale(self):
        factory = make_factory()
        upscale = UpscaleService(factory)
        service = GenerationService(factory, upscale)

        mock_result = {
            'images': [{'url': 'https://example.com/gen.png'}],
            '_meta': {'provider': 'fal', 'model': 'fast-sdxl', 'inference_time_ms': 1000},
        }

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            result = await service.generate(
                source_image_url='https://example.com/room.jpg',
                depth_map_url='https://example.com/depth.png',
                style_params={'style_prompt': 'test', 'negative_prompt': 'bad'},
                output_resolution='1024x1024',
            )
            assert result.result_image_url == 'https://example.com/gen.png'
            assert result.metadata.upscaled is False

    @pytest.mark.asyncio
    async def test_generate_2048_with_upscale(self):
        factory = make_factory()
        upscale = UpscaleService(factory)
        service = GenerationService(factory, upscale)

        gen_result = {
            'images': [{'url': 'https://example.com/gen.png'}],
            '_meta': {'provider': 'fal', 'model': 'fast-sdxl', 'inference_time_ms': 1000},
        }
        upscale_result = {
            'image': {'url': 'https://example.com/upscaled.png'},
            '_meta': {'provider': 'fal', 'inference_time_ms': 400},
        }

        call_count = 0

        async def mock_generate(model, input_data, timeout=30.0):
            nonlocal call_count
            call_count += 1
            if model == 'fast-sdxl':
                return gen_result
            return upscale_result

        with patch.object(factory, 'generate_with_fallback', side_effect=mock_generate):
            result = await service.generate(
                source_image_url='https://example.com/room.jpg',
                depth_map_url='https://example.com/depth.png',
                style_params={'style_prompt': 'test'},
                output_resolution='2048x2048',
            )
            assert result.result_image_url == 'https://example.com/upscaled.png'
            assert result.metadata.upscaled is True

    @pytest.mark.asyncio
    async def test_generate_sends_progress_callback(self):
        factory = make_factory()
        upscale = UpscaleService(factory)
        service = GenerationService(factory, upscale)

        mock_result = {
            'images': [{'url': 'https://example.com/gen.png'}],
            '_meta': {'provider': 'fal', 'model': 'fast-sdxl', 'inference_time_ms': 500},
        }

        callback_calls = []

        async def mock_post(url, json=None, **kwargs):
            callback_calls.append(json)
            return MagicMock(status_code=200)

        with patch.object(factory, 'generate_with_fallback', new_callable=AsyncMock, return_value=mock_result):
            with patch('httpx.AsyncClient') as mock_client_cls:
                mock_client_instance = AsyncMock()
                mock_client_instance.post = mock_post
                mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
                mock_client_instance.__aexit__ = AsyncMock(return_value=False)
                mock_client_cls.return_value = mock_client_instance

                result = await service.generate(
                    source_image_url='https://example.com/room.jpg',
                    depth_map_url='https://example.com/depth.png',
                    style_params={},
                    output_resolution='1024x1024',
                    callback_url='https://example.com/callback',
                )

            assert len(callback_calls) > 0
            stages = [c['stage'] for c in callback_calls]
            assert 'generation' in stages
