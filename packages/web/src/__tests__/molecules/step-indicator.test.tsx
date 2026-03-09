import { render, screen, fireEvent } from '@testing-library/react';
import { StepIndicator } from '@/components/molecules/StepIndicator';

describe('StepIndicator', () => {
  it('renders all 5 steps', () => {
    render(<StepIndicator currentStep={1} />);

    expect(screen.getByText('Tipo de Input')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Estilo')).toBeInTheDocument();
    expect(screen.getByText('Croqui')).toBeInTheDocument();
    expect(screen.getByText('Geracao')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<StepIndicator currentStep={3} />);

    const activeStep = screen.getByText('Estilo');
    expect(activeStep).toHaveClass('text-brand-600');
  });

  it('shows completed steps with check icon', () => {
    render(<StepIndicator currentStep={3} />);

    // Steps 1 and 2 should be completed (showing check icons)
    const completedLabels = ['Tipo de Input', 'Detalhes'];
    completedLabels.forEach((label) => {
      expect(screen.getByText(label)).toHaveClass('text-gray-700');
    });
  });

  it('shows pending steps as disabled', () => {
    render(<StepIndicator currentStep={2} />);

    const pendingLabels = ['Estilo', 'Croqui', 'Geracao'];
    pendingLabels.forEach((label) => {
      expect(screen.getByText(label)).toHaveClass('text-gray-400');
    });
  });

  it('calls onStepClick for completed steps', () => {
    const onStepClick = jest.fn();
    render(<StepIndicator currentStep={3} onStepClick={onStepClick} />);

    // Click on step 1 (completed)
    fireEvent.click(screen.getByText('Tipo de Input'));
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('does not call onStepClick for pending steps', () => {
    const onStepClick = jest.fn();
    render(<StepIndicator currentStep={2} onStepClick={onStepClick} />);

    // Click on step 4 (pending) - button is disabled
    fireEvent.click(screen.getByText('Croqui'));
    expect(onStepClick).not.toHaveBeenCalled();
  });
});
