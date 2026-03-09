import { DiagnosticAnalysis, DiagnosticIssue } from '@decorai/shared';
import { logger } from '../lib/logger';

type IssueCategory = DiagnosticIssue['category'];
type IssueSeverity = DiagnosticIssue['severity'];

interface AnalysisInput {
  imageUrl: string;
}

function scoreSeverity(severity: IssueSeverity): number {
  const map: Record<IssueSeverity, number> = { high: 20, medium: 12, low: 5 };
  return map[severity];
}

function buildIssues(): DiagnosticIssue[] {
  const categories: IssueCategory[] = ['lighting', 'staging', 'composition', 'quality', 'clutter'];
  const issueTemplates: Record<IssueCategory, { description: string; severity: IssueSeverity }[]> = {
    lighting: [
      { description: 'Iluminacao insuficiente — ambiente parece escuro e pouco convidativo', severity: 'high' },
      { description: 'Sombras duras criam areas de contraste excessivo', severity: 'medium' },
    ],
    staging: [
      { description: 'Ambiente sem mobilia ou decoracao — parece abandonado', severity: 'high' },
      { description: 'Disposicao dos moveis nao valoriza o espaco', severity: 'medium' },
      { description: 'Faltam elementos decorativos que transmitam aconchego', severity: 'low' },
    ],
    composition: [
      { description: 'Angulo da foto nao mostra o ambiente por completo', severity: 'medium' },
      { description: 'Enquadramento cortou elementos importantes do comodo', severity: 'high' },
    ],
    quality: [
      { description: 'Resolucao da imagem abaixo do ideal para anuncio profissional', severity: 'medium' },
      { description: 'Imagem com ruido ou desfoque perceptivel', severity: 'high' },
    ],
    clutter: [
      { description: 'Objetos pessoais visiveis que distraem o comprador', severity: 'medium' },
      { description: 'Acumulo de itens que reduz a percepcao de espaco', severity: 'high' },
    ],
  };

  const issues: DiagnosticIssue[] = [];

  for (const category of categories) {
    const templates = issueTemplates[category];
    const selected = templates[Math.floor(Math.random() * templates.length)];
    if (Math.random() > 0.3) {
      issues.push({
        category,
        severity: selected.severity,
        description: selected.description,
      });
    }
  }

  if (issues.length === 0) {
    const fallback = issueTemplates.staging[2];
    issues.push({ category: 'staging', severity: fallback.severity, description: fallback.description });
  }

  return issues;
}

function buildRecommendations(issues: DiagnosticIssue[]): string[] {
  const recMap: Record<IssueCategory, string> = {
    lighting: 'Melhore a iluminacao com luzes quentes e naturais para criar atmosfera acolhedora',
    staging: 'Adicione mobilia e decoracao virtual para mostrar o potencial do espaco',
    composition: 'Fotografe de angulos mais abertos para capturar todo o ambiente',
    quality: 'Utilize uma camera de maior resolucao ou melhore as condicoes de captura',
    clutter: 'Remova objetos pessoais e organize o ambiente antes de fotografar',
  };

  const recs = issues.map((issue) => recMap[issue.category]);
  recs.push('Considere staging virtual profissional para aumentar o valor percebido do imovel');

  return [...new Set(recs)];
}

export const diagnosticAnalyzerService = {
  async analyze(input: AnalysisInput): Promise<DiagnosticAnalysis> {
    logger.info({ imageUrl: input.imageUrl }, 'Starting diagnostic analysis');

    const issues = buildIssues();

    const totalPenalty = issues.reduce((sum, i) => sum + scoreSeverity(i.severity), 0);
    const overall_score = Math.max(0, Math.min(100, 100 - totalPenalty));

    const highCount = issues.filter((i) => i.severity === 'high').length;
    const mediumCount = issues.filter((i) => i.severity === 'medium').length;
    const estimated_loss_percent = Math.min(
      100,
      Math.max(0, highCount * 15 + mediumCount * 8 + (100 - overall_score) * 0.3),
    );

    const recommendations = buildRecommendations(issues);

    const analysis: DiagnosticAnalysis = {
      issues,
      estimated_loss_percent: Math.round(estimated_loss_percent),
      estimated_loss_brl: null,
      overall_score,
      recommendations,
    };

    logger.info(
      { score: overall_score, issueCount: issues.length, lossPercent: estimated_loss_percent },
      'Diagnostic analysis complete',
    );

    return analysis;
  },
};
