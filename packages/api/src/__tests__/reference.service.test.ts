import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageCreateSignedUrl = vi.fn();
const mockStorageRemove = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        upload: mockStorageUpload,
        createSignedUrl: mockStorageCreateSignedUrl,
        remove: mockStorageRemove,
      })),
    },
  },
  createUserClient: vi.fn(() => ({
    from: mockFrom,
  })),
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

import { referenceService } from '../services/reference.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

// JPEG magic bytes
const JPEG_BUFFER = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
const PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);

describe('referenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should accept valid JPEG file', () => {
      expect(() => referenceService.validateFile(JPEG_BUFFER, 'image/jpeg')).not.toThrow();
    });

    it('should accept valid PNG file', () => {
      expect(() => referenceService.validateFile(PNG_BUFFER, 'image/png')).not.toThrow();
    });

    it('should reject invalid mime type', () => {
      try {
        referenceService.validateFile(JPEG_BUFFER, 'image/gif');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_FILE_TYPE');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('should reject file exceeding 10MB', () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      largeBuffer[0] = 0xFF;
      largeBuffer[1] = 0xD8;
      largeBuffer[2] = 0xFF;

      try {
        referenceService.validateFile(largeBuffer, 'image/jpeg');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('FILE_TOO_LARGE');
        expect(appErr.statusCode).toBe(413);
      }
    });

    it('should reject file with mismatched magic bytes', () => {
      try {
        referenceService.validateFile(JPEG_BUFFER, 'image/png');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_FILE_TYPE');
        expect(appErr.statusCode).toBe(400);
      }
    });
  });

  describe('verifyProjectOwnership', () => {
    it('should pass when user owns the project', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      await expect(referenceService.verifyProjectOwnership(PROJECT_ID, USER_ID, TOKEN)).resolves.not.toThrow();
    });

    it('should throw PROJECT_NOT_FOUND when user does not own project', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await referenceService.verifyProjectOwnership(PROJECT_ID, USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('create', () => {
    it('should create reference item with image upload', async () => {
      const mockItem = {
        id: 'ref-1',
        project_id: PROJECT_ID,
        name: 'Sofa L-shape',
        image_url: '',
        width_m: 2.2,
        depth_m: 0.95,
        height_m: 0.85,
        material: 'linen',
        color: 'gray',
        position_description: 'facing window',
        created_at: '2026-01-01T00:00:00Z',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // insert
          return mockChain({ data: mockItem, error: null });
        }
        // update image_url
        return mockChain({ data: { ...mockItem, image_url: 'https://signed-url.com/ref-1.jpg' }, error: null });
      });

      mockStorageUpload.mockResolvedValue({ error: null });
      mockStorageCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://signed-url.com/ref-1.jpg' },
      });

      const result = await referenceService.create(
        PROJECT_ID,
        USER_ID,
        {
          name: 'Sofa L-shape',
          width_m: 2.2,
          depth_m: 0.95,
          height_m: 0.85,
          material: 'linen',
          color: 'gray',
          position_description: 'facing window',
        },
        JPEG_BUFFER,
        'image/jpeg',
        TOKEN,
      );

      expect(result.name).toBe('Sofa L-shape');
      expect(result.image_url).toBe('https://signed-url.com/ref-1.jpg');
      expect(mockStorageUpload).toHaveBeenCalled();
    });

    it('should throw REFERENCE_CREATE_FAILED on insert error', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Insert failed' } }));

      try {
        await referenceService.create(
          PROJECT_ID, USER_ID,
          { name: 'Test' },
          JPEG_BUFFER, 'image/jpeg', TOKEN,
        );
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('REFERENCE_CREATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });

    it('should clean up item and throw on upload failure', async () => {
      const mockItem = { id: 'ref-1', project_id: PROJECT_ID, name: 'Test', image_url: '' };
      const deleteChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockChain({ data: mockItem, error: null });
        return deleteChain;
      });

      mockStorageUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

      try {
        await referenceService.create(
          PROJECT_ID, USER_ID,
          { name: 'Test' },
          JPEG_BUFFER, 'image/jpeg', TOKEN,
        );
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPLOAD_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });
  });

  describe('list', () => {
    it('should return all reference items ordered by created_at', async () => {
      const items = [
        { id: 'ref-1', name: 'Item 1', created_at: '2026-01-01' },
        { id: 'ref-2', name: 'Item 2', created_at: '2026-01-02' },
        { id: 'ref-3', name: 'Item 3', created_at: '2026-01-03' },
      ];

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        const chain = mockChain({ data: items, error: null });
        chain.order = vi.fn().mockResolvedValue({ data: items, error: null });
        return chain;
      });

      const result = await referenceService.list(PROJECT_ID, USER_ID, TOKEN);
      expect(result).toHaveLength(3);
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await referenceService.list(PROJECT_ID, USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('getById', () => {
    it('should return reference item with fresh signed URL', async () => {
      const mockItem = {
        id: 'ref-1',
        project_id: PROJECT_ID,
        name: 'Sofa',
        image_url: 'user-123/proj-123/references/ref-1.jpg',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        return mockChain({ data: mockItem, error: null });
      });

      mockStorageCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://fresh-signed-url.com' },
      });

      const result = await referenceService.getById(PROJECT_ID, 'ref-1', USER_ID, TOKEN);
      expect(result.image_url).toBe('https://fresh-signed-url.com');
    });

    it('should throw REFERENCE_NOT_FOUND when item does not exist', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        return mockChain({ data: null, error: { code: 'PGRST116' } });
      });

      try {
        await referenceService.getById(PROJECT_ID, 'nonexistent', USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('REFERENCE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('delete', () => {
    it('should delete reference item and clean up storage', async () => {
      const mockItem = {
        id: 'ref-1',
        image_url: 'user-123/proj-123/references/ref-1.jpg',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        if (callCount === 2) {
          return mockChain({ data: mockItem, error: null });
        }
        // delete chain
        const chain = mockChain({ data: null, error: null });
        const deleteChain: Record<string, unknown> = {};
        deleteChain.delete = vi.fn().mockReturnValue(deleteChain);
        deleteChain.eq = vi.fn().mockReturnValue(deleteChain);
        (deleteChain as { then: unknown }).then = (cb: (v: unknown) => unknown) =>
          Promise.resolve({ data: null, error: null }).then(cb);
        return deleteChain;
      });

      mockStorageRemove.mockResolvedValue({ error: null });

      await expect(referenceService.delete(PROJECT_ID, 'ref-1', USER_ID, TOKEN)).resolves.not.toThrow();
    });

    it('should throw REFERENCE_NOT_FOUND when item does not exist', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        return mockChain({ data: null, error: null });
      });

      try {
        await referenceService.delete(PROJECT_ID, 'nonexistent', USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('REFERENCE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await referenceService.delete(PROJECT_ID, 'ref-1', USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('extractStoragePath', () => {
    it('should return path from non-URL string', () => {
      const path = referenceService.extractStoragePath('user/proj/references/ref-1.jpg');
      expect(path).toBe('user/proj/references/ref-1.jpg');
    });

    it('should return null for empty string', () => {
      expect(referenceService.extractStoragePath('')).toBeNull();
    });

    it('should extract path from signed URL', () => {
      const url = 'https://test.supabase.co/storage/v1/object/sign/project-images/user/proj/references/ref-1.jpg?token=abc';
      const path = referenceService.extractStoragePath(url);
      expect(path).toBe('user/proj/references/ref-1.jpg');
    });
  });
});
