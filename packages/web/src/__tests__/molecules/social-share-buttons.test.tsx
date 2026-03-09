import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialShareButtons } from '@/components/molecules/SocialShareButtons';

// Mock clipboard API
const mockWriteText = jest.fn();

describe('SocialShareButtons', () => {
  const defaultProps = {
    shareUrl: 'https://decorai.com.br/compartilhar/abc123',
    projectName: 'Sala Moderna',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it('renders WhatsApp, Email and Copy buttons', () => {
    render(<SocialShareButtons {...defaultProps} />);

    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Copiar Link')).toBeInTheDocument();
  });

  it('WhatsApp link has correct URL format', () => {
    render(<SocialShareButtons {...defaultProps} />);

    const whatsappLink = screen.getByLabelText('Compartilhar no WhatsApp');
    const href = whatsappLink.getAttribute('href')!;

    expect(href).toContain('https://wa.me/?text=');
    expect(href).toContain(encodeURIComponent(defaultProps.shareUrl));
  });

  it('WhatsApp link opens in new tab', () => {
    render(<SocialShareButtons {...defaultProps} />);

    const whatsappLink = screen.getByLabelText('Compartilhar no WhatsApp');
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('Email link has correct mailto format', () => {
    render(<SocialShareButtons {...defaultProps} />);

    const emailLink = screen.getByLabelText('Compartilhar por Email');
    const href = emailLink.getAttribute('href')!;

    expect(href).toContain('mailto:?subject=');
    expect(href).toContain(encodeURIComponent(defaultProps.shareUrl));
  });

  it('copies link to clipboard on click', async () => {
    const user = userEvent.setup();
    render(<SocialShareButtons {...defaultProps} />);

    // Initially shows "Copiar Link"
    expect(screen.getByText('Copiar Link')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Copiar link'));

    // After click, should show "Link copiado!" confirming copy occurred
    await waitFor(() => {
      expect(screen.getByText('Link copiado!')).toBeInTheDocument();
    });
  });

  it('shows feedback after copying', async () => {
    const user = userEvent.setup();
    render(<SocialShareButtons {...defaultProps} />);

    await user.click(screen.getByLabelText('Copiar link'));

    await waitFor(() => {
      expect(screen.getByText('Link copiado!')).toBeInTheDocument();
    });
  });

  it('has correct aria labels', () => {
    render(<SocialShareButtons {...defaultProps} />);

    expect(screen.getByLabelText('Compartilhar no WhatsApp')).toBeInTheDocument();
    expect(screen.getByLabelText('Compartilhar por Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Copiar link')).toBeInTheDocument();
  });
});
