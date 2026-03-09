import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import DiagnosticoPage from '@/app/diagnostico/page';
import * as diagnosticsService from '@/services/diagnostics-service';
import type { DiagnosticResponse } from '@decorai/shared';

// Mock supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('@/services/diagnostics-service');

const mockedService = diagnosticsService as jest.Mocked<typeof diagnosticsService>;

const mockDiagnosticResult: DiagnosticResponse = {
  id: 'diag-1',
  user_id: null,
  original_image_url: 'https://example.com/original.jpg',
  staged_preview_url: null,
  analysis: {
    overall_score: 45,
    estimated_loss_percent: 25,
    estimated_loss_brl: null,
    issues: [
      { category: 'lighting', severity: 'high', description: 'Iluminacao fraca' },
      { category: 'staging', severity: 'medium', description: 'Sem decoracao' },
    ],
    recommendations: ['Melhore a iluminacao'],
  },
  session_token: null,
  created_at: '2026-01-15T12:00:00Z',
  cta: {
    message: 'Seu imovel tem potencial.',
    plan_recommended: 'pro',
    upgrade_url: '/pricing',
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('DiagnosticoPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('renders hero section and upload area', () => {
    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Descubra quanto seu imovel esta perdendo')).toBeInTheDocument();
    expect(screen.getByText(/Arraste a foto do seu imovel/)).toBeInTheDocument();
  });

  it('shows submit button after selecting a photo', () => {
    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
  });

  it('shows loading state during analysis', async () => {
    // Make createDiagnostic hang so we can observe the loading state
    mockedService.createDiagnostic.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: 'diag-1', session_token: null }), 5000))
    );

    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    // Select file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    // Click submit — don't await, just trigger
    act(() => {
      fireEvent.click(screen.getByText('Analisar Meu Imovel'));
    });

    // Should show loading immediately
    await waitFor(() => {
      expect(screen.getByText('Analisando seu imovel...')).toBeInTheDocument();
    });
  });

  it('shows result after successful analysis', async () => {
    mockedService.createDiagnostic.mockResolvedValue({ id: 'diag-1', session_token: null });
    mockedService.uploadDiagnosticPhoto.mockResolvedValue({ image_url: 'https://example.com/photo.jpg' });
    mockedService.getDiagnosticResult.mockResolvedValue(mockDiagnosticResult);

    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    // Select file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByText('Analisar Meu Imovel'));
    });

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('Resultado da Analise')).toBeInTheDocument();
    });

    // Verify result components
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Iluminacao fraca')).toBeInTheDocument();
    expect(screen.getByText('Ver Planos')).toBeInTheDocument();
  });

  it('shows error state and retry button on failure', async () => {
    mockedService.createDiagnostic.mockRejectedValue(new Error('Falha ao criar diagnostico'));

    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    // Select file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByText('Analisar Meu Imovel'));
    });

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Erro na analise')).toBeInTheDocument();
      expect(screen.getByText('Falha ao criar diagnostico')).toBeInTheDocument();
    });

    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('calls correct API sequence on submit', async () => {
    mockedService.createDiagnostic.mockResolvedValue({ id: 'diag-1', session_token: 'tok-1' });
    mockedService.uploadDiagnosticPhoto.mockResolvedValue({ image_url: 'https://example.com/photo.jpg' });
    mockedService.getDiagnosticResult.mockResolvedValue(mockDiagnosticResult);

    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    // Select file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByText('Analisar Meu Imovel'));
    });

    await waitFor(() => {
      expect(mockedService.createDiagnostic).toHaveBeenCalled();
      expect(mockedService.uploadDiagnosticPhoto).toHaveBeenCalledWith('diag-1', validFile);
      expect(mockedService.getDiagnosticResult).toHaveBeenCalledWith('diag-1');
    });
  });

  it('shows new analysis button after result', async () => {
    mockedService.createDiagnostic.mockResolvedValue({ id: 'diag-1', session_token: null });
    mockedService.uploadDiagnosticPhoto.mockResolvedValue({ image_url: 'https://example.com/photo.jpg' });
    mockedService.getDiagnosticResult.mockResolvedValue(mockDiagnosticResult);

    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    // Select file and submit
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    await act(async () => {
      fireEvent.click(screen.getByText('Analisar Meu Imovel'));
    });

    await waitFor(() => {
      expect(screen.getByText('Analisar outro imovel')).toBeInTheDocument();
    });
  });

  it('does not show submit button without photo', () => {
    render(<DiagnosticoPage />, { wrapper: createWrapper() });

    expect(screen.queryByText('Analisar Meu Imovel')).not.toBeInTheDocument();
  });
});
