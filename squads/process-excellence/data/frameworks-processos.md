# Frameworks de Processos - Base de Conhecimento Operacional

> Referencia densa para diagnostico, redesenho e melhoria de processos.
> Cada framework inclui passos concretos, ferramentas e aplicacao pratica.

---

## 1. Lean Manufacturing / Lean Thinking

### 1.1 Os 8 Desperdicios (TIMWOODS)

O principio central do Lean: toda atividade que nao agrega valor percebido pelo cliente e desperdicio. Eliminar desperdicio e o caminho mais rapido para aumentar throughput sem aumentar recursos.

#### T - Transporte

- **Definicao:** Movimentacao desnecessaria de materiais, informacoes ou artefatos entre etapas.
- **Sintomas:** Handoffs excessivos, dados copiados entre sistemas, aprovacoes que passam por muitas mesas.
- **Exemplos:**
  - *Negocios:* Documento fisico que viaja entre 4 departamentos para assinatura.
  - *Dev:* Ticket que passa por 6 filas no Jira antes de alguem comecar a trabalhar.
  - *Pessoal:* Transferir anotacoes do caderno para o app, depois para o calendario.
- **Como eliminar:**
  1. Mapear cada handoff e perguntar: "Este intermediario agrega valor?"
  2. Consolidar etapas adjacentes sob o mesmo responsavel.
  3. Usar sistemas unificados (single source of truth) em vez de copiar dados.
  4. Automatizar transferencias inevitaveis com integracoes diretas.

#### I - Inventario

- **Definicao:** Acumulo de trabalho em progresso (WIP), materiais ou informacoes alem do necessario.
- **Sintomas:** Backlog inflado, filas longas, estoque parado, PRs abertos ha semanas.
- **Exemplos:**
  - *Negocios:* 200 leads no CRM sem follow-up ha 30 dias.
  - *Dev:* 47 branches abertas, 15 PRs aguardando review.
  - *Pessoal:* 300 emails nao lidos, 50 abas abertas no navegador.
- **Como eliminar:**
  1. Implementar limites de WIP (ex: max 3 itens em progresso por pessoa).
  2. Aplicar FIFO — primeiro que entra, primeiro que sai.
  3. Revisar backlog semanalmente: deletar o que nao sera feito em 30 dias.
  4. Medir cycle time — inventario alto = cycle time alto.

#### M - Movimento

- **Definicao:** Movimentacao desnecessaria de pessoas (fisica ou cognitiva).
- **Sintomas:** Alternar entre muitas ferramentas, reunioes sem pauta, buscar informacao dispersa.
- **Exemplos:**
  - *Negocios:* Funcionario andando entre predios para usar a impressora.
  - *Dev:* Alternar entre 8 ferramentas para fazer um deploy.
  - *Pessoal:* Procurar chaves toda manha, reorganizar mesa repetidamente.
- **Como eliminar:**
  1. Organizar o ambiente (fisico e digital) com 5S.
  2. Centralizar ferramentas: IDE com plugins vs. 5 apps separados.
  3. Criar atalhos, templates e automacoes para tarefas repetitivas.
  4. Definir local fixo para cada coisa (digital e fisico).

#### W - Espera (Waiting)

- **Definicao:** Tempo ocioso esperando aprovacao, recurso, informacao ou sistema.
- **Sintomas:** Gargalos de aprovacao, dependencias bloqueantes, "estou esperando fulano".
- **Exemplos:**
  - *Negocios:* Proposta parada 5 dias esperando assinatura do diretor.
  - *Dev:* PR aprovado esperando 3 dias pelo pipeline de CI/CD.
  - *Pessoal:* Esperar resposta de email para poder avancar a proxima etapa.
- **Como eliminar:**
  1. Identificar onde tempo de espera > tempo de processamento.
  2. Criar regras de auto-aprovacao para itens de baixo risco.
  3. Paralelizar: trabalhar em outro item enquanto espera.
  4. Estabelecer SLAs internos de resposta (ex: review em 4h).

#### O - Superproduccao (Overproduction)

- **Definicao:** Produzir mais do que o necessario, antes do necessario, ou com mais qualidade do que o necessario.
- **Sintomas:** Features que ninguem usa, relatorios que ninguem le, documentacao excessiva.
- **Exemplos:**
  - *Negocios:* Gerar relatorio semanal de 40 paginas que 2 pessoas leem.
  - *Dev:* Implementar 5 endpoints "para o futuro" que nunca serao usados.
  - *Pessoal:* Planejar 20 metas para o ano quando so consegue executar 5.
- **Como eliminar:**
  1. Sistema pull: so produzir quando ha demanda real.
  2. MVP: entregar o minimo viavel primeiro, iterar depois.
  3. Medir uso: se ninguem usa em 30 dias, eliminar.
  4. Perguntar antes de produzir: "Quem pediu isso? Quando vai usar?"

#### D - Superprocessamento (Over-processing)

- **Definicao:** Executar mais etapas, com mais complexidade ou mais refinamento do que o necessario.
- **Sintomas:** Processos com 15 etapas quando 5 bastariam, formatacao excessiva, burocracia.
- **Exemplos:**
  - *Negocios:* Formulario com 30 campos quando 8 sao suficientes.
  - *Dev:* Abstrair 3 niveis de heranca para um CRUD simples.
  - *Pessoal:* Formatar notas pessoais como se fossem publicacao academica.
- **Como eliminar:**
  1. Para cada etapa perguntar: "Se eu remover isso, o resultado muda?"
  2. Simplificar formularios: so pedir o que sera usado.
  3. Regra 80/20: 80% do valor vem de 20% das etapas.
  4. Prototipar o processo minimo e adicionar complexidade so quando necessario.

#### D - Defeitos

- **Definicao:** Erros que exigem retrabalho, correcao ou descarte.
- **Sintomas:** Alta taxa de bugs, devolucoes, reclamacoes, retrabalho frequente.
- **Exemplos:**
  - *Negocios:* Contrato enviado com dados errados, precisa refazer.
  - *Dev:* Bug em producao que exige hotfix e rollback.
  - *Pessoal:* Compromisso marcado na data errada, precisa remarcar tudo.
- **Como eliminar:**
  1. Poka-yoke: design que previne o erro (validacao no formulario, tipos fortes no codigo).
  2. Inspecao na fonte: revisar no ponto de criacao, nao no fim do processo.
  3. Checklists obrigatorios antes de transicoes criticas.
  4. Medir custo do retrabalho para priorizar prevencao.

#### S - Skills Subutilizados

- **Definicao:** Nao aproveitar o conhecimento, criatividade ou capacidade das pessoas.
- **Sintomas:** Especialistas fazendo trabalho administrativo, sugestoes ignoradas, microgerenciamento.
- **Exemplos:**
  - *Negocios:* Engenheiro senior preenchendo planilhas manuais.
  - *Dev:* Dev full-stack so fazendo manutencao de CSS.
  - *Pessoal:* Usar 10% das funcionalidades de uma ferramenta paga.
- **Como eliminar:**
  1. Mapear competencias vs. atividades atuais de cada pessoa.
  2. Delegar/automatizar trabalho administrativo repetitivo.
  3. Criar canais para sugestoes de melhoria (kaizen).
  4. Alinhar tarefas com zona de competencia.

### 1.2 Metodologia 5S Aplicada a Processos

| Passo | Japones | Acao Pratica |
|-------|---------|-------------|
| 1. Seiri | Senso de Utilizacao | Listar todas as etapas do processo. Eliminar as que nao agregam valor. Perguntar: "Se removermos isso, o cliente percebe?" |
| 2. Seiton | Senso de Organizacao | Ordenar etapas na sequencia otima. Definir responsavel claro para cada uma. Criar nomenclatura padrao. |
| 3. Seiso | Senso de Limpeza | Remover debris do processo: documentos desatualizados, campos inuteis, excecoes que viraram regra. |
| 4. Seiketsu | Senso de Padronizacao | Documentar o processo limpo como SOP. Criar templates. Definir metricas de conformidade. |
| 5. Shitsuke | Senso de Disciplina | Auditorias periodicas (semanal/mensal). Revisar se o padrao esta sendo seguido. Retreinar quando necessario. |

**Como aplicar 5S em um processo existente:**
1. Selecionar o processo-alvo (priorizar pelo impacto).
2. Reunir os executores do processo (quem faz, nao quem gerencia).
3. Percorrer cada etapa e classificar: agrega valor / necessaria mas nao agrega / desperdicio.
4. Eliminar desperdicios imediatamente.
5. Reorganizar a sequencia restante.
6. Documentar o novo padrao.
7. Agendar revisao em 30 dias.

### 1.3 Kaizen - Melhoria Continua

**Ciclo Kaizen (PDCA aplicado):**

1. **Identificar:** Escolher um problema especifico e mensuravel.
2. **Analisar:** Coletar dados sobre o estado atual. Medir tempo, erros, custo.
3. **Propor:** Gerar 3+ solucoes possiveis. Priorizar por impacto vs. esforco.
4. **Implementar:** Testar a solucao em escala pequena (piloto).
5. **Verificar:** Medir resultado vs. baseline. Funcionou?
6. **Padronizar:** Se sim, documentar e escalar. Se nao, voltar ao passo 3.

**Regras do Kaizen:**
- Melhorias pequenas e frequentes > transformacoes grandes e raras.
- Quem executa o processo e quem melhor sabe como melhora-lo.
- Sem culpa: foco no processo, nunca na pessoa.
- Toda melhoria deve ser mensuravel (antes vs. depois).

---

## 2. Six Sigma (DMAIC)

### 2.1 Define (Definir)

**Objetivo:** Delimitar o problema com precisao cirurgica.

**Ferramentas e passos:**

1. **Problem Statement** — Descrever em 1-2 frases:
   - O que esta acontecendo de errado?
   - Onde? Quando? Com que frequencia?
   - Qual o impacto (custo, tempo, satisfacao)?
   - Exemplo: "30% dos pedidos de reembolso levam mais de 15 dias uteis para processar, gerando 45 reclamacoes/mes."

2. **SIPOC** — Mapa de alto nivel do processo:
   - **S**uppliers: Quem fornece inputs?
   - **I**nputs: O que entra no processo?
   - **P**rocess: 5-7 etapas macro.
   - **O**utputs: O que sai do processo?
   - **C**ustomers: Quem recebe os outputs?

3. **VOC (Voice of Customer)** — Capturar o que o cliente espera:
   - Entrevistas, pesquisas, analise de reclamacoes.
   - Traduzir VOC em CTQs (Critical to Quality): metricas concretas.
   - Ex: VOC "quero rapido" → CTQ "tempo de resposta < 2 horas".

### 2.2 Measure (Medir)

**Objetivo:** Estabelecer baseline quantitativo do desempenho atual.

**Passos:**
1. Definir as metricas-chave (KPIs) derivadas dos CTQs.
2. Criar plano de coleta de dados: o que medir, como, por quanto tempo, quem coleta.
3. Coletar dados (minimo 30 pontos para significancia estatistica).
4. Calcular:
   - **Media e desvio padrao** do processo.
   - **Process Capability (Cp/Cpk):** O processo cabe dentro dos limites de especificacao?
   - **Taxa de defeitos** (DPMO — Defeitos Por Milhao de Oportunidades).
5. Documentar o baseline: "Hoje o processo opera em X sigma, com Y% de defeitos."

**Ferramenta pratica — Operational Definition:**
Para cada metrica, definir sem ambiguidade:
- O que conta como "defeito"?
- Quando comecar/parar a medir o tempo?
- Quem registra? Em qual sistema?

### 2.3 Analyze (Analisar)

**Objetivo:** Encontrar as causas raiz do problema.

**Ferramenta 1 — 5 Porques:**
1. Descrever o problema.
2. Perguntar "Por que?" e registrar a resposta.
3. Repetir ate chegar na causa raiz (geralmente 3-7 niveis).
4. Validar: "Se corrigirmos esta causa, o problema desaparece?"

Exemplo:
- Problema: Deploy falhou. Por que?
- Teste nao cobria o caso de borda. Por que?
- Nao havia requirement para esse cenario. Por que?
- Review de requirements nao inclui checklist de edge cases. Por que?
- Nao existe checklist padronizado. ← Causa raiz.

**Ferramenta 2 — Diagrama de Ishikawa (Fishbone):**
Categorias classicas (6M): Mao de obra, Metodo, Maquina, Material, Medida, Meio ambiente.
1. Colocar o problema na "cabeca do peixe".
2. Para cada categoria, listar possiveis causas.
3. Para cada causa, aplicar 5 Porques.
4. Priorizar as causas com maior evidencia nos dados.

**Ferramenta 3 — Analise de Pareto:**
1. Listar todas as causas identificadas.
2. Quantificar a frequencia ou impacto de cada uma.
3. Ordenar de maior para menor.
4. As top 20% das causas geralmente explicam 80% do problema.

### 2.4 Improve (Melhorar)

**Objetivo:** Implementar solucoes que ataquem as causas raiz.

**Passos:**
1. Brainstorm de solucoes (quantidade > qualidade nesta fase).
2. Filtrar com matriz Impacto vs. Esforco (2x2).
3. Selecionar 1-3 solucoes para piloto.
4. Planejar piloto: escopo reduzido, metricas de sucesso, duracao, criterios go/no-go.
5. Executar piloto e coletar dados.
6. Comparar resultados do piloto vs. baseline.
7. Se aprovado: planejar rollout completo com change management.

### 2.5 Control (Controlar)

**Objetivo:** Garantir que a melhoria se sustente ao longo do tempo.

**Ferramentas:**
1. **Control Charts (Graficos de Controle):**
   - Plotar metrica-chave ao longo do tempo.
   - Definir UCL (limite superior) e LCL (limite inferior).
   - Investigar qualquer ponto fora dos limites.

2. **SOPs (Standard Operating Procedures):**
   - Documentar o novo processo passo a passo.
   - Incluir: quem, o que, quando, como, excecoes.
   - Treinar todos os envolvidos.

3. **Response Plan:**
   - Se metrica sair do controle: quem e notificado? Qual a acao imediata?
   - Definir triggers e escalation paths.

4. **Auditorias periodicas:** Verificar aderencia ao SOP a cada 30/60/90 dias.

---

## 3. Theory of Constraints (TOC)

### 3.1 Os 5 Passos de Focalizacao

**Passo 1 — Identificar o Constraint:**
- O constraint (gargalo) e o recurso que limita o throughput do sistema inteiro.
- Como encontrar: o ponto com maior fila antes dele, ou o recurso com maior utilizacao.
- Metodo pratico: mapear cada etapa com capacidade e demanda. Onde demanda > capacidade = constraint.

**Passo 2 — Explorar o Constraint:**
- Extrair o maximo do gargalo SEM investir mais recursos.
- Acoes: eliminar tempo ocioso no gargalo, remover tarefas nao-criticas do gargalo, garantir que nunca fique parado.
- Exemplo: se o gargalo e code review, garantir que o reviewer so faca review (nao reunioes, nao admin).

**Passo 3 — Subordinar tudo ao Constraint:**
- Todo o restante do sistema opera no ritmo do gargalo.
- Nao adianta produzir mais rapido antes do gargalo: so gera inventario.
- Ajustar capacidade das outras etapas para alimentar o gargalo de forma constante.

**Passo 4 — Elevar o Constraint:**
- Agora sim, investir para aumentar capacidade do gargalo.
- Adicionar recursos, ferramentas, pessoas ou automacao ao gargalo.
- Exemplo: contratar segundo reviewer, automatizar testes para liberar o reviewer.

**Passo 5 — Repetir (nao deixar a inercia virar constraint):**
- Ao elevar um gargalo, outro recurso se torna o novo constraint.
- Voltar ao passo 1. O sistema sempre tem exatamente UM constraint.

### 3.2 Drum-Buffer-Rope (DBR)

- **Drum (Tambor):** O constraint dita o ritmo de todo o sistema. Sua capacidade e o "batimento" da producao.
- **Buffer (Pulmao):** Manter um estoque de trabalho pronto ANTES do constraint para que ele nunca fique ocioso. Tamanho do buffer = variabilidade do sistema.
- **Rope (Corda):** Mecanismo de sinalizacao que controla a liberacao de novo trabalho no inicio do processo, sincronizado com o ritmo do constraint.

**Aplicacao pratica:**
1. Identificar o constraint (ex: QA team com capacidade de 5 reviews/dia).
2. Definir buffer: manter sempre 2-3 itens prontos para QA (nunca zero, nunca 10).
3. Definir rope: devs so puxam novo trabalho quando um item sai do buffer de QA.

### 3.3 Throughput Accounting

Tres metricas fundamentais (em vez de custo por unidade):

| Metrica | Definicao | Foco |
|---------|-----------|------|
| **Throughput (T)** | Receita - Custos totalmente variaveis | Dinheiro que entra |
| **Investment (I)** | Dinheiro preso no sistema (estoque, equipamento) | Dinheiro parado |
| **Operating Expense (OE)** | Custo para operar o sistema | Dinheiro que sai |

**Regra de decisao:** Priorizar acoes que aumentam T, depois as que reduzem I, depois as que reduzem OE.

### 3.4 Como Encontrar o Constraint em Qualquer Processo

**Metodo rapido (5 minutos):**
1. Listar todas as etapas do processo.
2. Para cada etapa, anotar: capacidade (itens/tempo) e demanda atual.
3. O constraint e onde: demanda >= capacidade, OU onde a fila e maior.

**Metodo detalhado (dados):**
1. Medir utilizacao de cada recurso por 1 semana.
2. Recurso com utilizacao > 85% = provavel constraint.
3. Confirmar: reduzir carga nesse recurso melhora o throughput total?

---

## 4. Value Stream Mapping (VSM)

### 4.1 Como Criar um VSM Passo a Passo

**Preparacao:**
1. Definir escopo: produto/servico especifico, do inicio ao fim.
2. Reunir o time que executa o processo (nao gerentes — executores).
3. Material: parede grande, post-its, ou ferramenta digital (Miro, Lucidchart).

**Execucao:**
1. **Mapear o fluxo do cliente:** Comecar pela demanda (pedido do cliente) e terminar na entrega.
2. **Adicionar etapas do processo:** Cada etapa e uma caixa com:
   - Nome da etapa
   - Tempo de processamento (PT — Processing Time)
   - Tempo de espera antes da etapa (WT — Waiting Time)
   - Numero de pessoas envolvidas
   - Taxa de defeitos/retrabalho
3. **Adicionar fluxo de informacao:** Como cada etapa sabe o que fazer? Manual, sistema, email?
4. **Calcular timeline:**
   - Linha inferior: Lead Time total = soma de todos os PT + WT.
   - Separar: tempo que agrega valor (PT) vs. tempo que nao agrega (WT).
5. **Calcular PCE (Process Cycle Efficiency):** PCE = PT total / Lead Time total.
   - Benchmark: < 10% e normal para processos nao otimizados. Meta: > 25%.

### 4.2 Simbolos Essenciais do VSM

| Simbolo | Significado |
|---------|-------------|
| Retangulo | Etapa do processo |
| Triangulo | Inventario/fila entre etapas |
| Seta solida | Fluxo de material/trabalho |
| Seta tracejada | Fluxo de informacao |
| Raio/zigzag | Fluxo eletronico (sistema) |
| Caixa de dados | Metricas da etapa (PT, WT, %defeito) |
| Explosao (starburst) | Oportunidade de melhoria (kaizen burst) |

### 4.3 Estado Atual vs. Estado Futuro

**Mapa do Estado Atual (AS-IS):**
- Mapear EXATAMENTE como o processo funciona hoje. Sem idealizacao.
- Incluir todas as esperas, retrabalhos, gambiarra e excecoes.
- Validar com os executores: "E assim mesmo que acontece?"

**Mapa do Estado Futuro (TO-BE):**
1. Para cada espera: pode ser eliminada ou reduzida?
2. Para cada etapa sem valor: pode ser removida?
3. Onde implementar fluxo continuo (sem fila entre etapas)?
4. Onde implementar sistema pull (producao puxada pela demanda)?
5. Onde o constraint pode ser elevado?
6. Marcar kaizen bursts nos pontos de melhoria.

**Gap Analysis:** Comparar Lead Time atual vs. futuro. Calcular a melhoria potencial em tempo, custo e qualidade.

### 4.4 Lead Time vs. Processing Time

- **Processing Time (PT):** Tempo que alguem esta ATIVAMENTE trabalhando no item.
- **Lead Time (LT):** Tempo total desde o pedido ate a entrega (inclui todas as esperas).
- **Regra geral:** LT = PT + filas + esperas + transporte + retrabalho.
- **Insight critico:** Na maioria dos processos, PT e < 5% do LT. Os outros 95% sao desperdicio.

---

## 5. BPM Lifecycle (Ciclo de Vida de Processos)

### 5.1 Identificacao de Processos

**Objetivo:** Catalogar os processos da organizacao e priorizar quais melhorar.

**Passos:**
1. Listar todos os processos (brainstorm com lideres e executores).
2. Classificar por tipo: core (gera receita), suporte (habilita o core), gestao (governa).
3. Avaliar cada processo em 3 dimensoes:
   - **Importancia estrategica** (1-5): Quao critico para os objetivos?
   - **Saude atual** (1-5): Quao bem funciona hoje?
   - **Viabilidade de melhoria** (1-5): Quao facil e melhorar?
4. Priorizar: alta importancia + baixa saude + alta viabilidade = primeiro da fila.

### 5.2 Descoberta de Processos (AS-IS)

**Objetivo:** Entender como o processo realmente funciona (nao como deveria).

**Tecnicas:**
1. **Observacao direta:** Acompanhar o processo acontecendo em tempo real.
2. **Entrevistas:** Conversar com executores individualmente (evitar grupo para nao ter vies).
3. **Analise de logs:** Extrair dados de sistemas (process mining) para mapear o fluxo real.
4. **Workshop de mapeamento:** Reunir executores e mapear juntos (validacao coletiva).

**Output:** Modelo AS-IS documentado com metricas (tempo, custo, taxa de erro por etapa).

### 5.3 Analise de Processos

**Objetivo:** Diagnosticar problemas e quantificar oportunidades.

**Tecnicas de analise:**
1. **Analise de valor:** Classificar cada atividade como VA (valor agregado), BVA (necessaria mas sem valor), NVA (desperdicio puro).
2. **Analise de causa raiz:** Aplicar 5 Porques e Ishikawa nos problemas identificados.
3. **Analise quantitativa:** Cycle time, waiting time, rework rate, throughput, custo por transacao.
4. **Analise qualitativa:** Pontos de dor dos executores, riscos, dependencias criticas.

### 5.4 Redesenho de Processos (TO-BE)

**Objetivo:** Projetar o processo melhorado.

**Heuristicas de redesenho (Dumas et al.):**
1. **Eliminacao de tarefas:** Remover atividades NVA.
2. **Composicao de tarefas:** Juntar atividades adjacentes feitas pela mesma pessoa.
3. **Automacao:** Automatizar atividades repetitivas e baseadas em regras.
4. **Paralelismo:** Executar atividades independentes simultaneamente.
5. **Resequenciamento:** Mover verificacoes para o inicio (fail fast).
6. **Especializacao/Generalizacao:** Dividir ou unificar responsabilidades conforme volume.
7. **Empowerment:** Dar autonomia para decisoes de baixo risco.

**Output:** Modelo TO-BE com metricas projetadas e gap analysis vs. AS-IS.

### 5.5 Implementacao de Processos

**Objetivo:** Colocar o TO-BE em operacao.

**Passos:**
1. Planejar change management: comunicacao, treinamento, timeline.
2. Implementar em fases (piloto → rollout parcial → rollout total).
3. Configurar sistemas e ferramentas necessarios.
4. Treinar executores no novo processo.
5. Executar piloto com metricas de acompanhamento.
6. Go/no-go: decidir rollout baseado nos dados do piloto.
7. Rollout com suporte intensivo nas primeiras semanas.

### 5.6 Monitoramento e Controle

**Objetivo:** Garantir que o processo opere dentro dos parametros projetados.

**Componentes:**
1. **Dashboard de processo:** Metricas-chave visiveis em tempo real.
2. **KPIs obrigatorios:** Cycle time, throughput, taxa de defeito, custo por transacao, satisfacao.
3. **Alertas automaticos:** Quando KPI sai do limite, notificar responsavel.
4. **Revisao periodica:** Mensal para processos criticos, trimestral para suporte.
5. **Trigger de novo ciclo:** Se KPI degrada > 15% do target, iniciar novo ciclo de melhoria.

---

## 6. Rummler-Brache Performance Framework

### 6.1 Os 3 Niveis de Performance

| Nivel | Foco | Perguntas-Chave |
|-------|------|-----------------|
| **Organizacao** | Estrategia, estrutura, relacao com mercado | A estrategia esta clara? A estrutura suporta os processos criticos? |
| **Processo** | Fluxos de trabalho cross-funcional | Os processos sao eficientes? As interfaces entre departamentos funcionam? |
| **Job/Executor** | Pessoas e papeis individuais | As pessoas tem habilidade, recursos e motivacao para executar? |

### 6.2 As 3 Dimensoes de Performance

| Dimensao | Descricao | Perguntas |
|----------|-----------|-----------|
| **Goals (Objetivos)** | O que se espera em cada nivel | Os objetivos estao definidos? Sao mensuráveis? Estao alinhados entre niveis? |
| **Design (Desenho)** | Como o sistema esta estruturado | A estrutura/processo/cargo esta desenhado para atingir os objetivos? |
| **Management (Gestao)** | Como o desempenho e gerido | Ha medicao? Feedback? Consequencias? Recursos adequados? |

### 6.3 A Matriz 9-Celulas

Cruzar os 3 niveis com as 3 dimensoes gera 9 celulas de diagnostico:

|  | Goals | Design | Management |
|--|-------|--------|------------|
| **Organizacao** | Estrategia e objetivos do negocio claros e mensuráveis? | Estrutura organizacional suporta a estrategia? Silos? | Metricas de negocio monitoradas? Recursos alocados? |
| **Processo** | Objetivos do processo derivados da estrategia? | Fluxo e logico? Interfaces claras? Sem gaps? | Dono do processo definido? Metricas acompanhadas? |
| **Job/Executor** | Cada pessoa sabe o que se espera dela? | Cargo desenhado para que a pessoa consiga executar? | Feedback, coaching, incentivos alinhados? |

### 6.4 Como Usar a Matriz para Diagnostico

**Protocolo de Triagem (30-60 min):**

1. **Selecionar o problema de performance** a investigar.
2. **Percorrer cada celula** da matriz e pontuar de 1 (critico) a 5 (saudavel).
3. **Identificar as celulas com pontuacao mais baixa** — essas sao as alavancas de melhoria.
4. **Regra de ouro:** Resolver de cima para baixo e da esquerda para a direita.
   - Nao adianta melhorar o design do cargo (Job/Design) se os objetivos do processo nao estao claros (Process/Goals).
   - Nao adianta melhorar a gestao do processo (Process/Management) se o desenho esta fundamentalmente errado (Process/Design).

**Exemplo pratico:**
- Problema: Time de suporte com alta rotatividade e baixa satisfacao do cliente.
- Diagnostico pela matriz:
  - Org/Goals: OK (meta de satisfacao definida)
  - Org/Design: Problema — suporte reporta a TI, nao a Customer Success
  - Process/Goals: Problema — SLA definido mas nao derivado da meta de satisfacao
  - Process/Design: Problema — escalation path confuso, 3 sistemas diferentes
  - Job/Goals: Problema — atendente medido por tickets fechados, nao por resolucao
  - Job/Design: OK (capacitacao adequada)
  - Job/Management: Problema — sem feedback regular, sem coaching
- Prioridade: Org/Design (resolver reporte) → Process/Design (simplificar) → Job/Goals (mudar metrica) → Job/Management (feedback)

### 6.5 Integracao com Outros Frameworks

| Situacao | Rummler-Brache + |
|----------|-----------------|
| Diagnostico inicial | Rummler-Brache identifica ONDE esta o problema (qual celula) |
| Causa raiz | Six Sigma (DMAIC Analyze) investiga POR QUE naquela celula |
| Gargalo encontrado | TOC focaliza a melhoria no constraint |
| Redesenho necessario | VSM mapeia o fluxo e BPM Lifecycle estrutura a implementacao |
| Desperdicios identificados | Lean elimina com TIMWOODS + 5S |

---

## Referencia Rapida: Quando Usar Cada Framework

| Situacao | Framework Primario | Complemento |
|----------|-------------------|-------------|
| "Nao sei onde esta o problema" | Rummler-Brache (9-celulas) | VSM para mapear |
| "Processo tem muito desperdicio" | Lean (TIMWOODS + 5S) | VSM para visualizar |
| "Muitos defeitos / baixa qualidade" | Six Sigma (DMAIC) | Lean para eliminar causas |
| "Processo lento, gargalo evidente" | TOC (5 Passos) | Lean para otimizar o constraint |
| "Preciso redesenhar o processo todo" | BPM Lifecycle | VSM + Lean + Rummler-Brache |
| "Melhoria continua do dia a dia" | Kaizen (PDCA) | Lean (TIMWOODS) para direcionar |

---

*Base de conhecimento operacional do Squad Process Excellence.*
*Versao 1.0 — Referencia viva, atualizada conforme aprendizados de execucao.*
