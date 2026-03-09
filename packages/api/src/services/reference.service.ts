import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { Database } from '@decorai/shared';
import type { CreateReferenceItemInput } from '../schemas/spatial.schema';

type ReferenceItemRow = Database['public']['Tables']['reference_items']['Row'];

const BUCKET = 'project-images';
const SIGNED_URL_EXPIRY = 3600; // 1 hour
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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

export const referenceService = {
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
        message: 'Arquivo deve ter no maximo 10MB',
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

  async verifyProjectOwnership(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!data) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }
  },

  async create(
    projectId: string,
    userId: string,
    input: CreateReferenceItemInput,
    buffer: Buffer,
    mimeType: string,
    accessToken: string,
  ) {
    const client = createUserClient(accessToken);

    // Insert the reference item first to get the ID
    const { data: item, error: insertError } = await client
      .from('reference_items')
      .insert({
        project_id: projectId,
        name: input.name,
        image_url: '', // placeholder, will update after upload
        width_m: input.width_m ?? null,
        depth_m: input.depth_m ?? null,
        height_m: input.height_m ?? null,
        material: input.material ?? null,
        color: input.color ?? null,
        position_description: input.position_description ?? null,
      })
      .select()
      .single();

    if (insertError || !item) {
      logger.error({ err: insertError }, 'Failed to create reference item');
      throw new AppError({
        code: 'REFERENCE_CREATE_FAILED',
        message: 'Falha ao criar item de referencia',
        statusCode: 500,
      });
    }

    const refItem = item as ReferenceItemRow;

    // Upload image
    const ext = getExtension(mimeType);
    const storagePath = `${userId}/${projectId}/references/${refItem.id}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      logger.error({ err: uploadError, storagePath }, 'Failed to upload reference image');
      // Clean up the inserted item
      await client.from('reference_items').delete().eq('id', refItem.id);
      throw new AppError({
        code: 'UPLOAD_FAILED',
        message: 'Falha ao fazer upload da imagem',
        statusCode: 500,
      });
    }

    // Get signed URL
    const { data: signedUrl } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

    const imageUrl = signedUrl?.signedUrl ?? storagePath;

    // Update image_url
    const { data: updated, error: updateError } = await client
      .from('reference_items')
      .update({ image_url: imageUrl })
      .eq('id', refItem.id)
      .select()
      .single();

    if (updateError) {
      logger.error({ err: updateError }, 'Failed to update reference item image URL');
    }

    return updated ?? { ...refItem, image_url: imageUrl };
  },

  async list(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { data, error } = await client
      .from('reference_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error({ err: error }, 'Failed to list reference items');
      throw new AppError({
        code: 'REFERENCE_LIST_FAILED',
        message: 'Falha ao listar itens de referencia',
        statusCode: 500,
      });
    }

    return data ?? [];
  },

  async getById(projectId: string, refId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { data, error } = await client
      .from('reference_items')
      .select('*')
      .eq('id', refId)
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      throw new AppError({
        code: 'REFERENCE_NOT_FOUND',
        message: 'Item de referencia nao encontrado',
        statusCode: 404,
      });
    }

    const refData = data as ReferenceItemRow;

    // Generate fresh signed URL
    const storagePath = this.extractStoragePath(refData.image_url);
    if (storagePath) {
      const { data: signedUrl } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

      if (signedUrl?.signedUrl) {
        return { ...refData, image_url: signedUrl.signedUrl };
      }
    }

    return refData;
  },

  async delete(projectId: string, refId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { data: item } = await client
      .from('reference_items')
      .select('id, image_url')
      .eq('id', refId)
      .eq('project_id', projectId)
      .single();

    if (!item) {
      throw new AppError({
        code: 'REFERENCE_NOT_FOUND',
        message: 'Item de referencia nao encontrado',
        statusCode: 404,
      });
    }

    const { error } = await client
      .from('reference_items')
      .delete()
      .eq('id', refId)
      .eq('project_id', projectId);

    if (error) {
      logger.error({ err: error }, 'Failed to delete reference item');
      throw new AppError({
        code: 'REFERENCE_DELETE_FAILED',
        message: 'Falha ao deletar item de referencia',
        statusCode: 500,
      });
    }

    // Clean up storage file (fire and forget)
    const storagePath = this.extractStoragePath(item.image_url);
    if (storagePath) {
      supabaseAdmin.storage
        .from(BUCKET)
        .remove([storagePath])
        .catch((err) => {
          logger.error({ err, refId }, 'Failed to clean up reference image');
        });
    }
  },

  extractStoragePath(imageUrl: string): string | null {
    if (!imageUrl || imageUrl === '') return null;
    // If it's already a path (not a full URL), return as-is
    if (!imageUrl.startsWith('http')) return imageUrl;
    // Try to extract path from signed URL
    try {
      const url = new URL(imageUrl);
      const match = url.pathname.match(/\/object\/sign\/[^/]+\/(.+)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {
      // Not a valid URL
    }
    return null;
  },
};
