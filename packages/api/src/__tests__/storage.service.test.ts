import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockUserFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
      })),
    },
  },
  createUserClient: vi.fn(() => ({
    from: mockUserFrom,
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

import { storageService } from '../services/storage.service';
import { AppError } from '../lib/errors';

// JPEG magic bytes: FF D8 FF
const JPEG_BUFFER = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
// PNG magic bytes: 89 50 4E 47
const PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should accept valid JPEG file', () => {
      expect(() => storageService.validateFile(JPEG_BUFFER, 'image/jpeg')).not.toThrow();
    });

    it('should accept valid PNG file', () => {
      expect(() => storageService.validateFile(PNG_BUFFER, 'image/png')).not.toThrow();
    });

    it('should reject invalid MIME type', () => {
      try {
        storageService.validateFile(Buffer.from([0x00]), 'application/pdf');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_FILE_TYPE');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('should reject file exceeding 20MB', () => {
      const largeBuffer = Buffer.alloc(21 * 1024 * 1024);
      // Set JPEG magic bytes
      largeBuffer[0] = 0xFF;
      largeBuffer[1] = 0xD8;
      largeBuffer[2] = 0xFF;

      try {
        storageService.validateFile(largeBuffer, 'image/jpeg');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('FILE_TOO_LARGE');
        expect(appErr.statusCode).toBe(413);
      }
    });

    it('should reject file with mismatched magic bytes', () => {
      const fakePng = Buffer.from([0xFF, 0xD8, 0xFF]); // JPEG bytes but claimed PNG

      try {
        storageService.validateFile(fakePng, 'image/png');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_FILE_TYPE');
        expect(appErr.statusCode).toBe(400);
      }
    });
  });

  describe('upload', () => {
    it('should upload file and return signed URL', async () => {
      mockUpload.mockResolvedValue({ data: { path: 'user-1/proj-1/original.jpg' }, error: null });
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://storage.supabase.co/signed/url' },
      });

      const result = await storageService.upload(JPEG_BUFFER, 'image/jpeg', 'user-1', 'proj-1');

      expect(result.image_url).toBe('https://storage.supabase.co/signed/url');
      expect(result.file_size).toBe(JPEG_BUFFER.length);
      expect(result.mime_type).toBe('image/jpeg');
      expect(mockUpload).toHaveBeenCalledWith(
        'user-1/proj-1/original.jpg',
        JPEG_BUFFER,
        { contentType: 'image/jpeg', upsert: true },
      );
    });

    it('should upload PNG with correct extension', async () => {
      mockUpload.mockResolvedValue({ data: { path: 'user-1/proj-1/original.png' }, error: null });
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://storage.supabase.co/signed/png-url' },
      });

      const result = await storageService.upload(PNG_BUFFER, 'image/png', 'user-1', 'proj-1');

      expect(result.mime_type).toBe('image/png');
      expect(mockUpload).toHaveBeenCalledWith(
        'user-1/proj-1/original.png',
        PNG_BUFFER,
        { contentType: 'image/png', upsert: true },
      );
    });

    it('should throw UPLOAD_FAILED on storage error', async () => {
      mockUpload.mockResolvedValue({ data: null, error: { message: 'Storage error' } });

      try {
        await storageService.upload(JPEG_BUFFER, 'image/jpeg', 'user-1', 'proj-1');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UPLOAD_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });
  });

  describe('verifyProjectOwnership', () => {
    it('should not throw when project belongs to user', async () => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({ data: { id: 'proj-1', status: 'draft' }, error: null });
      mockUserFrom.mockReturnValue(chain);

      await expect(
        storageService.verifyProjectOwnership('proj-1', 'user-1', 'token'),
      ).resolves.toBeUndefined();
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      mockUserFrom.mockReturnValue(chain);

      try {
        await storageService.verifyProjectOwnership('proj-1', 'other-user', 'token');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });
});
