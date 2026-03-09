import type { SubscriptionTier } from '../types/subscription';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTierData {
  tier: SubscriptionTier;
  name: string;
  priceLabel: string;
  priceNote?: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaLabelUpgrade: string;
  ctaLabelDowngrade: string;
  popular?: boolean;
}

export const PRICING_TIERS: PricingTierData[] = [
  {
    tier: 'free',
    name: 'Free',
    priceLabel: 'R$ 0',
    priceNote: 'para sempre',
    features: [
      { text: '3 renders/mes', included: true },
      { text: 'Marca d\'agua', included: true },
      { text: '1 estilo por vez', included: true },
      { text: 'Resolucao 1024px', included: true },
      { text: 'Chat de refinamento', included: false },
      { text: 'Exportar HD 2048px', included: false },
      { text: 'Suporte prioritario', included: false },
      { text: 'API access', included: false },
    ],
    ctaLabel: 'Comecar Gratis',
    ctaLabelUpgrade: 'Comecar Gratis',
    ctaLabelDowngrade: 'Fazer Downgrade',
  },
  {
    tier: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 79-149',
    priceNote: '/mes',
    features: [
      { text: '100 renders/mes', included: true },
      { text: 'Sem marca d\'agua', included: true },
      { text: 'Chat de refinamento', included: true },
      { text: 'Todos os estilos', included: true },
      { text: 'Exportar HD 2048px', included: true },
      { text: 'Suporte prioritario', included: false },
      { text: 'API access', included: false },
    ],
    ctaLabel: 'Assinar Pro',
    ctaLabelUpgrade: 'Fazer Upgrade',
    ctaLabelDowngrade: 'Fazer Downgrade',
    popular: true,
  },
  {
    tier: 'business',
    name: 'Business',
    priceLabel: 'R$ 299-499',
    priceNote: '/mes',
    features: [
      { text: '500 renders/mes', included: true },
      { text: 'Sem marca d\'agua', included: true },
      { text: 'Chat de refinamento', included: true },
      { text: 'Todos os estilos', included: true },
      { text: 'Exportar HD 2048px', included: true },
      { text: 'Suporte prioritario', included: true },
      { text: 'API access', included: true },
    ],
    ctaLabel: 'Assinar Business',
    ctaLabelUpgrade: 'Fazer Upgrade',
    ctaLabelDowngrade: 'Fazer Downgrade',
  },
];

export const PRICING_FAQ = [
  {
    question: 'Posso trocar de plano?',
    answer: 'Sim! Voce pode fazer upgrade ou downgrade a qualquer momento. A cobranca sera ajustada proporcionalmente ao periodo restante do seu ciclo de faturamento.',
  },
  {
    question: 'Como funciona o periodo de teste?',
    answer: 'O plano Free e gratuito para sempre com 3 renders por mes. Nao ha periodo de teste nos planos pagos, mas voce pode cancelar a qualquer momento sem multa.',
  },
  {
    question: 'Quais formas de pagamento?',
    answer: 'Aceitamos cartoes de credito (Visa, Mastercard, Elo, American Express) e boleto bancario atraves do Stripe, nosso processador de pagamentos seguro.',
  },
  {
    question: 'O que acontece se meus renders acabarem?',
    answer: 'No plano Free, voce precisara aguardar o proximo mes ou fazer upgrade. Nos planos Pro e Business, renders adicionais podem ser adquiridos separadamente ou voce pode fazer upgrade para um plano com mais renders.',
  },
];
