'use client';

import { useReducer, useCallback } from 'react';
import type { InputType } from '@decorai/shared';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface OpeningInput {
  type: 'door' | 'window' | 'archway';
  wall: 'north' | 'south' | 'east' | 'west';
  width: string;
  height: string;
}

export interface ReferenceItemInput {
  id: string;
  name: string;
  measurement: string;
  photo: File | null;
  photoPreviewUrl: string | null;
}

export interface WizardState {
  currentStep: WizardStep;
  inputType: InputType | null;
  photo: File | null;
  photoPreviewUrl: string | null;
  roomType: string;
  width: string;
  length: string;
  ceilingHeight: string;
  openings: OpeningInput[];
  additionalDescription: string;
  referenceItems: ReferenceItemInput[];
  selectedStyle: string | null;
  projectId: string | null;
  croquiAscii: string | null;
  croquiApproved: boolean;
  renderJobId: string | null;
  renderProgress: number;
  renderStage: string;
  renderError: string | null;
}

type WizardAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_INPUT_TYPE'; inputType: InputType }
  | { type: 'SET_PHOTO'; photo: File | null; previewUrl: string | null }
  | { type: 'SET_ROOM_TYPE'; roomType: string }
  | { type: 'SET_DIMENSION'; field: 'width' | 'length' | 'ceilingHeight'; value: string }
  | { type: 'SET_ADDITIONAL_DESCRIPTION'; value: string }
  | { type: 'ADD_OPENING' }
  | { type: 'UPDATE_OPENING'; index: number; opening: OpeningInput }
  | { type: 'REMOVE_OPENING'; index: number }
  | { type: 'ADD_REFERENCE_ITEM' }
  | { type: 'UPDATE_REFERENCE_ITEM'; index: number; item: Partial<ReferenceItemInput> }
  | { type: 'REMOVE_REFERENCE_ITEM'; index: number }
  | { type: 'SET_SELECTED_STYLE'; style: string }
  | { type: 'SET_PROJECT_ID'; projectId: string }
  | { type: 'SET_CROQUI'; ascii: string }
  | { type: 'APPROVE_CROQUI' }
  | { type: 'SET_RENDER_JOB'; jobId: string }
  | { type: 'SET_RENDER_PROGRESS'; progress: number; stage: string }
  | { type: 'SET_RENDER_ERROR'; error: string }
  | { type: 'RESET' };

const initialState: WizardState = {
  currentStep: 1,
  inputType: null,
  photo: null,
  photoPreviewUrl: null,
  roomType: '',
  width: '',
  length: '',
  ceilingHeight: '',
  openings: [],
  additionalDescription: '',
  referenceItems: [],
  selectedStyle: null,
  projectId: null,
  croquiAscii: null,
  croquiApproved: false,
  renderJobId: null,
  renderProgress: 0,
  renderStage: '',
  renderError: null,
};

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'SET_INPUT_TYPE':
      return { ...state, inputType: action.inputType };

    case 'SET_PHOTO':
      return { ...state, photo: action.photo, photoPreviewUrl: action.previewUrl };

    case 'SET_ROOM_TYPE':
      return { ...state, roomType: action.roomType };

    case 'SET_DIMENSION':
      return { ...state, [action.field]: action.value };

    case 'SET_ADDITIONAL_DESCRIPTION':
      return { ...state, additionalDescription: action.value };

    case 'ADD_OPENING':
      return {
        ...state,
        openings: [
          ...state.openings,
          { type: 'door', wall: 'north', width: '', height: '' },
        ],
      };

    case 'UPDATE_OPENING':
      return {
        ...state,
        openings: state.openings.map((o, i) =>
          i === action.index ? action.opening : o
        ),
      };

    case 'REMOVE_OPENING':
      return {
        ...state,
        openings: state.openings.filter((_, i) => i !== action.index),
      };

    case 'ADD_REFERENCE_ITEM':
      return {
        ...state,
        referenceItems: [
          ...state.referenceItems,
          { id: generateId(), name: '', measurement: '', photo: null, photoPreviewUrl: null },
        ],
      };

    case 'UPDATE_REFERENCE_ITEM':
      return {
        ...state,
        referenceItems: state.referenceItems.map((item, i) =>
          i === action.index ? { ...item, ...action.item } : item
        ),
      };

    case 'REMOVE_REFERENCE_ITEM':
      return {
        ...state,
        referenceItems: state.referenceItems.filter((_, i) => i !== action.index),
      };

    case 'SET_SELECTED_STYLE':
      return { ...state, selectedStyle: action.style };

    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.projectId };

    case 'SET_CROQUI':
      return { ...state, croquiAscii: action.ascii, croquiApproved: false };

    case 'APPROVE_CROQUI':
      return { ...state, croquiApproved: true };

    case 'SET_RENDER_JOB':
      return { ...state, renderJobId: action.jobId, renderProgress: 0, renderStage: '', renderError: null };

    case 'SET_RENDER_PROGRESS':
      return { ...state, renderProgress: action.progress, renderStage: action.stage };

    case 'SET_RENDER_ERROR':
      return { ...state, renderError: action.error };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function canAdvanceStep(state: WizardState): boolean {
  switch (state.currentStep) {
    case 1:
      return state.inputType !== null;

    case 2: {
      const needsPhoto = state.inputType === 'photo' || state.inputType === 'combined';
      const needsText = state.inputType === 'text' || state.inputType === 'combined';

      if (needsPhoto && !state.photo) return false;
      if (needsText && (!state.width || !state.length)) return false;
      return true;
    }

    case 3:
      return state.selectedStyle !== null;

    case 4:
      return state.croquiApproved;

    case 5:
      return false;

    default:
      return false;
  }
}

export function useNewProjectWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < 5) {
      dispatch({ type: 'SET_STEP', step: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', step: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

  const canAdvance = canAdvanceStep(state);

  return {
    state,
    dispatch,
    goToStep,
    nextStep,
    prevStep,
    canAdvance,
  };
}
