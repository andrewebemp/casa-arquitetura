# Especificacao UX/UI — DecorAI Brasil
## 2. Arquitetura de Informacao

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 2.1 Mapa do Site

```
DecorAI Brasil
|
+-- / (Landing Page / Home)
|   +-- #hero (CTA principal + Reverse Staging)
|   +-- #como-funciona (3 passos)
|   +-- #estilos (galeria de estilos)
|   +-- #precos (tiers de pricing)
|   +-- #depoimentos
|   +-- #footer
|
+-- /diagnostico (Reverse Staging - Funil Freemium) [FR-12, FR-13]
|   +-- Upload de foto
|   +-- Resultado do diagnostico
|   +-- CTA para plano pago
|
+-- /login [FR-14]
|   +-- Google OAuth
|   +-- Email/Password
|   +-- Cadastro
|
+-- /app (Area logada - SPA) [FR-14, FR-15]
|   |
|   +-- /app/projetos (Dashboard - Lista de Projetos) [FR-15]
|   |   +-- Cards de projetos recentes
|   |   +-- Favoritos
|   |   +-- Filtros (por estilo, data)
|   |
|   +-- /app/novo (Novo Projeto - Wizard) [FR-01, FR-24, FR-25, FR-26]
|   |   +-- Step 1: Tipo de Input
|   |   +-- Step 2: Upload/Descricao
|   |   +-- Step 3: Configuracao (estilo, itens)
|   |   +-- Step 4: Croqui de Confirmacao [FR-29, FR-30, FR-31, FR-32]
|   |   +-- Step 5: Geracao
|   |
|   +-- /app/projeto/:id (Workspace do Projeto)
|   |   +-- Canvas principal (imagem gerada)
|   |   +-- Slider antes/depois [FR-10]
|   |   +-- Chat de refinamento [FR-04, FR-05, FR-06, FR-27, FR-28]
|   |   +-- Barra de ferramentas (edicao) [FR-07, FR-08, FR-09]
|   |   +-- Historico de versoes [FR-27]
|   |   +-- Painel de estilos (troca com 1 clique) [FR-03]
|   |   +-- Compartilhamento [FR-11]
|   |
|   +-- /app/perfil (Perfil e Configuracoes) [FR-15]
|   |   +-- Dados pessoais
|   |   +-- Preferencias de estilo
|   |   +-- Historico de uso
|   |
|   +-- /app/plano (Billing e Assinatura) [FR-16, FR-17, FR-18]
|       +-- Plano atual
|       +-- Upgrade/downgrade
|       +-- Historico de pagamentos
|       +-- Metodo de pagamento
|
+-- /compartilhar/:id (Pagina publica de compartilhamento) [FR-11]
    +-- Slider antes/depois
    +-- CTA para cadastro
```

### 2.2 Navegacao Principal (Area Logada)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]   Projetos    Novo Projeto              [Perfil ▼]     │
│                                              [Plano: Free|Pro] │
└─────────────────────────────────────────────────────────────────┘
```

- **Navegacao simplificada:** Maximo 3 itens no menu principal
- **Acao primaria destacada:** "Novo Projeto" sempre visivel como botao
- **Status do plano:** Visivel no header para incentivar upgrade

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
