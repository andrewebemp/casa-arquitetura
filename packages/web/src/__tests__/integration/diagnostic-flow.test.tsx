import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiagnosticoPage from '@/app/diagnostico/page';

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

// Mock BeforeAfterSlider
jest.mock('@/components/molecules/BeforeAfterSlider', () => ({
  BeforeAfterSlider: () => <div data-testid="before-after-slider" />,
}));

// Mock diagnostics service
const mockCreateDiagnostic = jest.fn();
const mockUploadDiagnosticPhoto = jest.fn();
const mockGetDiagnosticResult = jest.fn();

jest.mock('@/services/diagnostics-service', () => ({
  createDiagnostic: (...args: unknown[]) => mockCreateDiagnostic(...args),
  uploadDiagnosticPhoto: (...args: unknown[]) => mockUploadDiagnosticPhoto(...args),
  getDiagnosticResult: (...args: unknown[]) => mockGetDiagnosticResult(...args),
}));

const mockDiagnosticResponse = {
  id: 'diag-test-1',
  user_id: null,
  original_image_url: 'https://example.com/original.jpg',
  staged_preview_url: 'https://example.com/staged.jpg',
  analysis: {
    overall_score: 42,
    estimated_loss_percent: 22,
    estimated_loss_brl: null,
    issues: [
      { category: 'lighting' as const, severity: 'high' as const, description: 'Iluminacao fraca' },
    ],
    recommendations: ['Melhorar iluminacao'],
  },
  cta: {
    message: 'Melhore seu anuncio!',
    plan_recommended: 'pro' as const,
    upgrade_url: '/pricing',
  },
  session_token: 'tok-123',
  created_at: '2026-03-09T12:00:00Z',
};

describe('Diagnostic Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('renders landing page with correct title', () => {
    render(<DiagnosticoPage />);

    expect(screen.getByText('Descubra quanto seu imovel esta perdendo')).toBeInTheDocument();
  });

  it('shows upload area on initial load', () => {
    render(<DiagnosticoPage />);

    expect(screen.getByLabelText('Area de upload de foto do imovel')).toBeInTheDocument();
  });

  it('shows submit button after photo selection', async () => {
    const user = userEvent.setup();
    render(<DiagnosticoPage />);

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
    });
  });

  it('shows loading state during analysis', async () => {
    const user = userEvent.setup();

    mockCreateDiagnostic.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: 'diag-1', session_token: null }), 100))
    );

    render(<DiagnosticoPage />);

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Analisar Meu Imovel'));

    await waitFor(() => {
      expect(screen.getByText('Analisando seu imovel...')).toBeInTheDocument();
    });
  });

  it('shows results after successful analysis', async () => {
    const user = userEvent.setup();

    mockCreateDiagnostic.mockResolvedValue({ id: 'diag-1', session_token: 'tok-1' });
    mockUploadDiagnosticPhoto.mockResolvedValue({ image_url: 'https://example.com/img.jpg' });
    mockGetDiagnosticResult.mockResolvedValue(mockDiagnosticResponse);

    render(<DiagnosticoPage />);

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Analisar Meu Imovel'));

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText('22%')).toBeInTheDocument();
    expect(screen.getByText('Melhore seu anuncio!')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    const user = userEvent.setup();

    mockCreateDiagnostic.mockRejectedValue(new Error('Falha na rede'));

    render(<DiagnosticoPage />);

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Analisar Meu Imovel'));

    await waitFor(() => {
      expect(screen.getByText('Falha na rede')).toBeInTheDocument();
    });

    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('allows retry after error', async () => {
    const user = userEvent.setup();

    mockCreateDiagnostic
      .mockRejectedValueOnce(new Error('Erro'))
      .mockResolvedValueOnce({ id: 'diag-2', session_token: null });
    mockUploadDiagnosticPhoto.mockResolvedValue({ image_url: 'url' });
    mockGetDiagnosticResult.mockResolvedValue(mockDiagnosticResponse);

    render(<DiagnosticoPage />);

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('Analisar Meu Imovel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Analisar Meu Imovel'));

    await waitFor(() => {
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tentar Novamente'));

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
