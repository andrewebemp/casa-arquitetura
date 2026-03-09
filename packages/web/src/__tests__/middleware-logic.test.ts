const mockGetUser = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      cookies: { set: jest.fn() },
    })),
    redirect: jest.fn((url: URL) => ({
      type: 'redirect',
      url: url.toString(),
    })),
  },
}));

import { updateSession } from '@/lib/supabase/middleware';


const { NextResponse } = require('next/server');

interface MockNextRequest {
  nextUrl: URL;
  cookies: {
    getAll: jest.Mock;
    set: jest.Mock;
  };
}

function createMockUrl(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`);
  (url as unknown as Record<string, unknown>).clone = () => new URL(url.toString());
  return url;
}

function createMockRequest(pathname: string): MockNextRequest {
  return {
    nextUrl: createMockUrl(pathname),
    cookies: {
      getAll: jest.fn(() => []),
      set: jest.fn(),
    },
  };
}

describe('Middleware - Route Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('redirects unauthenticated users from /dashboard to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest('/dashboard');

await updateSession(request as any);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = NextResponse.redirect.mock.calls[0][0];
    expect(redirectCall.pathname).toBe('/login');
  });

  it('redirects unauthenticated users from /projects to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest('/projects');

await updateSession(request as any);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = NextResponse.redirect.mock.calls[0][0];
    expect(redirectCall.pathname).toBe('/login');
  });

  it('allows unauthenticated users on /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest('/login');

await updateSession(request as any);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('allows unauthenticated users on /signup', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest('/signup');

await updateSession(request as any);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('allows unauthenticated users on root /', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = createMockRequest('/');

await updateSession(request as any);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated users from /login to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
    const request = createMockRequest('/login');

await updateSession(request as any);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = NextResponse.redirect.mock.calls[0][0];
    expect(redirectCall.pathname).toBe('/dashboard');
  });

  it('allows authenticated users on /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
    const request = createMockRequest('/dashboard');

await updateSession(request as any);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
