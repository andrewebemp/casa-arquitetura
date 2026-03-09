# DecorAI Brasil — Frontend Architecture

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 10

---

## 10. Frontend Architecture

### 10.1 Component Organization

```
packages/web/src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Grupo de rotas publicas
│   │   ├── page.tsx              # Landing (SSG)
│   │   ├── diagnostico/page.tsx  # Reverse Staging (SSG)
│   │   └── compartilhar/[id]/page.tsx  # Share page (SSR)
│   ├── (auth)/                   # Grupo de rotas de auth
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── app/                      # Area logada (layout com header)
│   │   ├── layout.tsx            # Layout logado (HeaderApp)
│   │   ├── projetos/page.tsx     # Dashboard (SSR)
│   │   ├── novo/page.tsx         # Wizard (CSR)
│   │   ├── projeto/[id]/page.tsx # Workspace (CSR)
│   │   ├── perfil/page.tsx       # Profile (SSR)
│   │   └── plano/page.tsx        # Billing (SSR)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Tailwind + custom properties
├── components/
│   ├── atoms/                    # Button, Input, Badge, etc.
│   ├── molecules/                # UploadCard, StyleCard, ChatMessage, etc.
│   ├── organisms/                # ChatPanel, WorkspaceToolbar, CroquiViewer, etc.
│   └── layouts/                  # HeaderPublic, HeaderApp, Footer
├── hooks/
│   ├── use-auth.ts               # Auth state hook
│   ├── use-project.ts            # Project CRUD hooks
│   ├── use-chat.ts               # Chat message hooks
│   ├── use-render-progress.ts    # WebSocket progress hook
│   ├── use-subscription.ts       # Billing state hook
│   └── use-canvas.ts             # Canvas zoom/pan hook
├── services/
│   ├── api-client.ts             # Configured fetch/axios instance
│   ├── project-service.ts        # Project API calls
│   ├── chat-service.ts           # Chat API calls
│   ├── auth-service.ts           # Auth API calls
│   ├── billing-service.ts        # Billing API calls
│   └── diagnostic-service.ts     # Diagnostic API calls
├── stores/
│   ├── canvas-store.ts           # Zustand: zoom, pan, active tool
│   ├── wizard-store.ts           # Zustand: wizard step state
│   └── ui-store.ts               # Zustand: modals, toasts, sidebar
├── lib/
│   ├── supabase-client.ts        # Supabase browser client
│   ├── utils.ts                  # cn(), formatters
│   └── constants.ts              # App-wide constants
└── types/
    └── index.ts                  # Re-exports from @decorai/shared
```

### 10.2 State Management Architecture

```typescript
// stores/canvas-store.ts
import { create } from 'zustand';

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  activeTool: 'select' | 'segment' | 'slider' | 'remove' | null;
  showSlider: boolean;
  sliderPosition: number; // 0-100
  setZoom: (zoom: number) => void;
  setActiveTool: (tool: CanvasState['activeTool']) => void;
  toggleSlider: () => void;
  setSliderPosition: (pos: number) => void;
  resetCanvas: () => void;
}
```

**State Management Patterns:**
- Canvas state (zoom, pan, tools) via **Zustand** — client-only, high-frequency updates
- Server state (projects, versions, chat) via **React Query** — cache, optimistic updates, refetch
- Auth state via **Supabase Auth** listener — automatic token refresh
- Form state via **React Hook Form** + Zod — wizard steps with validation
- URL state via **Next.js searchParams** — filtros do dashboard

### 10.3 Routing Architecture

```
Route Organization (Next.js App Router):

/                           SSG    Public   Landing page
/diagnostico                SSG    Public   Reverse staging
/compartilhar/:id           SSR    Public   Share page (slider)
/login                      SSG    Public   Login/Cadastro
/app                        —      Auth     Layout wrapper
/app/projetos               SSR    Auth     Dashboard
/app/novo                   CSR    Auth     Wizard (5 steps)
/app/projeto/:id            CSR    Auth     Workspace
/app/perfil                 SSR    Auth     Profile
/app/plano                  SSR    Auth     Billing
```

**Protected Route Pattern:**

```typescript
// app/app/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <>
      <HeaderApp user={user} />
      <main>{children}</main>
    </>
  );
}
```

### 10.4 Frontend Services Layer

```typescript
// services/api-client.ts
import { createBrowserClient } from '@supabase/ssr';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error.error.code, error.error.message, res.status);
  }

  return res.json();
}

export { apiClient, supabase };
```

```typescript
// services/project-service.ts
import { apiClient } from './api-client';
import type { Project, ProjectVersion } from '@decorai/shared';

export const projectService = {
  create: (data: { name: string; input_type: string; style: string }) =>
    apiClient<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  list: () =>
    apiClient<Project[]>('/profile/projects'),

  get: (id: string) =>
    apiClient<Project>(`/projects/${id}`),

  getVersions: (id: string) =>
    apiClient<ProjectVersion[]>(`/projects/${id}/versions`),

  generate: (id: string) =>
    apiClient<{ job_id: string }>(`/projects/${id}/generate`, { method: 'POST' }),

  restyle: (id: string, style: string) =>
    apiClient<{ job_id: string }>(`/projects/${id}/restyle`, {
      method: 'POST',
      body: JSON.stringify({ style }),
    }),
};
```
