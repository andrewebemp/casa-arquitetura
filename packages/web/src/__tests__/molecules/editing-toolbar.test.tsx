import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditingToolbar } from '@/components/molecules/EditingToolbar';
import type { EditingTool } from '@/hooks/use-editing-store';

describe('EditingToolbar', () => {
  const defaultProps = {
    activeTool: null as EditingTool,
    onSelectTool: jest.fn(),
    onExitEditing: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all 3 tool buttons', () => {
    render(<EditingToolbar {...defaultProps} />);

    expect(screen.getByLabelText('Segmentar Elementos')).toBeInTheDocument();
    expect(screen.getByLabelText('Iluminacao')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover Objetos')).toBeInTheDocument();
  });

  it('renders exit button', () => {
    render(<EditingToolbar {...defaultProps} />);

    expect(screen.getByLabelText('Sair da Edicao')).toBeInTheDocument();
  });

  it('highlights active tool with pressed state', () => {
    render(<EditingToolbar {...defaultProps} activeTool="segment" />);

    const segmentBtn = screen.getByLabelText('Segmentar Elementos');
    expect(segmentBtn).toHaveAttribute('aria-pressed', 'true');

    const lightingBtn = screen.getByLabelText('Iluminacao');
    expect(lightingBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelectTool when tool button clicked', async () => {
    const user = userEvent.setup();
    render(<EditingToolbar {...defaultProps} />);

    await user.click(screen.getByLabelText('Iluminacao'));
    expect(defaultProps.onSelectTool).toHaveBeenCalledWith('lighting');
  });

  it('calls onExitEditing when exit button clicked', async () => {
    const user = userEvent.setup();
    render(<EditingToolbar {...defaultProps} />);

    await user.click(screen.getByLabelText('Sair da Edicao'));
    expect(defaultProps.onExitEditing).toHaveBeenCalled();
  });

  it('disables all tools when disabled prop is true', () => {
    render(<EditingToolbar {...defaultProps} disabled />);

    expect(screen.getByLabelText('Segmentar Elementos')).toBeDisabled();
    expect(screen.getByLabelText('Iluminacao')).toBeDisabled();
    expect(screen.getByLabelText('Remover Objetos')).toBeDisabled();
  });
});
