'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNewProjectWizard } from '@/hooks/use-new-project-wizard';
import type { WizardStep, ReferenceItemInput } from '@/hooks/use-new-project-wizard';
import { StepIndicator } from '@/components/molecules/StepIndicator';
import { InputTypeSelector } from '@/components/molecules/InputTypeSelector';
import { PhotoUploader } from '@/components/molecules/PhotoUploader';
import { SpatialForm } from '@/components/molecules/SpatialForm';
import { ReferenceItemList } from '@/components/molecules/ReferenceItemList';
import { StyleGrid } from '@/components/molecules/StyleGrid';
import { CroquiPreview } from '@/components/molecules/CroquiPreview';
import { GenerationProgress } from '@/components/molecules/GenerationProgress';
import {
  createProject,
  submitSpatialInput,
  addReferenceItems,
  generateCroqui,
  iterateCroqui,
  approveCroqui,
  startGeneration,
  subscribeToProgress,
} from '@/services/staging-wizard-service';
import type { InputType } from '@decorai/shared';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, nextStep, prevStep, canAdvance } = useNewProjectWizard();

  // Sync step from URL
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = parseInt(stepParam, 10) as WizardStep;
      if (step >= 1 && step <= 5 && step !== state.currentStep) {
        dispatch({ type: 'SET_STEP', step });
      }
    }
  }, [searchParams, dispatch, state.currentStep]);

  // Update URL when step changes
  useEffect(() => {
    const currentUrlStep = searchParams.get('step');
    if (currentUrlStep !== String(state.currentStep)) {
      router.replace(`/projects/new?step=${state.currentStep}`, { scroll: false });
    }
  }, [state.currentStep, router, searchParams]);

  // Create project mutation (called at end of Step 2)
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const projectId = await createProject({
        name: `Projeto ${new Date().toLocaleDateString('pt-BR')}`,
        inputType: state.inputType!,
        roomType: state.roomType,
        photo: state.photo ?? undefined,
      });

      // Submit spatial input if text or combined
      if (state.inputType === 'text' || state.inputType === 'combined') {
        await submitSpatialInput({
          projectId,
          width: parseFloat(state.width),
          length: parseFloat(state.length),
          ceilingHeight: state.ceilingHeight ? parseFloat(state.ceilingHeight) : undefined,
          openings: state.openings
            .filter((o) => o.width && o.height)
            .map((o) => ({
              type: o.type,
              wall: o.wall,
              width_m: parseFloat(o.width),
              height_m: parseFloat(o.height),
            })),
          description: state.additionalDescription || undefined,
        });
      }

      // Submit reference items
      const validItems = state.referenceItems.filter((item) => item.name.trim());
      if (validItems.length > 0) {
        await addReferenceItems(
          projectId,
          validItems.map((item) => ({
            name: item.name,
            measurement: item.measurement || undefined,
            photo: item.photo ?? undefined,
          }))
        );
      }

      return projectId;
    },
    onSuccess: (projectId) => {
      dispatch({ type: 'SET_PROJECT_ID', projectId });
      nextStep();
    },
  });

  // Generate croqui mutation (called when entering Step 4)
  const generateCroquiMutation = useMutation({
    mutationFn: () => generateCroqui(state.projectId!),
    onSuccess: (data) => {
      dispatch({ type: 'SET_CROQUI', ascii: data.croqui_ascii });
    },
  });

  // Iterate croqui mutation
  const iterateCroquiMutation = useMutation({
    mutationFn: (feedback: string) => iterateCroqui(state.projectId!, feedback),
    onSuccess: (data) => {
      dispatch({ type: 'SET_CROQUI', ascii: data.croqui_ascii });
    },
  });

  // Approve croqui and start generation
  const approveMutation = useMutation({
    mutationFn: async () => {
      await approveCroqui(state.projectId!);
      dispatch({ type: 'APPROVE_CROQUI' });

      const result = await startGeneration(state.projectId!, state.selectedStyle!);
      return result.job_id;
    },
    onSuccess: (jobId) => {
      dispatch({ type: 'SET_RENDER_JOB', jobId });
      dispatch({ type: 'SET_STEP', step: 5 });
    },
  });

  // Subscribe to render progress (Step 5)
  useEffect(() => {
    if (state.currentStep !== 5 || !state.renderJobId) return;

    const unsubscribe = subscribeToProgress(
      state.renderJobId,
      (progress, stage) => {
        dispatch({ type: 'SET_RENDER_PROGRESS', progress, stage });
      },
      () => {
        router.push(`/projects/${state.projectId}`);
      },
      (error) => {
        dispatch({ type: 'SET_RENDER_ERROR', error });
      }
    );

    return unsubscribe;
  }, [state.currentStep, state.renderJobId, state.projectId, dispatch, router]);

  // Auto-generate croqui when entering Step 4
  useEffect(() => {
    if (state.currentStep === 4 && state.projectId && !state.croquiAscii && !generateCroquiMutation.isPending) {
      generateCroquiMutation.mutate();
    }
  }, [state.currentStep, state.projectId, state.croquiAscii, generateCroquiMutation]);

  const handleNext = useCallback(() => {
    if (state.currentStep === 2 && !state.projectId) {
      createProjectMutation.mutate();
    } else {
      nextStep();
    }
  }, [state.currentStep, state.projectId, createProjectMutation, nextStep]);

  const handleRetry = useCallback(() => {
    dispatch({ type: 'SET_RENDER_ERROR', error: '' });
    approveMutation.mutate();
  }, [dispatch, approveMutation]);

  const isLoading = createProjectMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-heading text-gray-900">Novo Projeto</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie um staging virtual em poucos passos
        </p>
      </div>

      <StepIndicator
        currentStep={state.currentStep}
        onStepClick={(step) => {
          if (step < state.currentStep) {
            dispatch({ type: 'SET_STEP', step });
          }
        }}
      />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {/* Step 1: Input Type */}
        {state.currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Como voce quer comecar?
            </h2>
            <InputTypeSelector
              selected={state.inputType}
              onSelect={(type: InputType) => dispatch({ type: 'SET_INPUT_TYPE', inputType: type })}
            />
          </div>
        )}

        {/* Step 2: Details */}
        {state.currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalhes do ambiente
            </h2>

            {/* Photo upload for photo and combined */}
            {(state.inputType === 'photo' || state.inputType === 'combined') && (
              <div className={state.inputType === 'combined' ? 'grid gap-6 lg:grid-cols-2' : ''}>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Foto do ambiente</h3>
                  <PhotoUploader
                    photo={state.photo}
                    previewUrl={state.photoPreviewUrl}
                    onPhotoChange={(file, url) =>
                      dispatch({ type: 'SET_PHOTO', photo: file, previewUrl: url })
                    }
                  />

                  <div className="mt-4">
                    <label htmlFor="room-type-photo" className="block text-sm font-medium text-gray-700">
                      Tipo de ambiente
                    </label>
                    <select
                      id="room-type-photo"
                      value={state.roomType}
                      onChange={(e) => dispatch({ type: 'SET_ROOM_TYPE', roomType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Selecione</option>
                      <option value="sala">Sala</option>
                      <option value="quarto">Quarto</option>
                      <option value="cozinha">Cozinha</option>
                      <option value="banheiro">Banheiro</option>
                      <option value="escritorio">Escritorio</option>
                      <option value="varanda">Varanda</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                {state.inputType === 'combined' && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Medidas do espaco</h3>
                    <SpatialForm
                      roomType={state.roomType}
                      width={state.width}
                      length={state.length}
                      ceilingHeight={state.ceilingHeight}
                      openings={state.openings}
                      additionalDescription={state.additionalDescription}
                      onRoomTypeChange={(v) => dispatch({ type: 'SET_ROOM_TYPE', roomType: v })}
                      onDimensionChange={(f, v) => dispatch({ type: 'SET_DIMENSION', field: f, value: v })}
                      onDescriptionChange={(v) => dispatch({ type: 'SET_ADDITIONAL_DESCRIPTION', value: v })}
                      onAddOpening={() => dispatch({ type: 'ADD_OPENING' })}
                      onUpdateOpening={(i, o) => dispatch({ type: 'UPDATE_OPENING', index: i, opening: o })}
                      onRemoveOpening={(i) => dispatch({ type: 'REMOVE_OPENING', index: i })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Spatial form for text mode */}
            {state.inputType === 'text' && (
              <SpatialForm
                roomType={state.roomType}
                width={state.width}
                length={state.length}
                ceilingHeight={state.ceilingHeight}
                openings={state.openings}
                additionalDescription={state.additionalDescription}
                onRoomTypeChange={(v) => dispatch({ type: 'SET_ROOM_TYPE', roomType: v })}
                onDimensionChange={(f, v) => dispatch({ type: 'SET_DIMENSION', field: f, value: v })}
                onDescriptionChange={(v) => dispatch({ type: 'SET_ADDITIONAL_DESCRIPTION', value: v })}
                onAddOpening={() => dispatch({ type: 'ADD_OPENING' })}
                onUpdateOpening={(i, o) => dispatch({ type: 'UPDATE_OPENING', index: i, opening: o })}
                onRemoveOpening={(i) => dispatch({ type: 'REMOVE_OPENING', index: i })}
              />
            )}

            {/* Reference items — all variants */}
            <div className="border-t pt-6">
              <ReferenceItemList
                items={state.referenceItems}
                onAddItem={() => dispatch({ type: 'ADD_REFERENCE_ITEM' })}
                onUpdateItem={(i, updates) =>
                  dispatch({ type: 'UPDATE_REFERENCE_ITEM', index: i, item: updates as Partial<ReferenceItemInput> })
                }
                onRemoveItem={(i) => dispatch({ type: 'REMOVE_REFERENCE_ITEM', index: i })}
              />
            </div>

            {createProjectMutation.isError && (
              <p className="text-sm text-red-600" role="alert">
                {createProjectMutation.error?.message ?? 'Erro ao criar projeto'}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Style Selection */}
        {state.currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Escolha o estilo de decoracao
            </h2>
            <StyleGrid
              selectedStyle={state.selectedStyle}
              onSelectStyle={(style) => dispatch({ type: 'SET_SELECTED_STYLE', style })}
            />
          </div>
        )}

        {/* Step 4: Croqui Preview */}
        {state.currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Croqui do ambiente
            </h2>
            <p className="text-sm text-gray-500">
              Revise o croqui gerado e faca ajustes antes de gerar a imagem final.
            </p>
            <CroquiPreview
              croquiAscii={state.croquiAscii}
              isGenerating={generateCroquiMutation.isPending}
              isIterating={iterateCroquiMutation.isPending}
              onIterate={(feedback) => iterateCroquiMutation.mutate(feedback)}
              onApprove={() => approveMutation.mutate()}
            />
            {(iterateCroquiMutation.isError || approveMutation.isError) && (
              <p className="text-sm text-red-600" role="alert">
                {iterateCroquiMutation.error?.message ?? approveMutation.error?.message ?? 'Erro na operacao'}
              </p>
            )}
          </div>
        )}

        {/* Step 5: Generation Progress */}
        {state.currentStep === 5 && (
          <GenerationProgress
            progress={state.renderProgress}
            stage={state.renderStage}
            error={state.renderError}
            onRetry={handleRetry}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {state.currentStep < 4 && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={state.currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {isLoading ? 'Criando projeto...' : 'Proximo'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
