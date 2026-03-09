export type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
export type AsaasPaymentMethod = 'pix' | 'boleto' | 'credit_card';

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  dateCreated: string;
}

export interface AsaasCreateCustomerRequest {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  nextDueDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'OVERDUE';
  cycle: 'MONTHLY' | 'YEARLY';
  description?: string;
  externalReference?: string;
}

export interface AsaasCreateSubscriptionRequest {
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY';
  description: string;
  externalReference: string;
}

export interface AsaasPayment {
  id: string;
  subscription?: string;
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH';
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeId?: string;
  pixCopiaECola?: string;
}

export type AsaasWebhookEventType =
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'SUBSCRIPTION_DELETED'
  | 'SUBSCRIPTION_UPDATED';

export interface AsaasWebhookPayload {
  event: AsaasWebhookEventType;
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
}

export const BILLING_TYPE_MAP: Record<AsaasPaymentMethod, AsaasBillingType> = {
  pix: 'PIX',
  boleto: 'BOLETO',
  credit_card: 'CREDIT_CARD',
};
