import { render, screen, act } from '@testing-library/react';
import { DiagnosticLoading } from '@/components/diagnostic/DiagnosticLoading';

describe('DiagnosticLoading', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders progress bar with correct value', () => {
    render(<DiagnosticLoading progress={60} />);

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('shows main heading', () => {
    render(<DiagnosticLoading progress={0} />);

    expect(screen.getByText('Analisando seu imovel...')).toBeInTheDocument();
  });

  it('displays rotating analysis steps', () => {
    render(<DiagnosticLoading progress={30} />);

    // First step should be visible
    expect(screen.getByText('Analisando iluminacao...')).toBeInTheDocument();

    // Advance timer to trigger rotation
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Avaliando composicao...')).toBeInTheDocument();
  });

  it('cycles through all steps', () => {
    render(<DiagnosticLoading progress={50} />);

    // Step 0
    expect(screen.getByText('Analisando iluminacao...')).toBeInTheDocument();

    // Step 1
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Avaliando composicao...')).toBeInTheDocument();

    // Step 2
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Identificando problemas de staging...')).toBeInTheDocument();

    // Step 3
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Calculando potencial...')).toBeInTheDocument();

    // Cycles back to step 0
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Analisando iluminacao...')).toBeInTheDocument();
  });

  it('has aria-live for step announcements', () => {
    render(<DiagnosticLoading progress={0} />);

    const stepElement = screen.getByText('Analisando iluminacao...');
    expect(stepElement).toHaveAttribute('aria-live', 'polite');
  });

  it('clamps progress at 100', () => {
    render(<DiagnosticLoading progress={120} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });
});
