import { DecorStyle } from '../constants/styles';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_style: DecorStyle | null;
  lgpd_consent_at: string | null;
  lgpd_consent_version: string | null;
  training_opt_in: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
