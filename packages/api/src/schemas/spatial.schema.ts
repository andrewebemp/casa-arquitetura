import { z } from 'zod';

const OPENING_TYPES = ['door', 'window', 'arch'] as const;

const positiveNumber = (field: string) =>
  z.number().positive(`${field} deve ser positivo`);

const dimensionsSchema = z.object({
  width: positiveNumber('width'),
  length: positiveNumber('length'),
  height: positiveNumber('height'),
});

const openingSchema = z.object({
  type: z.enum(OPENING_TYPES, { message: 'type deve ser door, window ou arch' }),
  wall: z.string().min(1, 'wall e obrigatorio'),
  width: positiveNumber('width'),
  height: positiveNumber('height'),
  position_x: z.number().optional(),
});

const spatialItemSchema = z.object({
  name: z.string().min(1, 'name e obrigatorio').max(200, 'name deve ter no maximo 200 caracteres'),
  width: positiveNumber('width').optional(),
  depth: positiveNumber('depth').optional(),
  height: positiveNumber('height').optional(),
  position: z.string().min(1, 'position e obrigatorio'),
});

export const upsertSpatialInputSchema = z.object({
  dimensions: dimensionsSchema.optional(),
  openings: z.array(openingSchema).optional(),
  items: z.array(spatialItemSchema).optional(),
});

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export const referenceItemParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
  refId: z.string().uuid('refId deve ser um UUID valido'),
});

export const createReferenceItemSchema = z.object({
  name: z.string().min(1, 'name e obrigatorio').max(200, 'name deve ter no maximo 200 caracteres'),
  width_m: positiveNumber('width_m').max(20, 'width_m deve ser no maximo 20').optional(),
  depth_m: positiveNumber('depth_m').max(20, 'depth_m deve ser no maximo 20').optional(),
  height_m: positiveNumber('height_m').max(10, 'height_m deve ser no maximo 10').optional(),
  material: z.string().max(100, 'material deve ter no maximo 100 caracteres').optional(),
  color: z.string().max(50, 'color deve ter no maximo 50 caracteres').optional(),
  position_description: z.string().max(500, 'position_description deve ter no maximo 500 caracteres').optional(),
});

export type UpsertSpatialInput = z.infer<typeof upsertSpatialInputSchema>;
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type ReferenceItemParams = z.infer<typeof referenceItemParamsSchema>;
export type CreateReferenceItemInput = z.infer<typeof createReferenceItemSchema>;
