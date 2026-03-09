import { render, screen, fireEvent } from '@testing-library/react';
import { SpatialForm } from '@/components/molecules/SpatialForm';

const defaultProps = {
  roomType: '',
  width: '',
  length: '',
  ceilingHeight: '',
  openings: [],
  additionalDescription: '',
  onRoomTypeChange: jest.fn(),
  onDimensionChange: jest.fn(),
  onDescriptionChange: jest.fn(),
  onAddOpening: jest.fn(),
  onUpdateOpening: jest.fn(),
  onRemoveOpening: jest.fn(),
};

describe('SpatialForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SpatialForm {...defaultProps} />);

    expect(screen.getByLabelText('Tipo de ambiente')).toBeInTheDocument();
    expect(screen.getByLabelText('Largura (m) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Comprimento (m) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Pe-direito (m)')).toBeInTheDocument();
    expect(screen.getByLabelText('Descricao adicional')).toBeInTheDocument();
  });

  it('calls onDimensionChange when width changes', () => {
    render(<SpatialForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Largura (m) *'), {
      target: { value: '4.5' },
    });

    expect(defaultProps.onDimensionChange).toHaveBeenCalledWith('width', '4.5');
  });

  it('calls onRoomTypeChange when room type changes', () => {
    render(<SpatialForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Tipo de ambiente'), {
      target: { value: 'sala' },
    });

    expect(defaultProps.onRoomTypeChange).toHaveBeenCalledWith('sala');
  });

  it('shows add opening button', () => {
    render(<SpatialForm {...defaultProps} />);

    const addButton = screen.getByText('Adicionar');
    expect(addButton).toBeInTheDocument();
  });

  it('calls onAddOpening when add button clicked', () => {
    render(<SpatialForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Adicionar'));
    expect(defaultProps.onAddOpening).toHaveBeenCalled();
  });

  it('renders openings when provided', () => {
    render(
      <SpatialForm
        {...defaultProps}
        openings={[
          { type: 'door', wall: 'north', width: '1.0', height: '2.1' },
        ]}
      />
    );

    expect(screen.getByLabelText('Remover abertura')).toBeInTheDocument();
  });

  it('calls onDescriptionChange when description changes', () => {
    render(<SpatialForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Descricao adicional'), {
      target: { value: 'Piso de madeira' },
    });

    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('Piso de madeira');
  });
});
