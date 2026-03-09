import { render, screen, fireEvent } from '@testing-library/react';
import { InputTypeSelector } from '@/components/molecules/InputTypeSelector';

describe('InputTypeSelector', () => {
  it('renders 3 input options', () => {
    render(<InputTypeSelector selected={null} onSelect={jest.fn()} />);

    expect(screen.getByText('Foto do Local')).toBeInTheDocument();
    expect(screen.getByText('Descricao com Medidas')).toBeInTheDocument();
    expect(screen.getByText('Combinado')).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    render(<InputTypeSelector selected="photo" onSelect={jest.fn()} />);

    const photoButton = screen.getByText('Foto do Local').closest('button')!;
    expect(photoButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect when option is clicked', () => {
    const onSelect = jest.fn();
    render(<InputTypeSelector selected={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Descricao com Medidas'));
    expect(onSelect).toHaveBeenCalledWith('text');
  });

  it('shows descriptions for each option', () => {
    render(<InputTypeSelector selected={null} onSelect={jest.fn()} />);

    expect(screen.getByText('Envie uma foto do ambiente para gerar o staging')).toBeInTheDocument();
    expect(screen.getByText('Descreva o espaco com dimensoes e aberturas')).toBeInTheDocument();
    expect(screen.getByText('Envie foto e adicione descricao com medidas')).toBeInTheDocument();
  });
});
