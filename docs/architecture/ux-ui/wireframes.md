# Especificacao UX/UI — DecorAI Brasil
## 4. Wireframes

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 4.1 Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo DecorAI]          Como Funciona   Estilos   Precos   [Login]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐   │
│  │                          │  │                               │   │
│  │  Transforme espacos      │  │   ┌─────────┬─────────┐      │   │
│  │  vazios em ambientes     │  │   │ ANTES   │ DEPOIS  │      │   │
│  │  dos sonhos com IA       │  │   │         │█████████│      │   │
│  │                          │  │   │  foto   │ staging │      │   │
│  │  A unica plataforma     │  │   │  vazia  │   AI    │      │   │
│  │  em portugues com       │  │   │         │█████████│      │   │
│  │  dialogo iterativo      │  │   └─────────┴─────────┘      │   │
│  │                          │  │     [slider interativo]       │   │
│  │  [Comece Gratis]         │  │                               │   │
│  │  [Diagnostico Gratuito]  │  └───────────────────────────────┘   │
│  └──────────────────────────┘                                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                     COMO FUNCIONA                                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  1. Envie    │  │ 2. Escolha   │  │ 3. Refine    │              │
│  │              │  │              │  │              │              │
│  │  [icone      │  │  [icone      │  │  [icone      │              │
│  │   upload]    │  │   paleta]    │  │   chat]      │              │
│  │              │  │              │  │              │              │
│  │  Foto, medida│  │  Entre 10    │  │  Converse    │              │
│  │  ou descricao│  │  estilos     │  │  com a IA    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                     ESTILOS DE DECORACAO                            │
│                                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Moderno │ │Industr.│ │Minimal.│ │Classic.│ │Escand. │           │
│  │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │           │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Rustico │ │Tropical│ │Contemp.│ │ Boho   │ │ Luxo   │           │
│  │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │           │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        PLANOS                                       │
│                                                                     │
│  ┌──────────────┐  ┌══════════════╗  ┌──────────────┐              │
│  │  FREE        │  ║  PRO         ║  │  BUSINESS    │              │
│  │              │  ║  Mais        ║  │              │              │
│  │  R$ 0/mes   │  ║  Popular     ║  │  R$ 299-499  │              │
│  │              │  ║              ║  │  /mes        │              │
│  │  3 renders   │  ║  R$ 79-149   ║  │              │              │
│  │  /mes        │  ║  /mes        ║  │  Renders     │              │
│  │              │  ║              ║  │  ilimitados  │              │
│  │  Marca       │  ║  Sem marca   ║  │              │              │
│  │  d'agua      │  ║  d'agua      ║  │  HD 2048px   │              │
│  │              │  ║              ║  │              │              │
│  │  [Comecar]   │  ║  [Assinar]   ║  │  API access  │              │
│  └──────────────┘  ╚══════════════╝  │              │              │
│                                       │  [Contato]   │              │
│                                       └──────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│  [Logo]   Termos   Privacidade   LGPD   Contato    PT-BR           │
│           © 2026 DecorAI Brasil                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-02 (estilos), FR-12/FR-13 (diagnostico CTA), FR-16 (pricing), NFR-14 (PT-BR)

### 4.2 Wizard de Novo Projeto (/app/novo)

#### Step 1 — Tipo de Input

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]   Projetos    Novo Projeto              [Perfil ▼] [Pro]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ● Tipo de Input  ○ Detalhes  ○ Estilo  ○ Croqui  ○ Geracao       │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         Como voce quer comecar?                                    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │                  │  │                  │  │                  │    │
│  │   [icone camera] │  │  [icone regua]  │  │  [icone combo]  │    │
│  │                  │  │                  │  │                  │    │
│  │   Foto do Local  │  │   Descricao     │  │   Combinado     │    │
│  │                  │  │   com Medidas   │  │                  │    │
│  │   Envie uma foto │  │   Descreva o    │  │   Foto + medidas│    │
│  │   do ambiente    │  │   ambiente com  │  │   + referencias │    │
│  │                  │  │   dimensoes     │  │                  │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
│                                            [Proximo →]              │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-01, FR-24, FR-26

#### Step 2 — Detalhes (variante: Foto)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ○ Tipo  ● Detalhes  ○ Estilo  ○ Croqui  ○ Geracao                │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌───────────────────────────────────────┐                          │
│  │                                       │                          │
│  │     ┌───────────────────┐             │  Tipo de ambiente:       │
│  │     │                   │             │  [Sala ▼]                │
│  │     │   Arraste a foto  │             │                          │
│  │     │   aqui ou clique  │             │  Itens especificos:      │
│  │     │   para enviar     │             │                          │
│  │     │                   │             │  ┌─────────────────────┐ │
│  │     │   [icone upload]  │             │  │ + Adicionar item    │ │
│  │     │                   │             │  └─────────────────────┘ │
│  │     │   JPEG/PNG        │             │                          │
│  │     │   ate 20MB        │             │  ┌─────────────────────┐ │
│  │     └───────────────────┘             │  │ Sofa 2.20m     [X] │ │
│  │                                       │  │ [foto-ref.jpg]      │ │
│  │     Ou tire uma foto:                 │  ├─────────────────────┤ │
│  │     [Abrir Camera]                    │  │ Bancada granito [X] │ │
│  │                                       │  │ preto, 3m           │ │
│  └───────────────────────────────────────┘  └─────────────────────┘ │
│                                                                     │
│  [← Voltar]                               [Proximo →]              │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-01, FR-25, FR-26

#### Step 2 — Detalhes (variante: Descricao Textual)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ○ Tipo  ● Detalhes  ○ Estilo  ○ Croqui  ○ Geracao                │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Descreva o ambiente:                                               │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Tipo de ambiente: [Sala de estar ▼]                          │  │
│  │                                                               │  │
│  │  Largura: [4   ] m    Comprimento: [6   ] m                  │  │
│  │  Pe-direito: [2.80] m                                        │  │
│  │                                                               │  │
│  │  Aberturas:                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ Janela  | Parede: [Norte ▼] | Larg: [2.0]m | Alt:[1.5]m│  │  │
│  │  │ [+ Adicionar abertura]                                  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Descricao adicional (opcional):                              │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ Piso de concreto, paredes brancas, coluna estrutural    │  │  │
│  │  │ no centro...                                            │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Itens especificos:                                                 │
│  [+ Adicionar item com medida e/ou foto de referencia]              │
│                                                                     │
│  [← Voltar]                               [Proximo →]              │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-24, FR-25

#### Step 3 — Selecao de Estilo

```
┌─────────────────────────────────────────────────────────────────────┐
│  ○ Tipo  ○ Detalhes  ● Estilo  ○ Croqui  ○ Geracao                │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│         Escolha o estilo de decoracao:                              │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │          │ │██████████│ │          │ │          │ │          │ │
│  │ Moderno  │ │Industrial│ │Minimalist│ │ Classico │ │Escandin. │ │
│  │ [foto]   │ │ [foto]   │ │ [foto]   │ │ [foto]   │ │ [foto]   │ │
│  │          │ │ SELECION.│ │          │ │          │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │          │ │          │ │          │ │          │ │          │ │
│  │ Rustico  │ │ Tropical │ │Contempor.│ │  Boho    │ │  Luxo    │ │
│  │ [foto]   │ │ [foto]   │ │ [foto]   │ │ [foto]   │ │ [foto]   │ │
│  │          │ │          │ │          │ │          │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                     │
│  [← Voltar]                               [Proximo →]              │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-02

#### Step 4 — Croqui de Confirmacao

```
┌─────────────────────────────────────────────────────────────────────┐
│  ○ Tipo  ○ Detalhes  ○ Estilo  ● Croqui  ○ Geracao                │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Confirme o layout do seu ambiente:                                 │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐      │  │
│  │  │                    4.00m                            │      │  │
│  │  │  ┌──────────────────────────────────────────────┐   │      │  │
│  │  │  │                                              │   │      │  │
│  │  │  │   [Sofa 2.20m]                               │   │      │  │
│  │  │  │   ┌──────────────┐                           │ 6 │      │  │
│  │  │  │   │              │          [Mesa]           │ . │      │  │
│  │  │  │   └──────────────┘          ┌────┐           │ 0 │      │  │
│  │  │  │                             └────┘           │ 0 │      │  │
│  │  │  │                                              │ m │      │  │
│  │  │  │   ══════════════                             │   │      │  │
│  │  │  │   Janela (2.0m)   Parede Norte              │   │      │  │
│  │  │  │                                              │   │      │  │
│  │  │  │   [Bancada granito preto 3.0m]              │   │      │  │
│  │  │  │   ┌──────────────────────────┐              │   │      │  │
│  │  │  │   └──────────────────────────┘              │   │      │  │
│  │  │  └──────────────────────────────────────────────┘   │      │  │
│  │  └─────────────────────────────────────────────────────┘      │  │
│  │                                                               │  │
│  │  Pe-direito: 2.80m | Estilo: Industrial                      │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  O que voce gostaria de ajustar?                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Ex: "mova o sofa para a parede sul", "aumente a mesa"...     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  [Ajustar]                                                          │
│                                                                     │
│  [← Voltar]      [Aprovar e Gerar Imagem →]                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-29, FR-30, FR-31, FR-32
**Nota:** Usa tecnica de 3 turnos das ASCII Skills. O croqui e iteravel — usuario pode ajustar quantas vezes quiser antes de aprovar.

#### Step 5 — Geracao (Tela de Loading)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ○ Tipo  ○ Detalhes  ○ Estilo  ○ Croqui  ● Geracao                │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                                                                     │
│                    Gerando seu ambiente...                           │
│                                                                     │
│              ┌─────────────────────────────────┐                    │
│              │                                 │                    │
│              │    [Preview progressivo         │                    │
│              │     da imagem sendo gerada      │                    │
│              │     via WebSocket]               │                    │
│              │                                 │                    │
│              └─────────────────────────────────┘                    │
│                                                                     │
│              ████████████░░░░░░░░  65%                              │
│              Aplicando estilo industrial...                          │
│                                                                     │
│              Tempo estimado: ~15 segundos                           │
│                                                                     │
│   Voce sabia? Imoveis com staging profissional recebem             │
│   47% mais consultas.                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-19, NFR-01, NFR-16

### 4.3 Workspace do Projeto (/app/projeto/:id)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]   Projetos    Novo Projeto              [Perfil ▼] [Pro]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────┐ ┌─────────────────┐ │
│  │                                           │ │  Chat de        │ │
│  │                                           │ │  Refinamento    │ │
│  │                                           │ │                 │ │
│  │          [Imagem Gerada]                  │ │  IA: Seu        │ │
│  │          Canvas Principal                 │ │  ambiente em    │ │
│  │                                           │ │  estilo         │ │
│  │                                           │ │  industrial     │ │
│  │                                           │ │  esta pronto!   │ │
│  │                                           │ │                 │ │
│  │                                           │ │  Voce: Tira o   │ │
│  │                                           │ │  tapete e muda  │ │
│  │                                           │ │  o piso para    │ │
│  │                                           │ │  madeira clara  │ │
│  │                                           │ │                 │ │
│  │                                           │ │  IA: Pronto!    │ │
│  │                                           │ │  Removi o       │ │
│  │                                           │ │  tapete e       │ │
│  │                                           │ │  troquei o piso.│ │
│  ├───────────────────────────────────────────┤ │                 │ │
│  │  Barra de Ferramentas                     │ │                 │ │
│  │  [Slider] [Segmentar] [Iluminar] [Remover]│ │ ┌─────────────┐│ │
│  │  [Estilo ▼] [Compartilhar] [Download]     │ │ │ Digite...   ││ │
│  ├───────────────────────────────────────────┤ │ └─────────────┘│ │
│  │  Historico de Versoes                      │ │  [Enviar]      │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │ │                 │ │
│  │  │ v1 │ │ v2 │ │ v3 │ │ v4 │ │ v5 │      │ │ Versao 5 de 5  │ │
│  │  │    │ │    │ │    │ │    │ │ ██ │      │ │ [← Anterior]   │ │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘      │ │                 │ │
│  └───────────────────────────────────────────┘ └─────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:**
- Canvas: FR-01 (render), FR-20 (resolucao HD)
- Chat: FR-04, FR-05, FR-06, FR-27, FR-28
- Barra de Ferramentas: FR-07 (segmentar), FR-08 (iluminar), FR-09 (remover), FR-03 (estilo)
- Slider: FR-10
- Historico: FR-27
- Compartilhar: FR-11
- Download: FR-17 (marca d'agua no Free)

### 4.4 Slider Antes/Depois (Componente)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────────────┬──────────────────────┐                    │
│  │                      │                      │                    │
│  │                      │                      │                    │
│  │      ANTES           │█     DEPOIS          │                    │
│  │                      │█                     │                    │
│  │   [foto original]    │█  [foto decorada]    │                    │
│  │                      │█                     │                    │
│  │                      │                      │                    │
│  │                      │                      │                    │
│  └──────────────────────┴──────────────────────┘                    │
│                         ◄═══►                                       │
│                      (drag handle)                                  │
│                                                                     │
│  Nota: O handle central e arrastavel horizontalmente.               │
│  Em mobile: suporta touch/swipe.                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-10

### 4.5 Dashboard de Projetos (/app/projetos)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]   Projetos    Novo Projeto              [Perfil ▼] [Free]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Meus Projetos                                     [+ Novo Projeto] │
│                                                                     │
│  [Todos] [Favoritos]           Buscar: [___________] [Filtrar ▼]   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │              │  │              │  │              │              │
│  │  [thumbnail] │  │  [thumbnail] │  │  [thumbnail] │              │
│  │              │  │              │  │              │              │
│  │  Sala Apto   │  │  Quarto      │  │  Cozinha     │              │
│  │  Industrial  │  │  Escandinavo │  │  Moderno     │              │
│  │  5 versoes   │  │  3 versoes   │  │  8 versoes   │              │
│  │  08/03/2026  │  │  07/03/2026  │  │  06/03/2026  │              │
│  │  [♥] [...]   │  │  [♥] [...]   │  │  [♥] [...]   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Plano Free: 1 de 3 renders usados este mes                 │   │
│  │  ████░░░░░░░░░░░░░░ 33%         [Fazer Upgrade para Pro]   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-15 (historico), FR-16 (tier status), FR-17 (upgrade CTA)

### 4.6 Pagina de Login/Cadastro (/login)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo DecorAI]                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐ │
│  │                            │  │                                │ │
│  │    [Imagem de showcase     │  │   Bem-vindo ao DecorAI         │ │
│  │     ambiente decorado]     │  │                                │ │
│  │                            │  │   [Entrar com Google]          │ │
│  │                            │  │                                │ │
│  │                            │  │   ─── ou ───                  │ │
│  │                            │  │                                │ │
│  │                            │  │   Email:                       │ │
│  │                            │  │   [________________]           │ │
│  │                            │  │                                │ │
│  │                            │  │   Senha:                       │ │
│  │                            │  │   [________________]           │ │
│  │                            │  │                                │ │
│  │                            │  │   [Entrar]                     │ │
│  │                            │  │                                │ │
│  │                            │  │   Nao tem conta?               │ │
│  │                            │  │   [Criar conta gratis]         │ │
│  │                            │  │                                │ │
│  │                            │  │   Ao continuar, voce concorda  │ │
│  │                            │  │   com os Termos e a LGPD.     │ │
│  └────────────────────────────┘  └────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-14 (Google OAuth + email/password), NFR-08 (LGPD)

### 4.7 Diagnostico Reverse Staging (/diagnostico)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo DecorAI]          Como Funciona   Precos             [Login] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              Quanto seu imovel esta perdendo?                       │
│              Diagnostico gratuito com IA                             │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │     ┌───────────────────────────────────────┐                 │  │
│  │     │                                       │                 │  │
│  │     │   Arraste a foto do seu anuncio       │                 │  │
│  │     │   aqui ou clique para enviar          │                 │  │
│  │     │                                       │                 │  │
│  │     │          [icone upload]                │                 │  │
│  │     │                                       │                 │  │
│  │     └───────────────────────────────────────┘                 │  │
│  │                                                               │  │
│  │     [Analisar Gratuitamente]                                  │  │
│  │                                                               │  │
│  │     Nao precisamos de cadastro para o diagnostico.           │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Resultado (apos analise):                                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌────────────────────┬────────────────────┐                  │  │
│  │  │    SUA FOTO        │   COM STAGING AI   │                  │  │
│  │  │                    │                    │                  │  │
│  │  │   [foto original]  │  [foto staging]    │                  │  │
│  │  └────────────────────┴────────────────────┘                  │  │
│  │                                                               │  │
│  │  Diagnostico:                                                 │  │
│  │  ┌─────────────────────────────────────────┐                  │  │
│  │  │  ⚠ Ambiente vazio — sem staging         │                  │  │
│  │  │  ⚠ Iluminacao pode ser melhorada        │                  │  │
│  │  │  ⚠ Objetos que distraem o comprador    │                  │  │
│  │  └─────────────────────────────────────────┘                  │  │
│  │                                                               │  │
│  │  Estimativa de impacto:                                       │  │
│  │  "Seu imovel pode estar perdendo ate 30% do valor             │  │
│  │   percebido pelos compradores."                               │  │
│  │                                                               │  │
│  │  [Decorar este imovel agora — GRATIS]                        │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Rastreabilidade:** FR-12, FR-13

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
