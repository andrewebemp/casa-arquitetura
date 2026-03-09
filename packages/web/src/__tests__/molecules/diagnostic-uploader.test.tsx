import { render, screen, fireEvent } from '@testing-library/react';
import { DiagnosticUploader } from '@/components/molecules/DiagnosticUploader';

describe('DiagnosticUploader', () => {
  it('renders upload area when no photo', () => {
    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={jest.fn()} />
    );

    expect(screen.getByText('Arraste a foto do seu imovel aqui ou clique para enviar')).toBeInTheDocument();
    expect(screen.getByText('JPEG/PNG ate 10MB')).toBeInTheDocument();
  });

  it('renders preview when photo is set', () => {
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    render(
      <DiagnosticUploader
        photo={mockFile}
        previewUrl="blob:test-preview"
        onPhotoChange={jest.fn()}
      />
    );

    expect(screen.getByAltText('Preview da foto do imovel')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover foto')).toBeInTheDocument();
  });

  it('shows file name and size in preview', () => {
    const mockFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'sala.jpg', { type: 'image/jpeg' });
    render(
      <DiagnosticUploader
        photo={mockFile}
        previewUrl="blob:test-preview"
        onPhotoChange={jest.fn()}
      />
    );

    expect(screen.getByText(/sala\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/2\.0MB/)).toBeInTheDocument();
  });

  it('shows error for invalid file type', () => {
    const onPhotoChange = jest.fn();
    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByText('Formato invalido. Envie apenas JPEG ou PNG.')).toBeInTheDocument();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('shows error for oversized file (> 10MB)', () => {
    const onPhotoChange = jest.fn();
    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('Arquivo muito grande. O tamanho maximo e 10MB.')).toBeInTheDocument();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('calls onPhotoChange with valid file', () => {
    const onPhotoChange = jest.fn();
    const mockUrl = 'blob:test-url';
    global.URL.createObjectURL = jest.fn(() => mockUrl);

    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(onPhotoChange).toHaveBeenCalledWith(validFile, mockUrl);
  });

  it('calls onPhotoChange(null) when remove is clicked', () => {
    const onPhotoChange = jest.fn();
    global.URL.revokeObjectURL = jest.fn();

    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    render(
      <DiagnosticUploader
        photo={mockFile}
        previewUrl="blob:test"
        onPhotoChange={onPhotoChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Remover foto'));

    expect(onPhotoChange).toHaveBeenCalledWith(null, null);
  });

  it('hides remove button when disabled', () => {
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    render(
      <DiagnosticUploader
        photo={mockFile}
        previewUrl="blob:test"
        onPhotoChange={jest.fn()}
        disabled={true}
      />
    );

    expect(screen.queryByLabelText('Remover foto')).not.toBeInTheDocument();
  });

  it('has accessible upload area label', () => {
    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={jest.fn()} />
    );

    expect(screen.getByLabelText('Area de upload de foto do imovel')).toBeInTheDocument();
  });

  it('has error alert role', () => {
    render(
      <DiagnosticUploader photo={null} previewUrl={null} onPhotoChange={jest.fn()} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test'], 'doc.gif', { type: 'image/gif' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
