import { createHmac } from 'node:crypto';
import { env } from '../config/env';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';

const PUBLIC_TTL_SECONDS = 30 * 24 * 3600; // 30 days
const AUTHENTICATED_TTL_SECONDS = 24 * 3600; // 24 hours

interface CdnUrlOptions {
  storagePath: string;
  isPublic: boolean;
}

interface CacheHeaders {
  'Cache-Control': string;
  'ETag': string;
  'CDN-Cache-Control': string;
}

export const imageCdnService = {
  getCdnBaseUrl(): string {
    return env.CDN_BASE_URL || '';
  },

  rewriteToCdnUrl(supabaseUrl: string): string {
    const cdnBase = this.getCdnBaseUrl();
    if (!cdnBase) return supabaseUrl;

    try {
      const url = new URL(supabaseUrl);
      const path = url.pathname + url.search;
      return `${cdnBase.replace(/\/$/, '')}${path}`;
    } catch {
      return supabaseUrl;
    }
  },

  async generateSignedUrl(options: CdnUrlOptions): Promise<string> {
    const ttl = options.isPublic ? PUBLIC_TTL_SECONDS : AUTHENTICATED_TTL_SECONDS;

    const { data, error } = await supabaseAdmin.storage
      .from('project-images')
      .createSignedUrl(options.storagePath, ttl);

    if (error || !data?.signedUrl) {
      logger.error({ err: error, path: options.storagePath }, 'Failed to generate signed URL');
      return options.storagePath;
    }

    const cdnBase = this.getCdnBaseUrl();
    if (cdnBase) {
      return this.rewriteToCdnUrl(data.signedUrl);
    }

    return data.signedUrl;
  },

  generateCacheHeaders(options: { isPublic: boolean; etag: string }): CacheHeaders {
    const maxAge = options.isPublic ? PUBLIC_TTL_SECONDS : AUTHENTICATED_TTL_SECONDS;

    return {
      'Cache-Control': options.isPublic
        ? `public, max-age=${maxAge}, immutable`
        : `private, max-age=${maxAge}, must-revalidate`,
      'ETag': `"${options.etag}"`,
      'CDN-Cache-Control': `max-age=${maxAge}`,
    };
  },

  generateETag(content: string): string {
    return createHmac('sha256', 'decorai-etag')
      .update(content)
      .digest('hex')
      .slice(0, 16);
  },

  async getPublicImageUrl(storagePath: string): Promise<string> {
    return this.generateSignedUrl({ storagePath, isPublic: true });
  },

  async getAuthenticatedImageUrl(storagePath: string): Promise<string> {
    return this.generateSignedUrl({ storagePath, isPublic: false });
  },

  /**
   * Resolve an image URL for API responses.
   * Handles both storage paths (new) and legacy signed URLs (old data).
   * - Storage path (e.g. "userId/projectId/original.jpg") → fresh signed URL with CDN rewrite
   * - Full URL (https://...) → return as-is (legacy data, still valid or already expired)
   * - null/undefined → null
   */
  async resolveImageUrl(urlOrPath: string | null | undefined): Promise<string | null> {
    if (!urlOrPath) return null;

    // If it's already a full URL, return as-is (legacy data)
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      return urlOrPath;
    }

    // It's a storage path — generate a fresh signed URL
    try {
      return await this.generateSignedUrl({ storagePath: urlOrPath, isPublic: true });
    } catch (err) {
      logger.error({ err, path: urlOrPath }, 'Failed to resolve image URL');
      return null;
    }
  },
};
