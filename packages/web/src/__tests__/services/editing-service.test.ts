import {
  segmentAtPoint,
  segmentAll,
  getMaterials,
  applyMaterial,
  analyzeLighting,
  enhanceLighting,
  detectObject,
  removeObject,
  batchRemoveObjects,
  getQuota,
  getEditHistory,
  revertToEdit,
} from '@/services/editing-service';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
});

describe('Segmentation API', () => {
  it('segmentAtPoint sends correct request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ segments: [], job_id: 'j1' }),
    });

    const result = await segmentAtPoint('proj-1', 0.5, 0.3);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/segment',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ x: 0.5, y: 0.3 }),
      })
    );
    expect(result.job_id).toBe('j1');
  });

  it('segmentAtPoint throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(segmentAtPoint('proj-1', 0.5, 0.3)).rejects.toThrow('Falha ao segmentar elemento');
  });

  it('segmentAll sends POST to /segment/all', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ segments: [], job_id: 'j2' }),
    });

    await segmentAll('proj-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/segment/all',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('getMaterials fetches materials for segment', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ materials: [{ id: 'm1', name: 'Madeira' }] }),
    });

    const result = await getMaterials('proj-1', 'seg-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/segment/seg-1/materials',
      expect.any(Object)
    );
    expect(result.materials).toHaveLength(1);
  });

  it('applyMaterial sends segment_id and descriptor', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ job_id: 'j3', version_id: 'v1' }),
    });

    await applyMaterial('proj-1', 'seg-1', 'marmore branco');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/segment/apply',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ segment_id: 'seg-1', material_descriptor: 'marmore branco' }),
      })
    );
  });
});

describe('Lighting API', () => {
  it('analyzeLighting sends analyze_only flag', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ brightness_score: 35, job_id: 'j4' }),
    });

    const result = await analyzeLighting('proj-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/enhance-lighting',
      expect.objectContaining({
        body: JSON.stringify({ analyze_only: true }),
      })
    );
    expect(result.brightness_score).toBe(35);
  });

  it('enhanceLighting sends mode and auto_enhance', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ job_id: 'j5', version_id: 'v2' }),
    });

    await enhanceLighting('proj-1', 'natural');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/enhance-lighting',
      expect.objectContaining({
        body: JSON.stringify({ mode: 'natural', auto_enhance: true }),
      })
    );
  });
});

describe('Object Removal API', () => {
  it('detectObject sends coordinates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ mask_id: 'm1', label: 'Entulho', mask_polygon: [], confidence: 0.9 }),
    });

    const result = await detectObject('proj-1', 0.4, 0.6);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/remove-object',
      expect.objectContaining({
        body: JSON.stringify({ x: 0.4, y: 0.6 }),
      })
    );
    expect(result.mask_id).toBe('m1');
  });

  it('removeObject sends mask_id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ job_id: 'j6', version_id: 'v3' }),
    });

    await removeObject('proj-1', 'm1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/remove-object/apply',
      expect.objectContaining({
        body: JSON.stringify({ mask_id: 'm1' }),
      })
    );
  });

  it('batchRemoveObjects sends mask_ids array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ job_id: 'j7', version_id: 'v4' }),
    });

    await batchRemoveObjects('proj-1', ['m1', 'm2', 'm3']);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/remove-object/batch',
      expect.objectContaining({
        body: JSON.stringify({ mask_ids: ['m1', 'm2', 'm3'] }),
      })
    );
  });
});

describe('Quota API', () => {
  it('getQuota returns quota data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ renders_remaining: 5, renders_limit: 10, renders_used: 5, tier: 'pro' }),
    });

    const result = await getQuota('proj-1');

    expect(result.renders_remaining).toBe(5);
  });
});

describe('Edit History API', () => {
  it('getEditHistory returns edits array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ edits: [{ id: 'e1', type: 'material_swap' }] }),
    });

    const result = await getEditHistory('proj-1');

    expect(result).toHaveLength(1);
  });

  it('revertToEdit sends POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await revertToEdit('proj-1', 'e1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects/proj-1/edits/e1/revert',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
