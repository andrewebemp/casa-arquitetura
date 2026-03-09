import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NpsSurvey } from '@/components/molecules/NpsSurvey';

describe('NpsSurvey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show when API returns should_show=true', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { should_show: true } }),
    });

    render(<NpsSurvey />);

    await waitFor(() => {
      expect(screen.getByTestId('nps-survey')).toBeInTheDocument();
    });
  });

  it('should not show when API returns should_show=false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { should_show: false } }),
    });

    render(<NpsSurvey />);

    // Wait for the fetch to resolve
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('nps-survey')).not.toBeInTheDocument();
  });

  it('should render 0-10 score buttons when visible', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { should_show: true } }),
    });

    render(<NpsSurvey />);

    await waitFor(() => {
      expect(screen.getByTestId('nps-survey')).toBeInTheDocument();
    });

    for (let i = 0; i <= 10; i++) {
      expect(screen.getByRole('button', { name: `Nota ${i}` })).toBeInTheDocument();
    }
  });

  it('should show comment field after selecting a score', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { should_show: true } }),
    });

    const user = userEvent.setup();
    render(<NpsSurvey />);

    await waitFor(() => {
      expect(screen.getByTestId('nps-survey')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Nota 9' }));

    expect(screen.getByPlaceholderText(/experiencia/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('should display Portuguese text', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { should_show: true } }),
    });

    render(<NpsSurvey />);

    await waitFor(() => {
      expect(screen.getByText(/probabilidade de voce recomendar/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Nada provavel')).toBeInTheDocument();
    expect(screen.getByText('Muito provavel')).toBeInTheDocument();
  });

  it('should call dismiss endpoint when closed', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { should_show: true } }) })
      .mockResolvedValueOnce({ ok: true });

    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<NpsSurvey />);

    await waitFor(() => {
      expect(screen.getByTestId('nps-survey')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /fechar/i }));

    expect(mockFetch).toHaveBeenCalledWith('/api/nps/dismiss', expect.objectContaining({ method: 'POST' }));
  });
});
