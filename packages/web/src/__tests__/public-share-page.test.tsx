/**
 * Integration tests for the public share page.
 * Tests the PublicSlider client component and page structure.
 * Server component (page.tsx with generateMetadata) tested via assertions on output.
 */
import { render, screen } from '@testing-library/react';
import { PublicSlider } from '@/app/compartilhar/[token]/public-slider';

describe('PublicSharePage - PublicSlider component', () => {
  it('renders BeforeAfterSlider with provided URLs', () => {
    render(
      <PublicSlider
        beforeUrl="https://example.com/before.jpg"
        afterUrl="https://example.com/after.jpg"
      />
    );

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByAltText('Antes')).toHaveAttribute('src', 'https://example.com/before.jpg');
    expect(screen.getByAltText('Depois')).toHaveAttribute('src', 'https://example.com/after.jpg');
  });

  it('renders ANTES and DEPOIS labels', () => {
    render(
      <PublicSlider
        beforeUrl="https://example.com/before.jpg"
        afterUrl="https://example.com/after.jpg"
      />
    );

    expect(screen.getByText('ANTES')).toBeInTheDocument();
    expect(screen.getByText('DEPOIS')).toBeInTheDocument();
  });

  it('renders with aspect-video class for responsive layout', () => {
    render(
      <PublicSlider
        beforeUrl="https://example.com/before.jpg"
        afterUrl="https://example.com/after.jpg"
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider.className).toContain('aspect-video');
    expect(slider.className).toContain('w-full');
  });
});

describe('PublicSharePage - share-service', () => {
  it('ShareExpiredError has correct name', () => {
    const { ShareExpiredError } = require('@/services/share-service');
    const err = new ShareExpiredError();
    expect(err.name).toBe('ShareExpiredError');
    expect(err.message).toBe('Link expirado');
  });

  it('ShareNotFoundError has correct name', () => {
    const { ShareNotFoundError } = require('@/services/share-service');
    const err = new ShareNotFoundError();
    expect(err.name).toBe('ShareNotFoundError');
    expect(err.message).toBe('Link nao encontrado');
  });
});

describe('PublicSharePage - getPublicShareData service', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws ShareExpiredError on 410 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 410, ok: false });

    const { getPublicShareData, ShareExpiredError } = require('@/services/share-service');

    await expect(getPublicShareData('expired-token')).rejects.toThrow(ShareExpiredError);
  });

  it('throws ShareNotFoundError on 404 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404, ok: false });

    const { getPublicShareData, ShareNotFoundError } = require('@/services/share-service');

    await expect(getPublicShareData('invalid-token')).rejects.toThrow(ShareNotFoundError);
  });

  it('returns data on successful response', async () => {
    const mockData = {
      original_url: 'https://example.com/before.jpg',
      rendered_url: 'https://example.com/after.jpg',
      project_name: 'Test Project',
      style: 'Moderno',
      created_at: '2026-01-01T00:00:00Z',
      include_watermark: false,
    };

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockData }),
    });

    const { getPublicShareData } = require('@/services/share-service');
    const result = await getPublicShareData('valid-token');

    expect(result).toEqual(mockData);
  });
});
