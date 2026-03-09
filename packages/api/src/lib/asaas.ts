import { env } from '../config/env';
import { logger } from './logger';
import { AppError } from './errors';
import type {
  AsaasCustomer,
  AsaasCreateCustomerRequest,
  AsaasSubscription,
  AsaasCreateSubscriptionRequest,
  AsaasPayment,
} from '@decorai/shared';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function asaasRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  retries = MAX_RETRIES,
): Promise<T> {
  const url = `${env.ASAAS_API_URL}/v3${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'access_token': env.ASAAS_API_KEY,
        },
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error({ status: response.status, errorBody, path }, 'Asaas API error');

        if (response.status >= 500 && attempt < retries) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        throw new AppError({
          code: 'ASAAS_API_ERROR',
          message: `Asaas API error: ${response.status} ${errorBody}`,
          statusCode: response.status >= 500 ? 502 : 400,
        });
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      logger.error({ err: error, path }, 'Asaas API request failed');
      throw new AppError({
        code: 'ASAAS_CONNECTION_ERROR',
        message: 'Falha ao conectar com Asaas API',
        statusCode: 502,
      });
    }
  }

  throw new AppError({
    code: 'ASAAS_MAX_RETRIES',
    message: 'Maximo de tentativas excedido para Asaas API',
    statusCode: 502,
  });
}

export const asaasClient = {
  async createCustomer(data: AsaasCreateCustomerRequest): Promise<AsaasCustomer> {
    return asaasRequest<AsaasCustomer>('POST', '/customers', data);
  },

  async findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
    const result = await asaasRequest<{ data: AsaasCustomer[] }>(
      'GET',
      `/customers?email=${encodeURIComponent(email)}`,
    );
    return result.data.length > 0 ? result.data[0] : null;
  },

  async createSubscription(data: AsaasCreateSubscriptionRequest): Promise<AsaasSubscription> {
    return asaasRequest<AsaasSubscription>('POST', '/subscriptions', data);
  },

  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return asaasRequest<AsaasSubscription>('GET', `/subscriptions/${subscriptionId}`);
  },

  async cancelSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return asaasRequest<AsaasSubscription>('DELETE', `/subscriptions/${subscriptionId}`);
  },

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return asaasRequest<AsaasPayment>('GET', `/payments/${paymentId}`);
  },
};
