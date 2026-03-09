import { renderHook, act } from '@testing-library/react';
import { useEditingStore } from '@/hooks/use-editing-store';
import type { SegmentResult, DetectObjectResponse } from '@/services/editing-service';

const mockSegment: SegmentResult = {
  segment_id: 'seg-1',
  label: 'floor',
  label_pt: 'Piso',
  mask_polygon: [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]],
  color: 'rgba(16, 185, 129, 0.3)',
  confidence: 0.95,
};

const mockObject: DetectObjectResponse = {
  mask_id: 'mask-1',
  label: 'Entulho',
  mask_polygon: [[0.2, 0.2], [0.4, 0.2], [0.4, 0.4], [0.2, 0.4]],
  confidence: 0.9,
};

describe('useEditingStore', () => {
  it('starts in non-editing state', () => {
    const { result } = renderHook(() => useEditingStore());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.activeTool).toBeNull();
  });

  it('enters edit mode with segment tool active', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.enterEditMode());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.activeTool).toBe('segment');
  });

  it('exits edit mode and resets all state', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.enterEditMode());
    act(() => result.current.addSegment(mockSegment));
    act(() => result.current.exitEditMode());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.segments).toEqual([]);
  });

  it('sets active tool and clears unrelated state', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.enterEditMode());
    act(() => result.current.addSegment(mockSegment));
    act(() => result.current.setTool('lighting'));

    expect(result.current.activeTool).toBe('lighting');
    expect(result.current.segments).toEqual([]);
  });

  it('adds segments without duplicates', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.addSegment(mockSegment));
    act(() => result.current.addSegment(mockSegment));

    expect(result.current.segments).toHaveLength(1);
  });

  it('selects segment by id', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.selectSegment('seg-1'));

    expect(result.current.selectedSegmentId).toBe('seg-1');
  });

  it('adds detected objects up to 10', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.addSelectedObject(mockObject));

    expect(result.current.detectedObjects).toHaveLength(1);
    expect(result.current.detectedObjects[0].mask_id).toBe('mask-1');
  });

  it('prevents duplicate objects', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.addSelectedObject(mockObject));
    act(() => result.current.addSelectedObject(mockObject));

    expect(result.current.detectedObjects).toHaveLength(1);
  });

  it('limits to 10 objects', () => {
    const { result } = renderHook(() => useEditingStore());

    for (let i = 0; i < 12; i++) {
      act(() => result.current.addSelectedObject({
        ...mockObject,
        mask_id: `mask-${i}`,
      }));
    }

    expect(result.current.detectedObjects).toHaveLength(10);
  });

  it('removes selected object by maskId', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.addSelectedObject(mockObject));
    act(() => result.current.removeSelectedObject('mask-1'));

    expect(result.current.detectedObjects).toHaveLength(0);
  });

  it('clears all selected objects', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.addSelectedObject(mockObject));
    act(() => result.current.clearSelectedObjects());

    expect(result.current.detectedObjects).toHaveLength(0);
  });

  it('tracks processing state', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.setProcessing(true));
    expect(result.current.isProcessing).toBe(true);

    act(() => result.current.setProcessing(false));
    expect(result.current.isProcessing).toBe(false);
  });

  it('tracks progress and stage', () => {
    const { result } = renderHook(() => useEditingStore());

    act(() => result.current.setProgress(50, 'Segmentando...'));

    expect(result.current.progress).toBe(50);
    expect(result.current.progressStage).toBe('Segmentando...');
  });
});
