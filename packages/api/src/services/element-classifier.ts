/**
 * Element Classifier (Story 3.1, Task 2)
 * Maps SAM segment labels to predefined architectural element categories.
 */

export type ElementCategory =
  | 'wall'
  | 'floor'
  | 'countertop'
  | 'cabinet'
  | 'ceiling'
  | 'window'
  | 'door'
  | 'furniture_large'
  | 'furniture_small'
  | 'decoration'
  | 'other';

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  'wall',
  'floor',
  'countertop',
  'cabinet',
  'ceiling',
  'window',
  'door',
  'furniture_large',
  'furniture_small',
  'decoration',
  'other',
];

const LABEL_TO_CATEGORY: Record<string, ElementCategory> = {
  // Walls
  wall: 'wall',
  walls: 'wall',
  drywall: 'wall',
  partition: 'wall',
  accent_wall: 'wall',
  // Floors
  floor: 'floor',
  flooring: 'floor',
  hardwood: 'floor',
  tile_floor: 'floor',
  carpet: 'floor',
  rug: 'floor',
  // Countertops
  countertop: 'countertop',
  counter: 'countertop',
  kitchen_counter: 'countertop',
  bathroom_counter: 'countertop',
  island: 'countertop',
  // Cabinets
  cabinet: 'cabinet',
  cabinets: 'cabinet',
  kitchen_cabinet: 'cabinet',
  wardrobe: 'cabinet',
  closet: 'cabinet',
  cupboard: 'cabinet',
  shelf: 'cabinet',
  // Ceiling
  ceiling: 'ceiling',
  // Windows
  window: 'window',
  windows: 'window',
  glass: 'window',
  // Doors
  door: 'door',
  doors: 'door',
  entrance: 'door',
  // Large furniture
  sofa: 'furniture_large',
  couch: 'furniture_large',
  bed: 'furniture_large',
  table: 'furniture_large',
  dining_table: 'furniture_large',
  desk: 'furniture_large',
  bookcase: 'furniture_large',
  armchair: 'furniture_large',
  // Small furniture
  chair: 'furniture_small',
  stool: 'furniture_small',
  side_table: 'furniture_small',
  nightstand: 'furniture_small',
  ottoman: 'furniture_small',
  // Decoration
  lamp: 'decoration',
  light: 'decoration',
  mirror: 'decoration',
  painting: 'decoration',
  vase: 'decoration',
  plant: 'decoration',
  cushion: 'decoration',
  curtain: 'decoration',
};

const CONFIDENCE_THRESHOLD = 0.3;

export const elementClassifier = {
  classify(label: string, confidence: number): ElementCategory {
    if (confidence < CONFIDENCE_THRESHOLD) {
      return 'other';
    }

    const normalized = label.toLowerCase().trim().replace(/[\s-]+/g, '_');

    // Direct match
    if (LABEL_TO_CATEGORY[normalized]) {
      return LABEL_TO_CATEGORY[normalized];
    }

    // Partial match: check if any known label is contained in the input
    for (const [known, category] of Object.entries(LABEL_TO_CATEGORY)) {
      if (normalized.includes(known) || known.includes(normalized)) {
        return category;
      }
    }

    return 'other';
  },

  isValidCategory(category: string): category is ElementCategory {
    return ELEMENT_CATEGORIES.includes(category as ElementCategory);
  },

  getAllCategories(): ElementCategory[] {
    return [...ELEMENT_CATEGORIES];
  },
};
