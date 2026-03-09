import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StyleGrid } from '@/components/molecules/StyleGrid';
import * as stagingService from '@/services/staging-wizard-service';

jest.mock('@/services/staging-wizard-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockedService = stagingService as jest.Mocked<typeof stagingService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('StyleGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.fetchStyles.mockResolvedValue([
      'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
      'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo',
    ]);
  });

  it('renders loading skeleton', () => {
    mockedService.fetchStyles.mockReturnValue(new Promise(() => {}));

    const { container } = render(
      <StyleGrid selectedStyle={null} onSelectStyle={jest.fn()} />,
      { wrapper: createWrapper() }
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(10);
  });

  it('renders all 10 styles after loading', async () => {
    render(
      <StyleGrid selectedStyle={null} onSelectStyle={jest.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('Moderno')).toBeInTheDocument();
    expect(screen.getByText('Industrial')).toBeInTheDocument();
    expect(screen.getByText('Minimalista')).toBeInTheDocument();
    expect(screen.getByText('Classico')).toBeInTheDocument();
    expect(screen.getByText('Escandinavo')).toBeInTheDocument();
    expect(screen.getByText('Rustico')).toBeInTheDocument();
    expect(screen.getByText('Tropical')).toBeInTheDocument();
    expect(screen.getByText('Contemporaneo')).toBeInTheDocument();
    expect(screen.getByText('Boho')).toBeInTheDocument();
    expect(screen.getByText('Luxo')).toBeInTheDocument();
  });

  it('highlights selected style', async () => {
    render(
      <StyleGrid selectedStyle="industrial" onSelectStyle={jest.fn()} />,
      { wrapper: createWrapper() }
    );

    const button = (await screen.findByText('Industrial')).closest('button')!;
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelectStyle when style clicked', async () => {
    const onSelectStyle = jest.fn();
    render(
      <StyleGrid selectedStyle={null} onSelectStyle={onSelectStyle} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(await screen.findByText('Moderno'));
    expect(onSelectStyle).toHaveBeenCalledWith('moderno');
  });
});
