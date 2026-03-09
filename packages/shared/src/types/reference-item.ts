export interface ReferenceItem {
  id: string;
  project_id: string;
  name: string;
  image_url: string;
  dimensions: {
    width_m: number | null;
    depth_m: number | null;
    height_m: number | null;
  };
  material: string | null;
  color: string | null;
  position_description: string | null;
  created_at: string;
}
