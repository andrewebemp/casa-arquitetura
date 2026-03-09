'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { SegmentResult, DetectObjectResponse } from '@/services/editing-service';

export interface NormalizedCoords {
  x: number;
  y: number;
}

interface ImageCanvasProps {
  imageUrl: string | null;
  segments: SegmentResult[];
  selectedSegmentId: string | null;
  removeMasks: DetectObjectResponse[];
  isProcessing: boolean;
  progressStage: string;
  progress: number;
  onImageClick: (coords: NormalizedCoords) => void;
  onSegmentClick: (segmentId: string) => void;
}

const SEGMENT_COLORS: Record<string, string> = {
  wall: 'rgba(59, 130, 246, 0.3)',
  floor: 'rgba(16, 185, 129, 0.3)',
  countertop: 'rgba(245, 158, 11, 0.3)',
  cabinet: 'rgba(139, 92, 246, 0.3)',
  ceiling: 'rgba(236, 72, 153, 0.3)',
  window: 'rgba(6, 182, 212, 0.3)',
  door: 'rgba(217, 119, 6, 0.3)',
  furniture_large: 'rgba(79, 70, 229, 0.3)',
  furniture_small: 'rgba(168, 85, 247, 0.3)',
  decoration: 'rgba(244, 63, 94, 0.3)',
  other: 'rgba(107, 114, 128, 0.3)',
};

export function normalizeCoordinates(
  clientX: number,
  clientY: number,
  rect: DOMRect
): NormalizedCoords {
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  return { x, y };
}

export function ImageCanvas({
  imageUrl,
  segments,
  selectedSegmentId,
  removeMasks,
  isProcessing,
  progressStage,
  progress,
  onImageClick,
  onSegmentClick,
}: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchScale, setTouchScale] = useState(1);
  const [touchOrigin, setTouchOrigin] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isProcessing) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const coords = normalizeCoordinates(e.clientX, e.clientY, rect);
      onImageClick(coords);
    },
    [isProcessing, onImageClick]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / lastTouchDist.current;
      setTouchScale((prev) => Math.max(1, Math.min(4, prev * scale)));
      setTouchOrigin({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      });
      lastTouchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  useEffect(() => {
    if (touchScale <= 1) {
      setTouchScale(1);
      setTouchOrigin({ x: 0, y: 0 });
    }
  }, [touchScale]);

  const transformStyle = touchScale > 1
    ? { transform: `scale(${touchScale})`, transformOrigin: `${touchOrigin.x}px ${touchOrigin.y}px` }
    : undefined;

  function polygonToSvgPath(polygon: number[][]): string {
    if (polygon.length === 0) return '';
    return polygon
      .map((point, i) => `${i === 0 ? 'M' : 'L'}${point[0] * 100}%,${point[1] * 100}%`)
      .join(' ') + ' Z';
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-crosshair overflow-hidden rounded-xl bg-gray-100"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="img"
      aria-label="Area de edicao da imagem"
    >
      {imageUrl ? (
        <div style={transformStyle} className="h-full w-full transition-transform duration-150">
          <img
            src={imageUrl}
            alt="Render do ambiente"
            className="h-full w-full object-contain"
            draggable={false}
          />

          {/* SVG overlay for segments */}
          {segments.length > 0 && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100% 100%"
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            >
              {segments.map((seg) => {
                const isSelected = seg.segment_id === selectedSegmentId;
                const fillColor = seg.color || SEGMENT_COLORS[seg.label] || SEGMENT_COLORS.other;
                return (
                  <g key={seg.segment_id}>
                    <polygon
                      points={seg.mask_polygon.map((p) => `${p[0] * 100}%,${p[1] * 100}%`).join(' ')}
                      fill={fillColor}
                      stroke={isSelected ? '#0074c5' : 'transparent'}
                      strokeWidth={isSelected ? '2' : '0'}
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentClick(seg.segment_id);
                      }}
                    />
                    {/* Label */}
                    {seg.mask_polygon.length > 0 && (
                      <text
                        x={`${(seg.mask_polygon.reduce((sum, p) => sum + p[0], 0) / seg.mask_polygon.length) * 100}%`}
                        y={`${(seg.mask_polygon.reduce((sum, p) => sum + p[1], 0) / seg.mask_polygon.length) * 100}%`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-gray-900 text-xs font-semibold"
                        style={{ pointerEvents: 'none', textShadow: '0 0 3px white, 0 0 3px white' }}
                      >
                        {seg.label_pt}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Red overlays for object removal masks */}
          {removeMasks.length > 0 && (
            <svg
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            >
              {removeMasks.map((mask) => (
                <polygon
                  key={mask.mask_id}
                  points={mask.mask_polygon.map((p) => `${p[0] * 100}%,${p[1] * 100}%`).join(' ')}
                  fill="rgba(239, 68, 68, 0.4)"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              ))}
            </svg>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          Nenhum render disponivel
        </div>
      )}

      {/* AI disclaimer */}
      <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs text-white/80">
        Imagem ilustrativa gerada por IA
      </span>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="mt-2 text-sm font-medium text-white">{progressStage || 'Processando...'}</p>
          {progress > 0 && (
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso da edicao"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
