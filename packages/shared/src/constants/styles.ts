export const DECOR_STYLES = [
  'moderno',
  'industrial',
  'minimalista',
  'classico',
  'escandinavo',
  'rustico',
  'tropical',
  'contemporaneo',
  'boho',
  'luxo',
] as const;

export type DecorStyle = (typeof DECOR_STYLES)[number];
