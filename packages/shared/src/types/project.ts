import { DecorStyle } from '../constants/styles';

export type InputType = 'photo' | 'text' | 'combined';
export type ProjectStatus = 'draft' | 'analyzing' | 'croqui_review' | 'generating' | 'ready' | 'error';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  input_type: InputType;
  style: DecorStyle;
  status: ProjectStatus;
  is_favorite: boolean;
  original_image_url: string | null;
  room_type: string | null;
  created_at: string;
  updated_at: string;
}
