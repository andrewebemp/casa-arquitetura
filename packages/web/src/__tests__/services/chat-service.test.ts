import {
  getChatHistory,
  sendMessage,
  getVersions,
  getVersion,
  revertVersion,
  subscribeToRefinementProgress,
} from '@/services/chat-service';

const mockGetSession = jest.fn();
const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: mockGetSession },
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('chat-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
  });

  describe('getChatHistory', () => {
    it('fetches chat history without cursor', async () => {
      const mockResponse = {
        messages: [{ id: 'm1', content: 'test', role: 'user' }],
        next_cursor: null,
        has_more: false,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getChatHistory('proj-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/proj-1/chat/history?'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result.messages).toHaveLength(1);
    });

    it('includes cursor param when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ messages: [], next_cursor: null, has_more: false }),
      });

      await getChatHistory('proj-1', 'cursor-abc');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cursor=cursor-abc'),
        expect.anything()
      );
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(getChatHistory('proj-1')).rejects.toThrow(
        'Falha ao carregar historico do chat'
      );
    });
  });

  describe('sendMessage', () => {
    it('posts message and returns response', async () => {
      const mockMsg = { id: 'm1', content: 'test', role: 'assistant' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMsg),
      });

      const result = await sendMessage('proj-1', 'muda o piso');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/proj-1/chat'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message: 'muda o piso' }),
        })
      );
      expect(result.id).toBe('m1');
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(sendMessage('proj-1', 'test')).rejects.toThrow(
        'Falha ao enviar mensagem'
      );
    });
  });

  describe('getVersions', () => {
    it('fetches versions list', async () => {
      const mockVersions = [{ id: 'v1', version_number: 1 }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ versions: mockVersions }),
      });

      const result = await getVersions('proj-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('v1');
    });

    it('throws on error', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(getVersions('proj-1')).rejects.toThrow(
        'Falha ao carregar versoes'
      );
    });
  });

  describe('getVersion', () => {
    it('fetches single version', async () => {
      const mockVersion = { id: 'v1', version_number: 1 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockVersion),
      });

      const result = await getVersion('proj-1', 'v1');

      expect(result.id).toBe('v1');
    });

    it('throws on error', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(getVersion('proj-1', 'v1')).rejects.toThrow(
        'Falha ao carregar versao'
      );
    });
  });

  describe('revertVersion', () => {
    it('posts revert and returns new version', async () => {
      const mockVersion = { id: 'v3', version_number: 3 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockVersion),
      });

      const result = await revertVersion('proj-1', 'v1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/proj-1/versions/v1/revert'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.id).toBe('v3');
    });

    it('throws on error', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      await expect(revertVersion('proj-1', 'v1')).rejects.toThrow(
        'Falha ao restaurar versao'
      );
    });
  });

  describe('subscribeToRefinementProgress', () => {
    it('subscribes to Supabase channel and returns unsubscribe', () => {
      const mockOn = jest.fn().mockReturnThis();
      const mockSubscribe = jest.fn().mockReturnThis();
      const channelObj = { on: mockOn, subscribe: mockSubscribe };
      mockChannel.mockReturnValue(channelObj);

      const onEvent = jest.fn();
      const unsub = subscribeToRefinementProgress('proj-1', onEvent);

      expect(mockChannel).toHaveBeenCalledWith('project:proj-1');
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          table: 'render_jobs',
        }),
        expect.any(Function)
      );

      unsub();
      expect(mockRemoveChannel).toHaveBeenCalledWith(channelObj);
    });
  });
});
