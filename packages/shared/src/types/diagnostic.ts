export interface DiagnosticIssue {
  category: 'lighting' | 'staging' | 'composition' | 'quality' | 'clutter';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface DiagnosticAnalysis {
  issues: DiagnosticIssue[];
  estimated_loss_percent: number;
  estimated_loss_brl: number | null;
  overall_score: number;
  recommendations: string[];
}

export interface DiagnosticCta {
  message: string;
  plan_recommended: 'pro' | 'business';
  upgrade_url: string;
}

export interface Diagnostic {
  id: string;
  user_id: string | null;
  original_image_url: string;
  staged_preview_url: string | null;
  analysis: DiagnosticAnalysis;
  session_token: string | null;
  created_at: string;
}

export interface DiagnosticResponse extends Diagnostic {
  cta: DiagnosticCta;
}
