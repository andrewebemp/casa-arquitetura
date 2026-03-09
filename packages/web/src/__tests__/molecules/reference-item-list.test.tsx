import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceItemList } from '@/components/molecules/ReferenceItemList';

describe('ReferenceItemList', () => {
  const defaultProps = {
    items: [],
    onAddItem: jest.fn(),
    onUpdateItem: jest.fn(),
    onRemoveItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state', () => {
    render(<ReferenceItemList {...defaultProps} />);

    expect(screen.getByText(/Nenhum item adicionado/)).toBeInTheDocument();
  });

  it('renders add item button', () => {
    render(<ReferenceItemList {...defaultProps} />);

    expect(screen.getByText('Adicionar item')).toBeInTheDocument();
  });

  it('calls onAddItem when button clicked', () => {
    render(<ReferenceItemList {...defaultProps} />);

    fireEvent.click(screen.getByText('Adicionar item'));
    expect(defaultProps.onAddItem).toHaveBeenCalled();
  });

  it('renders items list', () => {
    render(
      <ReferenceItemList
        {...defaultProps}
        items={[
          { id: 'i1', name: 'Sofa', measurement: '2.0m', photo: null, photoPreviewUrl: null },
          { id: 'i2', name: 'Mesa', measurement: '', photo: null, photoPreviewUrl: null },
        ]}
      />
    );

    expect(screen.getAllByLabelText('Nome do item')).toHaveLength(2);
    expect(screen.getAllByLabelText('Remover item')).toHaveLength(2);
  });

  it('calls onUpdateItem when name changes', () => {
    render(
      <ReferenceItemList
        {...defaultProps}
        items={[
          { id: 'i1', name: '', measurement: '', photo: null, photoPreviewUrl: null },
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText('Nome do item'), {
      target: { value: 'Poltrona' },
    });

    expect(defaultProps.onUpdateItem).toHaveBeenCalledWith(0, { name: 'Poltrona' });
  });

  it('calls onRemoveItem when remove clicked', () => {
    render(
      <ReferenceItemList
        {...defaultProps}
        items={[
          { id: 'i1', name: 'Sofa', measurement: '', photo: null, photoPreviewUrl: null },
        ]}
      />
    );

    fireEvent.click(screen.getByLabelText('Remover item'));
    expect(defaultProps.onRemoveItem).toHaveBeenCalledWith(0);
  });
});
