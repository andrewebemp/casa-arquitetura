import { renderHook, act } from '@testing-library/react';
import {
  useNewProjectWizard,
  canAdvanceStep,
} from '@/hooks/use-new-project-wizard';
import type { WizardState } from '@/hooks/use-new-project-wizard';

describe('useNewProjectWizard', () => {
  it('initializes with step 1 and empty state', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.inputType).toBeNull();
    expect(result.current.state.photo).toBeNull();
    expect(result.current.state.selectedStyle).toBeNull();
    expect(result.current.state.projectId).toBeNull();
    expect(result.current.canAdvance).toBe(false);
  });

  it('allows advancing after selecting input type', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_INPUT_TYPE', inputType: 'photo' });
    });

    expect(result.current.state.inputType).toBe('photo');
    expect(result.current.canAdvance).toBe(true);
  });

  it('navigates to next step', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_INPUT_TYPE', inputType: 'photo' });
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.state.currentStep).toBe(2);
  });

  it('navigates to previous step', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_STEP', step: 3 });
    });

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.state.currentStep).toBe(2);
  });

  it('does not go below step 1', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.state.currentStep).toBe(1);
  });

  it('does not go above step 5', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_STEP', step: 5 });
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.state.currentStep).toBe(5);
  });

  it('manages photo state', () => {
    const { result } = renderHook(() => useNewProjectWizard());
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.dispatch({
        type: 'SET_PHOTO',
        photo: mockFile,
        previewUrl: 'blob:preview',
      });
    });

    expect(result.current.state.photo).toBe(mockFile);
    expect(result.current.state.photoPreviewUrl).toBe('blob:preview');
  });

  it('manages dimensions', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_DIMENSION', field: 'width', value: '4.5' });
      result.current.dispatch({ type: 'SET_DIMENSION', field: 'length', value: '6.0' });
      result.current.dispatch({ type: 'SET_DIMENSION', field: 'ceilingHeight', value: '2.7' });
    });

    expect(result.current.state.width).toBe('4.5');
    expect(result.current.state.length).toBe('6.0');
    expect(result.current.state.ceilingHeight).toBe('2.7');
  });

  it('manages openings', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'ADD_OPENING' });
    });

    expect(result.current.state.openings).toHaveLength(1);
    expect(result.current.state.openings[0].type).toBe('door');

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_OPENING',
        index: 0,
        opening: { type: 'window', wall: 'south', width: '1.2', height: '1.5' },
      });
    });

    expect(result.current.state.openings[0].type).toBe('window');
    expect(result.current.state.openings[0].wall).toBe('south');

    act(() => {
      result.current.dispatch({ type: 'REMOVE_OPENING', index: 0 });
    });

    expect(result.current.state.openings).toHaveLength(0);
  });

  it('manages reference items', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'ADD_REFERENCE_ITEM' });
    });

    expect(result.current.state.referenceItems).toHaveLength(1);
    expect(result.current.state.referenceItems[0].name).toBe('');

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_REFERENCE_ITEM',
        index: 0,
        item: { name: 'Sofa' },
      });
    });

    expect(result.current.state.referenceItems[0].name).toBe('Sofa');

    act(() => {
      result.current.dispatch({ type: 'REMOVE_REFERENCE_ITEM', index: 0 });
    });

    expect(result.current.state.referenceItems).toHaveLength(0);
  });

  it('manages style selection', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_SELECTED_STYLE', style: 'moderno' });
    });

    expect(result.current.state.selectedStyle).toBe('moderno');
  });

  it('manages croqui state', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_CROQUI', ascii: '+---+\n|   |\n+---+' });
    });

    expect(result.current.state.croquiAscii).toBe('+---+\n|   |\n+---+');
    expect(result.current.state.croquiApproved).toBe(false);

    act(() => {
      result.current.dispatch({ type: 'APPROVE_CROQUI' });
    });

    expect(result.current.state.croquiApproved).toBe(true);
  });

  it('manages render progress state', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_RENDER_JOB', jobId: 'job-123' });
    });

    expect(result.current.state.renderJobId).toBe('job-123');
    expect(result.current.state.renderProgress).toBe(0);

    act(() => {
      result.current.dispatch({
        type: 'SET_RENDER_PROGRESS',
        progress: 50,
        stage: 'Aplicando estilo...',
      });
    });

    expect(result.current.state.renderProgress).toBe(50);
    expect(result.current.state.renderStage).toBe('Aplicando estilo...');
  });

  it('resets to initial state', () => {
    const { result } = renderHook(() => useNewProjectWizard());

    act(() => {
      result.current.dispatch({ type: 'SET_INPUT_TYPE', inputType: 'photo' });
      result.current.dispatch({ type: 'SET_STEP', step: 3 });
    });

    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });

    expect(result.current.state.currentStep).toBe(1);
    expect(result.current.state.inputType).toBeNull();
  });
});

describe('canAdvanceStep', () => {
  const baseState: WizardState = {
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

  it('step 1: requires input type', () => {
    expect(canAdvanceStep(baseState)).toBe(false);
    expect(canAdvanceStep({ ...baseState, inputType: 'photo' })).toBe(true);
  });

  it('step 2 photo: requires photo', () => {
    const state = { ...baseState, currentStep: 2 as const, inputType: 'photo' as const };
    expect(canAdvanceStep(state)).toBe(false);

    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    expect(canAdvanceStep({ ...state, photo: mockFile })).toBe(true);
  });

  it('step 2 text: requires dimensions', () => {
    const state = { ...baseState, currentStep: 2 as const, inputType: 'text' as const };
    expect(canAdvanceStep(state)).toBe(false);
    expect(canAdvanceStep({ ...state, width: '4.5', length: '6.0' })).toBe(true);
  });

  it('step 2 combined: requires both photo and dimensions', () => {
    const state = { ...baseState, currentStep: 2 as const, inputType: 'combined' as const };
    expect(canAdvanceStep(state)).toBe(false);

    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    expect(canAdvanceStep({ ...state, photo: mockFile })).toBe(false);
    expect(canAdvanceStep({ ...state, width: '4.5', length: '6.0' })).toBe(false);
    expect(canAdvanceStep({ ...state, photo: mockFile, width: '4.5', length: '6.0' })).toBe(true);
  });

  it('step 3: requires selected style', () => {
    const state = { ...baseState, currentStep: 3 as const };
    expect(canAdvanceStep(state)).toBe(false);
    expect(canAdvanceStep({ ...state, selectedStyle: 'moderno' })).toBe(true);
  });

  it('step 4: requires croqui approved', () => {
    const state = { ...baseState, currentStep: 4 as const };
    expect(canAdvanceStep(state)).toBe(false);
    expect(canAdvanceStep({ ...state, croquiApproved: true })).toBe(true);
  });

  it('step 5: always returns false', () => {
    const state = { ...baseState, currentStep: 5 as const };
    expect(canAdvanceStep(state)).toBe(false);
  });
});
