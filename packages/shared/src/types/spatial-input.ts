export interface RoomDimensions {
  width_m: number;
  length_m: number;
  height_m: number;
}

export interface Opening {
  type: 'door' | 'window' | 'archway';
  wall: 'north' | 'south' | 'east' | 'west';
  width_m: number;
  height_m: number;
  offset_m: number;
}

export interface PositionedItem {
  name: string;
  width_m: number;
  depth_m: number;
  height_m: number | null;
  position: { x_m: number; y_m: number };
  reference_image_url: string | null;
  material: string | null;
}

export interface PhotoInterpretation {
  estimated_dimensions: RoomDimensions;
  detected_openings: Opening[];
  detected_elements: string[];
  confidence: number;
}

export interface SpatialInput {
  id: string;
  project_id: string;
  dimensions: RoomDimensions | null;
  openings: Opening[];
  items: PositionedItem[];
  croqui_ascii: string | null;
  croqui_approved: boolean;
  photo_interpretation: PhotoInterpretation | null;
  created_at: string;
  updated_at: string;
}
