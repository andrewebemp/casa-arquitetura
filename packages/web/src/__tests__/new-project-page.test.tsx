import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import NewProjectPage from '@/app/(dashboard)/projects/new/page';
import * as wizardService from '@/services/staging-wizard-service';

jest.mock('@/services/staging-wizard-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

const mockedService = wizardService as jest.Mocked<typeof wizardService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('NewProjectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.fetchStyles.mockResolvedValue([
      'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
      'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo',
    ]);
    mockedService.subscribeToProgress.mockReturnValue(jest.fn());
  });

  it('renders wizard with step 1 active', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
    expect(screen.getByText('Como voce quer comecar?')).toBeInTheDocument();
    expect(screen.getByText('Foto do Local')).toBeInTheDocument();
    expect(screen.getByText('Descricao com Medidas')).toBeInTheDocument();
    expect(screen.getByText('Combinado')).toBeInTheDocument();
  });

  it('shows StepIndicator with 5 steps', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Tipo de Input')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Estilo')).toBeInTheDocument();
    expect(screen.getByText('Croqui')).toBeInTheDocument();
    expect(screen.getByText('Geracao')).toBeInTheDocument();
  });

  it('Proximo button disabled when no input type selected', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    const nextButton = screen.getByText('Proximo');
    expect(nextButton).toBeDisabled();
  });

  it('enables Proximo button after selecting input type', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Foto do Local'));

    const nextButton = screen.getByText('Proximo');
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates to Step 2 (photo variant) after selecting photo', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Foto do Local'));
    fireEvent.click(screen.getByText('Proximo'));

    expect(screen.getByText('Detalhes do ambiente')).toBeInTheDocument();
    expect(screen.getByText(/Arraste a foto aqui/)).toBeInTheDocument();
  });

  it('navigates to Step 2 (text variant) after selecting text', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Descricao com Medidas'));
    fireEvent.click(screen.getByText('Proximo'));

    expect(screen.getByText('Detalhes do ambiente')).toBeInTheDocument();
    expect(screen.getByLabelText('Largura (m) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Comprimento (m) *')).toBeInTheDocument();
  });

  it('shows reference items section in Step 2', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Descricao com Medidas'));
    fireEvent.click(screen.getByText('Proximo'));

    expect(screen.getByText('Itens especificos')).toBeInTheDocument();
    expect(screen.getByText('Adicionar item')).toBeInTheDocument();
  });

  it('Voltar button returns to Step 1', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Foto do Local'));
    fireEvent.click(screen.getByText('Proximo'));

    expect(screen.getByText('Detalhes do ambiente')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Voltar'));

    expect(screen.getByText('Como voce quer comecar?')).toBeInTheDocument();
  });

  it('Voltar button disabled on Step 1', () => {
    render(<NewProjectPage />, { wrapper: createWrapper() });

    const backButton = screen.getByText('Voltar');
    expect(backButton).toBeDisabled();
  });

  it('creates project and advances to step 3 on text input', async () => {
    mockedService.createProject.mockResolvedValue('project-123');
    mockedService.submitSpatialInput.mockResolvedValue(undefined);

    render(<NewProjectPage />, { wrapper: createWrapper() });

    // Step 1: select text input
    fireEvent.click(screen.getByText('Descricao com Medidas'));
    fireEvent.click(screen.getByText('Proximo'));

    // Step 2: fill dimensions
    fireEvent.change(screen.getByLabelText('Largura (m) *'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Comprimento (m) *'), { target: { value: '4' } });

    // Click Proximo to create project
    fireEvent.click(screen.getByText('Proximo'));

    await waitFor(() => {
      expect(mockedService.createProject).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Escolha o estilo de decoracao')).toBeInTheDocument();
    });
  });
});
