import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return false;

  if (buffer.length < expected.length) return false;

  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false;
  }

  return true;
}

function getExtension(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  return 'bin';
}

export const storageService = {
  validateFile(buffer: Buffer, mimeType: string): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new AppError({
        code: 'INVALID_FILE_TYPE',
        message: 'Apenas arquivos JPEG e PNG sao permitidos',
        statusCode: 400,
      });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new AppError({
        code: 'FILE_TOO_LARGE',
        message: 'Arquivo deve ter no maximo 20MB',
        statusCode: 413,
      });
    }

    if (!validateMagicBytes(buffer, mimeType)) {
      throw new AppError({
        code: 'INVALID_FILE_TYPE',
        message: 'Conteudo do arquivo nao corresponde ao tipo declarado',
        statusCode: 400,
      });
    }
  },

  async upload(
    buffer: Buffer,
    mimeType: string,
    userId: string,
    projectId: string,
  ): Promise<{ image_url: string; file_size: number; mime_type: string }> {
    const ext = getExtension(mimeType);
    const path = `${userId}/${projectId}/original.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('project-images')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      logger.error({ err: error, path }, 'Failed to upload file to storage');
      throw new AppError({
        code: 'UPLOAD_FAILED',
        message: 'Falha ao fazer upload do arquivo',
        statusCode: 500,
      });
    }

    const { data: signedUrl } = await supabaseAdmin.storage
      .from('project-images')
      .createSignedUrl(path, 3600);

    const imageUrl = signedUrl?.signedUrl ?? path;

    return {
      image_url: imageUrl,
      file_size: buffer.length,
      mime_type: mimeType,
    };
  },

  async verifyProjectOwnership(
    projectId: string,
    userId: string,
    accessToken: string,
  ): Promise<void> {
    const client = createUserClient(accessToken);

    const { data, error } = await client
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }
  },
};
