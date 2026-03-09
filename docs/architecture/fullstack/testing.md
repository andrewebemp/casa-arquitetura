# DecorAI Brasil — Testing Strategy & Coding Standards

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Sections:** 16-17

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
              ┌──────────┐
              │   E2E    │  ~10 critical flows
              │Playwright│  Login → Render → Chat → Share
             ─┴──────────┴─
           ┌────────────────┐
           │  Integration   │  ~50 tests
           │  API routes +  │  Route → Service → DB
           │  Service layer │
          ─┴────────────────┴─
        ┌──────────────────────┐
        │    Unit Tests        │  ~200+ tests
        │  Components + Hooks  │  React Testing Library
        │  Services + Utils    │  Vitest
        └──────────────────────┘
```

### 16.2 Test Organization

**Frontend Tests:**
```
packages/web/
├── src/
│   ├── components/
│   │   ├── atoms/Button.tsx
│   │   └── atoms/__tests__/Button.test.tsx
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── __tests__/use-auth.test.ts
│   └── services/
│       ├── project-service.ts
│       └── __tests__/project-service.test.ts
└── e2e/
    ├── first-render.spec.ts
    ├── chat-refinement.spec.ts
    └── reverse-staging.spec.ts
```

**Backend Tests:**
```
packages/api/
├── src/
│   ├── routes/__tests__/
│   │   ├── project.routes.test.ts
│   │   ├── chat.routes.test.ts
│   │   └── billing.routes.test.ts
│   ├── services/__tests__/
│   │   ├── project.service.test.ts
│   │   ├── render.service.test.ts
│   │   └── quota.service.test.ts
│   └── middleware/__tests__/
│       ├── auth.middleware.test.ts
│       └── rate-limit.test.ts
```

### 16.3 Test Examples

**Frontend Component Test:**
```typescript
// components/atoms/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Gerar Render</Button>);
    expect(screen.getByRole('button', { name: 'Gerar Render' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    render(<Button loading>Gerando...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<Button>Acessivel</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Backend API Test:**
```typescript
// routes/__tests__/project.routes.test.ts
import { build } from '../test-utils/app';

describe('POST /v1/projects', () => {
  const app = build();

  it('creates a project with valid input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/projects',
      headers: { authorization: `Bearer ${testToken}` },
      payload: {
        name: 'Sala do apartamento',
        input_type: 'photo',
        style: 'moderno',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      name: 'Sala do apartamento',
      input_type: 'photo',
      style: 'moderno',
      status: 'draft',
    });
  });

  it('rejects invalid style', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/projects',
      headers: { authorization: `Bearer ${testToken}` },
      payload: { name: 'Test', input_type: 'photo', style: 'invalido' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects unauthenticated request', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/projects',
      payload: { name: 'Test', input_type: 'photo', style: 'moderno' },
    });

    expect(res.statusCode).toBe(401);
  });
});
```

---

## 17. Coding Standards

### 17.1 Critical Fullstack Rules

- **Type Sharing:** Definir tipos em `packages/shared/src/types/` e importar via `@decorai/shared` — nunca duplicar tipos entre packages
- **API Calls:** Frontend NUNCA faz HTTP direto — sempre via service layer (`services/*.ts`)
- **Environment Variables:** Acessar APENAS via config objects (`config/env.ts`), nunca `process.env` direto em logica de negocio
- **Error Handling:** Todas as rotas API DEVEM usar o error handler global; frontend DEVE tratar erros via React Query `onError`
- **State Updates:** NUNCA mutar estado diretamente — Zustand immer middleware ou spread operator
- **RLS Obrigatorio:** TODA nova tabela DEVE ter RLS habilitado com policies que filtram por `auth.uid()`
- **Validation:** TODA rota API DEVE validar input com Zod schema; frontend DEVE validar com React Hook Form + Zod
- **Imports Absolutos:** Usar `@/` alias no frontend, `@decorai/shared` para tipos compartilhados — Ref: Synapse Rules
- **PT-BR:** Toda interface de usuario em portugues brasileiro, sem excecao — Ref: NFR-14

### 17.2 Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | — | `ChatPanel.tsx` |
| Hooks | camelCase with 'use' | — | `useRenderProgress.ts` |
| Services | kebab-case | kebab-case | `project-service.ts` |
| API Routes | — | kebab-case | `/api/v1/render-jobs` |
| Database Tables | — | snake_case | `project_versions` |
| TypeScript Types | PascalCase | PascalCase | `ProjectVersion` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| CSS Variables | kebab-case | — | `--color-primary-500` |
| Files | kebab-case | kebab-case | `chat-message.ts` |
