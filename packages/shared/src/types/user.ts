import { DecorStyle } from '../constants/styles';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_style: DecorStyle | null;
  lgpd_consent_at: string | null;
  training_opt_in: boolean;
  created_at: string;
  updated_at: string;
}
