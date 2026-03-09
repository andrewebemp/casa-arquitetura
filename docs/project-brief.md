# Project Brief: DecorAI Brasil

**Data:** 2026-03-08
**Versão:** 1.0
**Autor:** Atlas (Business Analyst)
**Status:** Draft — Aguardando revisão

---

## Executive Summary

**DecorAI Brasil** é uma plataforma de IA generativa que transforma espaços vazios em ambientes decorados fotorrealistas, unificando em um único produto: virtual staging, edição de fotos imobiliárias, personalização granular de materiais (paredes, pisos, armários, bancadas), tours virtuais 360° e realidade aumentada.

**Problema central:** Profissionais do mercado imobiliário brasileiro precisam de 3 a 5 ferramentas distintas (todas em inglês, cobrando em USD) para produzir material visual de qualidade. Imóveis sem staging profissional recebem 47% menos consultas e ficam mais tempo no mercado.

**Mercado-alvo:** Corretores de imóveis, imobiliárias, incorporadoras e designers de interiores no Brasil (PropTech BR projetado para USD 1.23B até 2030).

**Proposta de valor:** A única plataforma all-in-one em português que aceita múltiplos inputs (foto, sketch, medidas, linguagem natural) e permite diálogo iterativo com a IA para refinar o resultado — "deixa mais aconchegante", "troca o piso para madeira clara", "remove o sofá".

---

## Problem Statement

### Situação Atual

O mercado imobiliário brasileiro sofre com um gap significativo de material visual de qualidade:

1. **Imóveis vazios não vendem.** 82% dos compradores afirmam que fotos são o fator mais importante na decisão de compra, mas a maioria dos anúncios no Brasil apresenta fotos amadoras de espaços vazios e mal iluminados.

2. **Staging físico é proibitivamente caro.** Um apartamento decorado modelo custa R$ 150K-500K por tipologia. Incorporadoras pagam esse valor, mas corretores individuais e pequenas imobiliárias não têm esse orçamento.

3. **Ferramentas existentes são fragmentadas e importadas.** Um profissional precisa usar Virtual Staging AI (staging), BoxBrownie (edição de fotos), Matterport (360°) e IKEA Place (AR) — 4 assinaturas separadas, todas em inglês, cobrando em dólar.

4. **Nenhuma ferramenta oferece diálogo com IA.** As soluções atuais são "caixas pretas": foto entra, resultado sai. Não há como refinar iterativamente ("mais moderno", "tira o tapete", "muda a bancada para granito preto").

5. **O mercado brasileiro está sub-atendido.** 95% das ferramentas são US-centric, sem suporte a estilos de decoração brasileiros, sem preços em R$, e sem integração com portais locais (ZAP, QuintoAndar, OLX).

### Impacto Quantificado

| Impacto | Dado |
|---------|------|
| Perda de consultas por falta de staging | -47% (estudo 2025) |
| Perda de valor percebido | -20-30% |
| Custo anual de 4 ferramentas separadas | ~USD 3.600/ano (R$ 21.600) |
| Tempo gasto coordenando ferramentas | ~8h/semana por profissional |
| Mercado total endereçável (Brasil) | USD 1.23B até 2030 |

### Por que agora

- **Tecnologia madura:** Stable Diffusion + ControlNet validados academicamente para interiores (papers 2024/2025)
- **Mercado acelerando:** CAGR 26-30% globalmente; PropTech BR em 14.4%
- **Consolidação começando:** Zillow comprou Virtual Staging AI; CoStar comprou Matterport — janela de oportunidade se fechando
- **46% dos arquitetos** já usam IA; 24% adicionais planejam começar

---

## Proposed Solution

### Conceito Core

Uma plataforma web que funciona como **parceira de design com IA**: o usuário fornece um input (foto, sketch, medidas ou descrição textual), detalha o que deseja em linguagem natural, e a IA cria, refina e entrega visualizações fotorrealistas de ambientes decorados.

### Diferenciais vs. Concorrentes

| Diferencial | DecorAI Brasil | Concorrentes |
|-------------|---------------|-------------|
| **Pipeline unificado** | Staging + edição + 360° + AR + personalização | Cada um faz 1 coisa |
| **Diálogo iterativo com IA** | "Deixa mais aconchegante", "tira o tapete" | Foto entra, resultado sai |
| **Input multi-formato** | Foto + sketch + medidas + texto | Apenas foto |
| **Personalização granular** | Trocar SÓ o piso, SÓ a bancada | Troca tudo ou nada |
| **Localização Brasil** | PT-BR, R$, estilos brasileiros | Inglês, USD |
| **Reverse Staging (funil)** | "Quanto seu imóvel está perdendo?" | Não existe |

### Por que vai funcionar

1. **Moat geográfico:** Localização profunda para Brasil/LATAM é difícil de replicar por players US-centric
2. **Moat de rede:** Quanto mais o usuário usa, melhor a IA entende suas preferências (memória episódica)
3. **Moat de dados:** Dataset de interiores brasileiros para fine-tuning cria barreira técnica
4. **Moat de distribuição:** Reverse Staging como funil freemium + parcerias com portais locais

---

## Target Users

### Segmento Primário: Corretores de Imóveis e Imobiliárias (B2B)

**Perfil:**
- 450.000+ corretores registrados no Brasil (CRECI)
- Renda média: R$ 5.000-15.000/mês
- Faixa etária: 25-55 anos
- Utilização digital: moderada a alta (WhatsApp, portais imobiliários)

**Comportamento atual:**
- Fotografam imóveis com celular, sem tratamento
- Publicam em ZAP Imóveis, OLX, QuintoAndar, Viva Real
- Imóveis vagos ficam 30-60% mais tempo no mercado
- Não usam ferramentas de IA por barreira de idioma e custo

**Dores específicas:**
- "Imóvel vazio não gera interesse no comprador"
- "Não tenho orçamento para staging físico (R$ 5K-15K por imóvel)"
- "As fotos que tiro não transmitem o potencial do espaço"
- "Preciso de algo rápido — não tenho tempo para aprender ferramentas complexas"

**Objetivo:** Vender mais rápido, com melhor preço, usando material visual profissional.

### Segmento Secundário: Incorporadoras e Construtoras (B2B Enterprise)

**Perfil:**
- ~3.000 incorporadoras ativas no Brasil
- Lançam ~200.000 unidades/ano
- Budget de marketing por lançamento: R$ 500K-5M
- Equipes de marketing de 3-15 pessoas

**Comportamento atual:**
- Pagam R$ 150K-500K por apartamento decorado modelo
- Contratam fotógrafos profissionais e renderistas 3D
- Lead time de 2-4 semanas para material visual
- Cada tipologia exige um decorado diferente

**Dores específicas:**
- "O custo do decorado modelo consome parte significativa do budget"
- "Precisamos de 3-5 tipologias decoradas, mas só conseguimos pagar 1"
- "O cliente quer ver personalização (outro piso, outra bancada) e não temos como mostrar"
- "Lead time de semanas para renders 3D inviabiliza ajustes de última hora"

**Objetivo:** Reduzir custo de material visual, oferecer personalização para compradores na planta, acelerar ciclo de vendas.

### Segmento Terciário: Designers de Interiores e Arquitetos (B2B Pro)

**Perfil:**
- ~150.000 profissionais registrados no Brasil (CAU + ABD)
- Trabalham com projetos de R$ 5K-500K
- Usam ferramentas como SketchUp, Revit, AutoCAD
- Precisam apresentar propostas visuais ao cliente

**Dores específicas:**
- "Render 3D demora dias e custa caro (R$ 200-800/imagem)"
- "O cliente não consegue visualizar a proposta a partir de uma planta baixa"
- "Preciso iterar rapidamente com o cliente sobre estilos e materiais"

**Objetivo:** Apresentar propostas visuais rápidas e fotorrealistas para fechar projetos.

---

## Goals & Success Metrics

### Business Objectives

- **OBJ-01:** Conquistar 500 usuários registrados nos primeiros 3 meses pós-launch (validação de mercado)
- **OBJ-02:** Atingir MRR de R$ 5.000 no mês 3 e R$ 100.000 no mês 12
- **OBJ-03:** Converter 5% dos usuários free para planos pagos no MVP, escalando para 8-12% em 12 meses
- **OBJ-04:** Estabelecer parceria com pelo menos 1 portal imobiliário (ZAP, QuintoAndar ou OLX) no primeiro ano
- **OBJ-05:** Pilotar com 2-3 incorporadoras até o mês 6

### User Success Metrics

- **USM-01:** Time-to-first-render < 60 segundos (da primeira foto ao primeiro resultado)
- **USM-02:** Satisfação com qualidade fotorrealista > 4.0/5.0 em pesquisa
- **USM-03:** 70% dos usuários utilizam o chat de refinamento (não apenas "gerar e sair")
- **USM-04:** Corretor reporta aumento de consultas em imóveis com staging AI
- **USM-05:** NPS > 40 no MVP, > 50 em 12 meses

### Key Performance Indicators (KPIs)

| KPI | Definição | Target MVP | Target 12m |
|-----|-----------|-----------|-----------|
| **Usuários registrados** | Contas criadas com pelo menos 1 render | 500 | 10.000 |
| **Renders/mês** | Imagens geradas pela plataforma | 2.000 | 50.000 |
| **Conversão Free→Paid** | % usuários que assinam plano pago | 5% | 8-12% |
| **MRR** | Receita recorrente mensal | R$ 5.000 | R$ 100.000 |
| **Churn mensal** | % assinantes que cancelam | <10% | <5% |
| **Custo/render** | Custo de GPU + infra por imagem | <R$ 2,00 | <R$ 0,50 |
| **NPS** | Net Promoter Score | >40 | >50 |
| **Time-to-value** | Tempo do cadastro ao primeiro render | <3 min | <2 min |

---

## MVP Scope

### Core Features (Must Have)

- **F01 — Upload e Staging AI:** Usuário faz upload de foto de cômodo vazio → IA gera versão decorada em 10-30 segundos. Suporte a 10 estilos predefinidos (moderno, industrial, minimalista, clássico, escandinavo, rústico, tropical, contemporâneo, boho, luxo).

- **F02 — Chat Visual de Refinamento:** Após geração, o usuário conversa com a IA para ajustar: "deixa mais aconchegante", "tira o tapete", "muda o piso para madeira clara", "adiciona uma planta no canto". A IA aplica edições pontuais sem regerar a cena inteira. Este é o diferencial central.

- **F03 — Slider Antes/Depois:** Componente visual que permite comparar o ambiente original e o decorado com um slider deslizante. Compartilhável via link para redes sociais e WhatsApp.

- **F04 — Troca de Estilo com 1 Clique:** Gerar variações do mesmo ambiente em estilos diferentes instantaneamente. O usuário não precisa fazer upload novamente.

- **F05 — Segmentação por Elemento:** Trocar individualmente parede, piso, bancada, armário — não apenas o estilo geral. Baseado em SAM (Segment Anything) para segmentação precisa.

- **F06 — Melhoria de Iluminação:** Correção automática de fotos escuras ou mal expostas. Enhancement de iluminação natural e artificial.

- **F07 — Remoção de Objetos:** Remover objetos indesejados (entulho, móveis velhos, itens pessoais) usando inpainting AI.

- **F08 — Reverse Staging (Funil Freemium):** Ferramenta gratuita de diagnóstico: usuário faz upload da foto do anúncio atual, IA analisa e mostra "seu imóvel está perdendo ~R$ X por não ter staging profissional", com CTA para o plano pago.

- **F09 — Autenticação e Perfil:** Login via Google/email, perfil com histórico de projetos, favoritos e preferências.

- **F10 — Tiers de Pricing:** Free (3 renders/mês, marca d'água) / Pro (R$ 79-149/mês) / Business (R$ 299-499/mês).

### Out of Scope for MVP

- Tours virtuais 360° (Fase 3)
- Realidade Aumentada com ARKit/ARCore (Fase 3)
- Input via sketch/desenho (Fase 2)
- ~~Input via medidas/dimensões~~ — **Promovido ao MVP** (ver PRD FR-24, FR-25, FR-26)
- Marketplace de móveis/materiais (Fase 4)
- White-label SDK / API B2B (Fase 4)
- App mobile nativo (web responsivo no MVP)
- Modo offline
- Multi-idioma (apenas PT-BR no MVP)
- Personalização de exteriores/fachadas

### MVP Success Criteria

O MVP será considerado bem-sucedido se, em 90 dias após o lançamento:

1. **500+ usuários registrados** com pelo menos 1 render completado
2. **Qualidade perceptual > 4.0/5.0** em pesquisa de satisfação (amostra de 50 usuários)
3. **70% dos renders** envolvem pelo menos 1 interação de refinamento via chat
4. **5% de conversão** free → paid
5. **Custo por render < R$ 2,00** (sustentabilidade financeira)
6. **3+ depoimentos** de corretores relatando impacto em vendas/consultas

---

## Post-MVP Vision

### Phase 2 — Diferenciação (Meses 4-6)

- **Input via sketch/desenho:** ControlNet scribble para converter desenhos à mão livre ou fotos de plantas baixas em ambientes 3D decorados
- **Canvas "Arrasta e Sonha":** Drag-and-drop de foto de referência (Pinterest, Instagram) para que a IA extraia automaticamente estilo, paleta e materiais
- **Orçamento vivo:** Cada elemento gerado mostra faixa de preço estimado; controle de orçamento ajusta automaticamente materiais
- **Scene Graph persistente:** Transição de "gerador de imagens" para "editor de ambientes" com grafo de dependência de cena
- **LoRA por estilo:** Sharding dinâmico de adapters para escalabilidade de catálogo de estilos
- **Staging-as-a-Service:** Pacote dedicado para incorporadoras (planta → 3D → staging → apresentação)

### Phase 3 — Imersão e Escala (Meses 7-10)

- **Tours virtuais 360°** a partir de múltiplas fotos do mesmo ambiente
- **Realidade Aumentada** para visualizar móveis no espaço real (WebXR primeiro, native depois)
- **Input via medidas/dimensões** com geração procedural de planta 3D
- **White-label SDK** para portais imobiliários (ZAP, QuintoAndar, OLX)
- **Cache semântico** e roteamento adaptativo de GPU para escala

### Long-term Vision (12-24 meses)

- **Marketplace de móveis/materiais** com comissão: "Gostou da bancada? Compre aqui"
- **Diffusion world model** para "caminhar" por ambientes não fotografados
- **Tour emocional em vídeo** com narração AI para anúncios
- **Memória episódica** por usuário via vector store — a plataforma evolui com cada uso
- **Expansão LATAM:** México, Colômbia, Argentina (maiores mercados proptech da região)
- **Programa de certificação "AI Stager"** com rede de revendedores comissionados

### Expansion Opportunities

| Vertical | Descrição | Potencial |
|----------|-----------|-----------|
| **Seguradoras** | Sinistro → foto do dano → IA gera restauração como referência de valor | R$ 12B/ano mercado BR |
| **E-commerce de móveis** | AR para "experimentar antes de comprar" | 60% dos consumidores querem |
| **Construtoras (planta)** | De planta baixa a tour virtual completo | 200K unidades/ano no BR |
| **Airbnb/booking** | Staging para anfitriões de aluguel temporário | Mercado crescente |
| **Reforma residencial** | Proprietários visualizando reformas antes de executar | B2C massivo |

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web app responsivo (desktop + mobile browsers)
- **Browser Support:** Chrome 90+, Safari 15+, Firefox 90+, Edge 90+
- **Performance Requirements:**
  - Geração de render: < 30 segundos para resultado inicial
  - Refinamento via chat: < 15 segundos por iteração
  - Upload de foto: suporte a JPEG/PNG até 20MB
  - Resolução de output: até 2048x2048 (HD) para planos pagos

### Technology Preferences

- **Frontend:** Next.js (React) com TypeScript — SSR para SEO, app-like UX
- **Backend:** Node.js (API REST) ou Python (FastAPI) para pipeline de IA
- **IA/ML Pipeline:**
  - Stable Diffusion XL + ControlNet (multi-conditioning: depth + normal + edge)
  - Segment Anything (SAM) para segmentação semântica
  - ZoeDepth para depth estimation e escala automática
  - CLIP para extração de estilo e correspondência de referências
  - LLM (Claude ou GPT) para interpretar comandos em linguagem natural
- **Database:** PostgreSQL (dados estruturados) + S3-compatible (imagens)
- **Hosting/Infrastructure:** Cloud com GPU (AWS, GCP ou Modal/Replicate para inferência)
- **Cache:** Redis para sessões e cache semântico de renders

### Architecture Considerations

- **Repository Structure:** Monorepo (Turborepo) com packages: web, api, ai-pipeline, shared
- **Service Architecture:**
  - Web app (Next.js) → API Gateway → AI Pipeline (GPU workers)
  - Fila de jobs para processamento assíncrono de renders
  - WebSocket para feedback em tempo real durante geração
- **Integration Requirements:**
  - Auth: Google OAuth, email/password
  - Pagamentos: Stripe (internacional) + gateway BR (Asaas, Pagar.me)
  - Storage: S3 para imagens originais e geradas
  - CDN: CloudFront ou Cloudflare para entrega de imagens
- **Security/Compliance:**
  - LGPD: consentimento explícito para processamento de imagens
  - Imagens do usuário não devem ser usadas para treinamento sem opt-in
  - Marca d'água no tier free como proteção de IP
  - Rate limiting por tier para evitar abuso

---

## Constraints & Assumptions

### Constraints

- **Budget:** Fase MVP com investimento lean; custo de GPU é o principal gargalo financeiro (estimativa: R$ 4-8K/mês para 2.000 renders)
- **Timeline:** MVP em 3-4 meses com equipe enxuta (1-2 devs full-stack + 1 ML engineer)
- **Resources:** Equipe inicial pequena; considerar serviços gerenciados (Replicate, Modal) vs. infraestrutura própria
- **Technical:** Qualidade fotorrealista depende de fine-tuning com dataset de interiores brasileiros (necessário curar 5K-10K imagens)

### Key Assumptions

- Corretores brasileiros estão dispostos a pagar R$ 79-149/mês por uma ferramenta de IA se o ROI for demonstrável
- A qualidade de Stable Diffusion + ControlNet já é suficiente para uso profissional imobiliário (validar no MVP)
- O mercado brasileiro prefere plataforma em português com pricing em reais
- Reverse Staging (diagnóstico gratuito) terá conversão > 10% para plano pago
- O diálogo iterativo com IA (chat visual) será adotado — não apenas "gerar e baixar"
- Custos de GPU continuarão diminuindo, tornando o modelo sustentável a médio prazo
- Não haverá regulamentação brasileira restritiva sobre imagens AI em anúncios imobiliários no curto prazo

---

## Risks & Open Questions

### Key Risks

- **Qualidade insuficiente dos renders:** Se o resultado não for fotorrealista o suficiente, profissionais não vão adotar. **Mitigação:** Fine-tuning com dataset de interiores brasileiros; benchmark rigoroso com FID score antes do launch; feedback loop com beta testers.

- **Custo de GPU inviável:** Inferência de Stable Diffusion é cara. Se custo/render > R$ 2,00, margens ficam negativas no tier Pro. **Mitigação:** Modelos otimizados (SDXL Turbo, distillation), cache semântico agressivo, roteamento para GPU spot.

- **Big Tech entra no mercado BR:** Amazon, Google ou Zillow podem lançar produto similar localizado. **Mitigação:** Moat de localização profunda (estilos BR, portais BR, pricing BR), velocidade de execução, parcerias locais exclusivas.

- **Baixa adoção inicial:** Corretores podem resistir a adotar tecnologia nova. **Mitigação:** Reverse Staging como funil gratuito (cria urgência sem risco), tier free generoso, onboarding guiado em vídeo, parcerias com CRECI e imobiliárias.

- **Regulamentação de IA em anúncios:** Possibilidade de leis exigindo disclosure de imagens AI em anúncios imobiliários. **Mitigação:** Implementar disclaimer de "imagem ilustrativa gerada por IA" desde o início; transparência como valor da marca.

### Open Questions

- Qual é o threshold mínimo de qualidade fotorrealista aceitável para corretores? (necessita user research)
- O chat de refinamento deve usar LLM externo (Claude/GPT) ou modelo local para interpretação de comandos?
- Hosting próprio (GPU) vs. serviço gerenciado (Replicate/Modal) — qual é mais custo-efetivo para o volume inicial?
- Devemos começar com mobile-first ou desktop-first? (corretores usam muito celular, mas edição de imagem é melhor em desktop)
- O nome "DecorAI Brasil" é definitivo ou placeholder? (necessita pesquisa de naming e disponibilidade de domínio)
- Existe viabilidade de partnership com CRECI para distribuição?

### Areas Needing Further Research

- **User research com corretores:** Entrevistar 10-20 corretores para validar dores, willingness-to-pay e fluxo de trabalho real
- **Benchmark de qualidade:** Gerar 100 renders com o pipeline proposto e validar com profissionais do mercado
- **Análise de custos de GPU:** Calcular custo real por render em diferentes provedores (AWS, GCP, Modal, Replicate)
- **Viabilidade legal:** Consultar advogado sobre uso de imagens AI em anúncios imobiliários no Brasil
- **Naming e branding:** Pesquisa de nome, domínio, e posicionamento de marca
- **Análise de portais:** Mapear APIs públicas de ZAP, QuintoAndar, OLX para futura integração

---

## Appendices

### A. Research Summary

Este Project Brief foi construído a partir de dois documentos de pesquisa produzidos pela sessão de análise Atlas:

1. **[Pesquisa de Mercado](research/market-research-ai-interior-design-platform.md)** — Análise de mercado (USD 574M → USD 4.73B), 30+ concorrentes mapeados em 5 categorias, stack tecnológico validado, análise SWOT, modelos de monetização benchmarkados.

2. **[Sessão de Brainstorming](research/brainstorming-ai-interior-design-platform.md)** — 32 ideias de 4 perspectivas especializadas (arquitetura, UX, negócio, IA/ML), top 10 priorizadas por valor/esforço/ROI, 8 wild cards, roadmap sugerido em 4 fases.

### B. Key Data Points

| Dado | Fonte | Valor |
|------|-------|-------|
| Mercado virtual staging 2025 | Business Research Insights | USD 574M |
| Projeção 2035 | Market Growth Reports | USD 4.73B |
| CAGR virtual staging | Market Growth Reports | 26.4% |
| AI interior design 2024 | GlobeNewsWire | USD 1.52B |
| PropTech Brasil 2030 | Grand View Research | USD 1.23B |
| Compradores que priorizam fotos | Industry survey | 82% |
| Aumento de consultas com AI staging | Study 2025 | +47% |
| Arquitetos usando IA | Survey 2024/2025 | 46% |
| Consumidores querendo mais AR | Industry study | 60% |
| Aumento valor percebido com staging | Industry benchmark | +20-30% |

### C. References

- [Pesquisa de Mercado completa](research/market-research-ai-interior-design-platform.md)
- [Sessão de Brainstorming completa](research/brainstorming-ai-interior-design-platform.md)
- [Virtual Staging Solution Market 2035](https://www.marketgrowthreports.com/market-reports/virtual-staging-solution-market-100477)
- [AI Virtual Interior Design Global Market 2025](https://www.globenewswire.com/news-release/2026/01/07/3214715/28124/en/)
- [Brazil PropTech Market 2030](https://www.grandviewresearch.com/horizon/outlook/proptech-market/brazil)
- [AI Architecture Design 2026](https://illustrarch.com/artificial-intelligence/72649-ai-architecture-design.html)
- [Stable Diffusion Interior Design - FOAR Journal](https://journal.hep.com.cn/foar/EN/10.1016/j.foar.2024.08.003)

---

## Next Steps

### Immediate Actions

1. **Validar naming e domínio:** Pesquisar disponibilidade de "DecorAI" (ou alternativa) como domínio .com.br e marca
2. **User research:** Entrevistar 10-20 corretores de imóveis para validar dores e willingness-to-pay
3. **Proof of concept técnico:** Montar pipeline ControlNet + SAM + ZoeDepth e gerar 50 renders de teste
4. **Benchmark de qualidade:** Apresentar renders de teste a 20 profissionais e medir satisfação
5. **Análise de custos GPU:** Calcular custo real/render em Modal, Replicate e AWS para validar pricing
6. **Handoff para @pm:** Criar PRD detalhado baseado neste brief

### PM Handoff

Este Project Brief fornece o contexto completo para **DecorAI Brasil**. O próximo passo é ativar **@pm (Morgan)** em modo de "PRD Generation", que deve revisar este brief e trabalhar seção por seção para criar o PRD detalhado, começando pelas features do MVP (F01-F10).

**Documentos de referência para o PRD:**
- Este brief (`docs/brief.md`)
- Pesquisa de mercado (`docs/research/market-research-ai-interior-design-platform.md`)
- Brainstorming (`docs/research/brainstorming-ai-interior-design-platform.md`)

---

*— Atlas, investigando a verdade 🔎*
