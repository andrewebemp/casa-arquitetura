import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminFrom = vi.fn();
const mockChannel = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockAdminFrom(...args),
    channel: (...args: unknown[]) => mockChannel(...args),
  },
  createUserClient: vi.fn(),
}));

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    AI_PIPELINE_URL: 'http://localhost:8000',
  },
}));

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockAnalyzeDepth = vi.fn();
const mockGenerate = vi.fn();

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    analyzeDepth: (...args: unknown[]) => mockAnalyzeDepth(...args),
    generate: (...args: unknown[]) => mockGenerate(...args),
  },
}));

vi.mock('../queue/chat.events', () => ({
  chatEvents: {
    broadcast: vi.fn().mockResolvedValue(undefined),
  },
}));

import { processRefinementJob } from '../queue/refinement.handler';

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.then = vi.fn((resolve: (value: unknown) => void) => resolve(result));
  return chain;
}

function mockArrayChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.then = vi.fn((resolve: (value: unknown) => void) => resolve(result));
  return chain;
}

describe('processRefinementJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel.mockReturnValue({
      send: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('should process refinement job, create version, update chat message', async () => {
    const operations = [{ type: 'remove', target: 'tapete', params: {} }];

    const mockJob = {
      data: {
        jobId: 'job-1',
        projectId: 'proj-1',
        userId: 'user-1',
        type: 'refinement',
        inputParams: {
          chat_message_id: 'msg-1',
          operations,
        },
      },
      updateProgress: vi.fn(),
    };

    mockAnalyzeDepth.mockResolvedValue({
      depth_map_url: 'https://example.com/depth.png',
    });

    mockGenerate.mockResolvedValue({
      result_image_url: 'https://example.com/refined.png',
      metadata: {
        provider: 'fal.ai',
        inference_time_ms: 12000,
      },
    });

    let adminCallCount = 0;
    mockAdminFrom.mockImplementation(() => {
      adminCallCount++;
      if (adminCallCount === 1) {
        // update job status to processing
        return mockChain({ data: null, error: null });
      }
      if (adminCallCount === 2) {
        // get latest version
        return mockArrayChain({
          data: { id: 'v1', image_url: 'https://example.com/orig.png', version_number: 1 },
          error: null,
        });
      }
      if (adminCallCount === 3) {
        // get latest version number for next
        return mockArrayChain({
          data: [{ version_number: 1 }],
          error: null,
        });
      }
      if (adminCallCount === 4) {
        // insert project_version
        return mockChain({
          data: { id: 'v2', project_id: 'proj-1', version_number: 2, image_url: 'https://example.com/refined.png' },
          error: null,
        });
      }
      if (adminCallCount === 5) {
        // update chat_message version_id
        return mockChain({ data: null, error: null });
      }
      // update render_job as completed
      return mockChain({ data: null, error: null });
    });

    await processRefinementJob(mockJob as never);

    expect(mockAnalyzeDepth).toHaveBeenCalledWith('https://example.com/orig.png');
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        styleParams: expect.objectContaining({
          refinement: true,
          operations,
        }),
      }),
    );
    expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
  });

  it('should throw when version creation fails', async () => {
    const mockJob = {
      data: {
        jobId: 'job-1',
        projectId: 'proj-1',
        userId: 'user-1',
        type: 'refinement',
        inputParams: {
          chat_message_id: 'msg-1',
          operations: [],
        },
      },
      updateProgress: vi.fn(),
    };

    mockAnalyzeDepth.mockResolvedValue({ depth_map_url: 'depth.png' });
    mockGenerate.mockResolvedValue({
      result_image_url: 'refined.png',
      metadata: { provider: 'fal.ai', inference_time_ms: 5000 },
    });

    let adminCallCount = 0;
    mockAdminFrom.mockImplementation(() => {
      adminCallCount++;
      if (adminCallCount <= 2) {
        return mockChain({ data: { id: 'v1', image_url: 'orig.png', version_number: 1 }, error: null });
      }
      if (adminCallCount === 3) {
        return mockArrayChain({ data: [{ version_number: 1 }], error: null });
      }
      // version insert fails
      return mockChain({ data: null, error: { message: 'insert error' } });
    });

    await expect(processRefinementJob(mockJob as never)).rejects.toThrow(
      'Failed to create project version for refinement',
    );
  });
});
