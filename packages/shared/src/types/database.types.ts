/**
 * Database type stub aligned with Supabase schema (Story 7.2 migrations).
 * Will be replaced by auto-generated types from `supabase gen types` in a future story.
 */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          preferred_style: string | null;
          lgpd_consent_at: string | null;
          training_opt_in: boolean;
          nps_last_prompted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          preferred_style?: string | null;
          lgpd_consent_at?: string | null;
          nps_last_prompted_at?: string | null;
          training_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          preferred_style?: string | null;
          lgpd_consent_at?: string | null;
          nps_last_prompted_at?: string | null;
          training_opt_in?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_data_exports: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          requested_at: string;
          completed_at: string | null;
          download_url: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          requested_at?: string;
          completed_at?: string | null;
          download_url?: string | null;
          expires_at?: string | null;
        };
        Update: {
          status?: string;
          completed_at?: string | null;
          download_url?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          input_type: 'photo' | 'text' | 'combined';
          style: string;
          status: 'draft' | 'analyzing' | 'croqui_review' | 'generating' | 'ready' | 'error';
          room_type: string | null;
          is_favorite: boolean;
          original_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          input_type: 'photo' | 'text' | 'combined';
          style: string;
          status?: string;
          room_type?: string | null;
          is_favorite?: boolean;
          original_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          style?: string;
          status?: string;
          room_type?: string | null;
          is_favorite?: boolean;
          original_image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_versions: {
        Row: {
          id: string;
          project_id: string;
          version_number: number;
          image_url: string;
          thumbnail_url: string;
          prompt: string;
          refinement_command: string | null;
          quality_scores: Record<string, unknown>;
          metadata: Record<string, unknown>;
          render_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_number: number;
          image_url: string;
          thumbnail_url: string;
          prompt?: string;
          refinement_command?: string | null;
          quality_scores?: Record<string, unknown>;
          metadata?: Record<string, unknown>;
          render_url?: string | null;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          thumbnail_url?: string;
          prompt?: string;
          refinement_command?: string | null;
          quality_scores?: Record<string, unknown>;
          metadata?: Record<string, unknown>;
          render_url?: string | null;
        };
        Relationships: [];
      };
      spatial_inputs: {
        Row: {
          id: string;
          project_id: string;
          dimensions: Record<string, unknown> | null;
          openings: Record<string, unknown>[];
          items: Record<string, unknown>[];
          croqui_ascii: string | null;
          croqui_approved: boolean;
          croqui_turn_number: number;
          photo_interpretation: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          dimensions?: Record<string, unknown> | null;
          openings?: Record<string, unknown>[];
          items?: Record<string, unknown>[];
          croqui_ascii?: string | null;
          croqui_approved?: boolean;
          croqui_turn_number?: number;
          photo_interpretation?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          dimensions?: Record<string, unknown> | null;
          openings?: Record<string, unknown>[];
          items?: Record<string, unknown>[];
          croqui_ascii?: string | null;
          croqui_approved?: boolean;
          croqui_turn_number?: number;
          photo_interpretation?: Record<string, unknown> | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reference_items: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          image_url: string;
          width_m: number | null;
          depth_m: number | null;
          height_m: number | null;
          material: string | null;
          color: string | null;
          position_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          image_url: string;
          width_m?: number | null;
          depth_m?: number | null;
          height_m?: number | null;
          material?: string | null;
          color?: string | null;
          position_description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          image_url?: string;
          width_m?: number | null;
          depth_m?: number | null;
          height_m?: number | null;
          material?: string | null;
          color?: string | null;
          position_description?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          project_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          operations: Record<string, unknown> | null;
          version_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          operations?: Record<string, unknown> | null;
          version_id?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          operations?: Record<string, unknown> | null;
          version_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'free' | 'pro' | 'business';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          payment_gateway: 'stripe' | 'asaas' | null;
          gateway_customer_id: string | null;
          gateway_subscription_id: string | null;
          renders_used: number;
          renders_limit: number;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: string;
          status?: string;
          payment_gateway?: string | null;
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          renders_used?: number;
          renders_limit?: number;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tier?: string;
          status?: string;
          payment_gateway?: string | null;
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          renders_used?: number;
          renders_limit?: number;
          current_period_start?: string;
          current_period_end?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diagnostics: {
        Row: {
          id: string;
          user_id: string | null;
          original_image_url: string;
          staged_preview_url: string | null;
          analysis: Record<string, unknown>;
          session_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          original_image_url: string;
          staged_preview_url?: string | null;
          analysis?: Record<string, unknown>;
          session_token?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          original_image_url?: string;
          staged_preview_url?: string | null;
          analysis?: Record<string, unknown>;
          session_token?: string | null;
        };
        Relationships: [];
      };
      render_jobs: {
        Row: {
          id: string;
          project_id: string;
          version_id: string | null;
          type: 'initial' | 'refinement' | 'style_change' | 'segmentation' | 'diagnostic' | 'upscale' | 'lighting_enhancement' | 'object_removal';
          status: 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
          priority: number;
          input_params: Record<string, unknown>;
          output_params: Record<string, unknown> | null;
          gpu_provider: string | null;
          cost_cents: number | null;
          duration_ms: number | null;
          error_message: string | null;
          attempts: number;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_id?: string | null;
          type: 'initial' | 'refinement' | 'style_change' | 'segmentation' | 'diagnostic' | 'upscale' | 'lighting_enhancement' | 'object_removal';
          status?: string;
          priority?: number;
          input_params?: Record<string, unknown>;
          output_params?: Record<string, unknown> | null;
          gpu_provider?: string | null;
          cost_cents?: number | null;
          duration_ms?: number | null;
          error_message?: string | null;
          attempts?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          version_id?: string | null;
          status?: string;
          priority?: number;
          input_params?: Record<string, unknown>;
          output_params?: Record<string, unknown> | null;
          gpu_provider?: string | null;
          cost_cents?: number | null;
          duration_ms?: number | null;
          error_message?: string | null;
          attempts?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      share_links: {
        Row: {
          id: string;
          project_id: string;
          version_id: string;
          share_token: string;
          include_watermark: boolean;
          expires_at: string | null;
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_id: string;
          share_token?: string;
          include_watermark?: boolean;
          expires_at?: string | null;
          view_count?: number;
          created_at?: string;
        };
        Update: {
          include_watermark?: boolean;
          expires_at?: string | null;
          view_count?: number;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      render_ratings: {
        Row: {
          id: string;
          render_id: string;
          user_id: string;
          score: number;
          tags: string[];
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          render_id: string;
          user_id: string;
          score: number;
          tags?: string[];
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          score?: number;
          tags?: string[];
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      nps_responses: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          comment: string | null;
          user_tier: string;
          total_renders: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          comment?: string | null;
          user_tier?: string;
          total_renders?: number;
          created_at?: string;
        };
        Update: {
          score?: number;
          comment?: string | null;
          user_tier?: string;
          total_renders?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
