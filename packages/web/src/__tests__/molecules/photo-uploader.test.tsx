import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoUploader } from '@/components/molecules/PhotoUploader';

describe('PhotoUploader', () => {
  it('renders upload area when no photo', () => {
    render(
      <PhotoUploader photo={null} previewUrl={null} onPhotoChange={jest.fn()} />
    );

    expect(screen.getByText('Arraste a foto aqui ou clique para enviar')).toBeInTheDocument();
    expect(screen.getByText('JPEG/PNG ate 20MB')).toBeInTheDocument();
  });

  it('renders preview when photo is set', () => {
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    render(
      <PhotoUploader
        photo={mockFile}
        previewUrl="blob:test-preview"
        onPhotoChange={jest.fn()}
      />
    );

    expect(screen.getByAltText('Preview do ambiente')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover foto')).toBeInTheDocument();
  });

  it('shows error for invalid file type', () => {
    const onPhotoChange = jest.fn();
    render(
      <PhotoUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByText('Formato invalido. Envie apenas JPEG ou PNG.')).toBeInTheDocument();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('shows error for oversized file', () => {
    const onPhotoChange = jest.fn();
    render(
      <PhotoUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('Arquivo muito grande. O tamanho maximo e 20MB.')).toBeInTheDocument();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('calls onPhotoChange with valid file', () => {
    const onPhotoChange = jest.fn();

    // Mock URL.createObjectURL
    const mockUrl = 'blob:test-url';
    global.URL.createObjectURL = jest.fn(() => mockUrl);

    render(
      <PhotoUploader photo={null} previewUrl={null} onPhotoChange={onPhotoChange} />
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
      <PhotoUploader
        photo={mockFile}
        previewUrl="blob:test"
        onPhotoChange={onPhotoChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Remover foto'));

    expect(onPhotoChange).toHaveBeenCalledWith(null, null);
  });
});
