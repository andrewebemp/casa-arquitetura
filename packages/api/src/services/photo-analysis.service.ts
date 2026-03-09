import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { chatCompletion } from '../lib/llm';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

const SPATIAL_INTERPRETATION_PROMPT = `You are a spatial analysis AI for interior design.
Given depth estimation data from a room photo, interpret it into structured spatial data.

Output a JSON object with exactly this format:
{
  "dimensions": { "width": <number_m>, "length": <number_m>, "height": <number_m> },
  "openings": [{ "type": "door"|"window"|"archway", "wall": "north"|"south"|"east"|"west", "width": <number_m>, "height": <number_m> }],
  "detected_elements": ["element1", "element2"]
}

Use the depth data and detected features to estimate room dimensions and identify openings.
Output ONLY valid JSON, no explanations.`;

const CROQUI_SYSTEM_PROMPT = `You are an ASCII floor plan generator for interior design.
Given room dimensions and detected elements, generate a clear ASCII floor plan.

Rules:
- Use + for corners, - for horizontal walls, | for vertical walls
- Mark doors with D, windows with W
- Label detected elements inside the plan
- Show dimensions on the outside edges (width x length in meters)
- Scale: each character represents ~0.25m
- Keep the plan clean and readable
- Always output ONLY the ASCII art, no explanations`;

interface DepthResult {
  depth_map_url: string;
  estimated_dimensions: {
    width_m: number;
    length_m: number;
    height_m: number;
  };
  detected_features: Array<{
    type: string;
    confidence: number;
    position: Record<string, number>;
  }>;
}

interface SpatialInterpretation {
  dimensions: { width: number; length: number; height: number };
  openings: Array<{ type: string; wall: string; width: number; height: number }>;
  detected_elements: string[];
}

export const photoAnalysisService = {
  async analyze(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    // Verify project ownership and get image URL
    const { data: project } = await client
      .from('projects')
      .select('id, original_image_url, status')
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

    if (!project.original_image_url) {
      throw new AppError({
        code: 'PHOTO_NOT_FOUND',
        message: 'Projeto nao possui foto. Faca upload de uma foto antes de analisar.',
        statusCode: 400,
      });
    }

    // Step 1: Call AI pipeline for depth estimation
    let depthResult: DepthResult;
    try {
      depthResult = await aiPipelineClient.analyzeDepth(project.original_image_url);
    } catch (err) {
      logger.error({ err }, 'Depth analysis failed');
      throw new AppError({
        code: 'DEPTH_ANALYSIS_FAILED',
        message: 'Falha na analise de profundidade da foto',
        statusCode: 502,
      });
    }

    // Step 2: Use LLM to interpret depth data into spatial data
    const interpretationPrompt = `Depth estimation results for a room photo:
- Estimated dimensions: ${depthResult.estimated_dimensions.width_m}m x ${depthResult.estimated_dimensions.length_m}m x ${depthResult.estimated_dimensions.height_m}m
- Detected features: ${JSON.stringify(depthResult.detected_features)}

Interpret this into structured spatial data:`;

    let spatialData: SpatialInterpretation;
    try {
      const response = await chatCompletion({
        system: SPATIAL_INTERPRETATION_PROMPT,
        messages: [{ role: 'user', content: interpretationPrompt }],
        maxTokens: 1024,
      });

      spatialData = JSON.parse(response.text.trim());
    } catch (err) {
      logger.error({ err }, 'Spatial interpretation failed');
      throw new AppError({
        code: 'SPATIAL_INTERPRETATION_FAILED',
        message: 'Falha ao interpretar dados espaciais da foto',
        statusCode: 500,
      });
    }

    // Step 3: Store spatial data
    const { data: existingSpatial } = await supabaseAdmin
      .from('spatial_inputs')
      .select('id')
      .eq('project_id', projectId)
      .single();

    const spatialRecord = {
      dimensions: spatialData.dimensions as Record<string, unknown>,
      openings: spatialData.openings as Record<string, unknown>[],
      items: [] as Record<string, unknown>[],
      photo_interpretation: {
        estimated_dimensions: depthResult.estimated_dimensions,
        detected_openings: spatialData.openings,
        detected_elements: spatialData.detected_elements,
        confidence: depthResult.detected_features.reduce(
          (acc, f) => acc + f.confidence, 0
        ) / Math.max(depthResult.detected_features.length, 1),
      } as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    if (existingSpatial) {
      await supabaseAdmin
        .from('spatial_inputs')
        .update(spatialRecord)
        .eq('project_id', projectId);
    } else {
      await supabaseAdmin
        .from('spatial_inputs')
        .insert({ project_id: projectId, ...spatialRecord });
    }

    // Step 4: Generate ASCII croqui from spatial data
    const croquiPrompt = `Generate an ASCII floor plan for a room:
- Dimensions: ${spatialData.dimensions.width}m x ${spatialData.dimensions.length}m x ${spatialData.dimensions.height}m
${spatialData.openings.map((o) => `- ${o.type} on ${o.wall} wall (${o.width}m x ${o.height}m)`).join('\n')}
${spatialData.detected_elements.length > 0 ? `\nDetected elements: ${spatialData.detected_elements.join(', ')}` : ''}`;

    let croquiAscii: string;
    try {
      const croquiResponse = await chatCompletion({
        system: CROQUI_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: croquiPrompt }],
        maxTokens: 2048,
      });

      croquiAscii = croquiResponse.text.trim();
    } catch (err) {
      logger.error({ err }, 'Croqui generation from photo failed');
      throw new AppError({
        code: 'CROQUI_GENERATION_FAILED',
        message: 'Falha ao gerar croqui a partir da analise da foto',
        statusCode: 500,
      });
    }

    // Step 5: Store croqui
    const { error: updateError } = await supabaseAdmin
      .from('spatial_inputs')
      .update({
        croqui_ascii: croquiAscii,
        croqui_turn_number: 1,
        croqui_approved: false,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .select()
      .single();

    if (updateError) {
      logger.error({ err: updateError }, 'Failed to store photo analysis croqui');
      throw new AppError({
        code: 'CROQUI_STORE_FAILED',
        message: 'Falha ao armazenar croqui da analise',
        statusCode: 500,
      });
    }

    // Update project status
    await supabaseAdmin
      .from('projects')
      .update({ status: 'croqui_review', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    return {
      spatial_data: {
        dimensions: spatialData.dimensions,
        openings: spatialData.openings,
        detected_elements: spatialData.detected_elements,
        photo_interpretation: spatialRecord.photo_interpretation,
      },
      croqui: {
        croqui_ascii: croquiAscii,
        turn_number: 1,
        approved: false,
      },
    };
  },
};
