'use client';

import { useReducer, useCallback } from 'react';
import type { SegmentResult, DetectObjectResponse } from '@/services/editing-service';

export type EditingTool = 'segment' | 'lighting' | 'removal' | null;

export interface EditingState {
  isEditing: boolean;
  activeTool: EditingTool;
  segments: SegmentResult[];
  selectedSegmentId: string | null;
  detectedObjects: DetectObjectResponse[];
  pendingObject: DetectObjectResponse | null;
  isProcessing: boolean;
  progress: number;
  progressStage: string;
  error: string | null;
}

type EditingAction =
  | { type: 'ENTER_EDIT_MODE' }
  | { type: 'EXIT_EDIT_MODE' }
  | { type: 'SET_TOOL'; tool: EditingTool }
  | { type: 'SET_SEGMENTS'; segments: SegmentResult[] }
  | { type: 'ADD_SEGMENT'; segment: SegmentResult }
  | { type: 'SELECT_SEGMENT'; segmentId: string | null }
  | { type: 'SET_PENDING_OBJECT'; object: DetectObjectResponse | null }
  | { type: 'ADD_SELECTED_OBJECT'; object: DetectObjectResponse }
  | { type: 'REMOVE_SELECTED_OBJECT'; maskId: string }
  | { type: 'CLEAR_SELECTED_OBJECTS' }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_PROGRESS'; progress: number; stage: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET_TOOL_STATE' };

const initialState: EditingState = {
  isEditing: false,
  activeTool: null,
  segments: [],
  selectedSegmentId: null,
  detectedObjects: [],
  pendingObject: null,
  isProcessing: false,
  progress: 0,
  progressStage: '',
  error: null,
};

function editingReducer(state: EditingState, action: EditingAction): EditingState {
  switch (action.type) {
    case 'ENTER_EDIT_MODE':
      return { ...state, isEditing: true, activeTool: 'segment' };
    case 'EXIT_EDIT_MODE':
      return { ...initialState };
    case 'SET_TOOL':
      return {
        ...state,
        activeTool: action.tool,
        segments: action.tool === 'segment' ? state.segments : [],
        selectedSegmentId: null,
        detectedObjects: action.tool === 'removal' ? state.detectedObjects : [],
        pendingObject: null,
        error: null,
      };
    case 'SET_SEGMENTS':
      return { ...state, segments: action.segments };
    case 'ADD_SEGMENT':
      return {
        ...state,
        segments: [...state.segments.filter((s) => s.segment_id !== action.segment.segment_id), action.segment],
      };
    case 'SELECT_SEGMENT':
      return { ...state, selectedSegmentId: action.segmentId };
    case 'SET_PENDING_OBJECT':
      return { ...state, pendingObject: action.object };
    case 'ADD_SELECTED_OBJECT':
      if (state.detectedObjects.length >= 10) return state;
      if (state.detectedObjects.some((o) => o.mask_id === action.object.mask_id)) return state;
      return {
        ...state,
        detectedObjects: [...state.detectedObjects, action.object],
        pendingObject: null,
      };
    case 'REMOVE_SELECTED_OBJECT':
      return {
        ...state,
        detectedObjects: state.detectedObjects.filter((o) => o.mask_id !== action.maskId),
      };
    case 'CLEAR_SELECTED_OBJECTS':
      return { ...state, detectedObjects: [], pendingObject: null };
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.isProcessing,
        progress: action.isProcessing ? state.progress : 0,
        progressStage: action.isProcessing ? state.progressStage : '',
      };
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress, progressStage: action.stage };
    case 'SET_ERROR':
      return { ...state, error: action.error, isProcessing: false };
    case 'RESET_TOOL_STATE':
      return {
        ...state,
        segments: [],
        selectedSegmentId: null,
        detectedObjects: [],
        pendingObject: null,
        isProcessing: false,
        progress: 0,
        progressStage: '',
        error: null,
      };
    default:
      return state;
  }
}

export function useEditingStore() {
  const [state, dispatch] = useReducer(editingReducer, initialState);

  const enterEditMode = useCallback(() => dispatch({ type: 'ENTER_EDIT_MODE' }), []);
  const exitEditMode = useCallback(() => dispatch({ type: 'EXIT_EDIT_MODE' }), []);
  const setTool = useCallback((tool: EditingTool) => dispatch({ type: 'SET_TOOL', tool }), []);
  const setSegments = useCallback((segments: SegmentResult[]) => dispatch({ type: 'SET_SEGMENTS', segments }), []);
  const addSegment = useCallback((segment: SegmentResult) => dispatch({ type: 'ADD_SEGMENT', segment }), []);
  const selectSegment = useCallback((segmentId: string | null) => dispatch({ type: 'SELECT_SEGMENT', segmentId }), []);
  const setPendingObject = useCallback((object: DetectObjectResponse | null) => dispatch({ type: 'SET_PENDING_OBJECT', object }), []);
  const addSelectedObject = useCallback((object: DetectObjectResponse) => dispatch({ type: 'ADD_SELECTED_OBJECT', object }), []);
  const removeSelectedObject = useCallback((maskId: string) => dispatch({ type: 'REMOVE_SELECTED_OBJECT', maskId }), []);
  const clearSelectedObjects = useCallback(() => dispatch({ type: 'CLEAR_SELECTED_OBJECTS' }), []);
  const setProcessing = useCallback((isProcessing: boolean) => dispatch({ type: 'SET_PROCESSING', isProcessing }), []);
  const setProgress = useCallback((progress: number, stage: string) => dispatch({ type: 'SET_PROGRESS', progress, stage }), []);
  const setError = useCallback((error: string | null) => dispatch({ type: 'SET_ERROR', error }), []);
  const resetToolState = useCallback(() => dispatch({ type: 'RESET_TOOL_STATE' }), []);

  return {
    ...state,
    enterEditMode,
    exitEditMode,
    setTool,
    setSegments,
    addSegment,
    selectSegment,
    setPendingObject,
    addSelectedObject,
    removeSelectedObject,
    clearSelectedObjects,
    setProcessing,
    setProgress,
    setError,
    resetToolState,
  };
}
