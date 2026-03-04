# Catalogo de Automacoes

> Base de conhecimento pratica para selecao e implementacao de ferramentas de automacao.
> Atualizado: Marco 2026

---

## 1. Plataformas de Integracao (iPaaS)

Plataformas que conectam sistemas diferentes sem necessidade de codigo complexo.

### n8n

- **Descricao:** Plataforma open-source de automacao de workflows, self-hosted ou cloud.
- **Pricing:** Community (gratis, self-hosted) | Cloud a partir de EUR 20/mes
- **Melhor para:** Times tecnicos que querem controle total, dados sensiveis que nao podem sair do servidor, cenarios complexos com logica customizada.
- **Limitacoes:** Requer infraestrutura propria no plano self-hosted; curva de aprendizado maior que Zapier; comunidade menor que concorrentes comerciais.
- **Casos de uso:**
  - Sincronizar leads do CRM com planilha interna a cada 15 minutos
  - Pipeline de processamento de emails com classificacao via LLM
  - Webhook que recebe dados de formulario, valida, enriquece e insere no banco

### Zapier

- **Descricao:** Lider de mercado em integracao no-code. Conecta 6.000+ apps.
- **Pricing:** Free (100 tasks/mes) | Starter $19.99/mes | Professional $49/mes | Team $69/mes
- **Melhor para:** Automacoes simples entre SaaS populares, usuarios nao-tecnicos, prototipagem rapida.
- **Limitacoes:** Custo escala rapido com volume; logica condicional limitada no plano basico; sem self-hosting; dados passam pelos servidores Zapier.
- **Casos de uso:**
  - Novo lead no Typeform -> cria contato no HubSpot -> notifica no Slack
  - Anexo recebido por email -> salva no Google Drive -> notifica equipe
  - Nova linha no Google Sheets -> cria tarefa no Asana

### Make (ex-Integromat)

- **Descricao:** Plataforma visual de automacao com editor grafico poderoso. Mais flexivel que Zapier para cenarios complexos.
- **Pricing:** Free (1.000 ops/mes) | Core $9/mes | Pro $16/mes | Teams $29/mes
- **Melhor para:** Automacoes com ramificacoes complexas, transformacao de dados, cenarios com multiplas condicoes.
- **Limitacoes:** Interface pode ser confusa para iniciantes; debugging menos intuitivo; menos integracoes nativas que Zapier.
- **Casos de uso:**
  - Processar CSV recebido por email: validar, transformar, inserir no banco, gerar relatorio
  - Orquestrar pipeline de aprovacao com multiplas etapas e condicoes
  - Monitorar RSS feeds e publicar resumos automaticos em canais diferentes

### Power Automate (Microsoft)

- **Descricao:** Plataforma de automacao da Microsoft, integrada nativamente ao ecossistema Office 365/Azure.
- **Pricing:** Incluido em licencas Microsoft 365 (basico) | Per-user $15/mes | Per-flow $500/mes
- **Melhor para:** Empresas que ja usam Microsoft 365; automacoes envolvendo SharePoint, Teams, Outlook, Excel Online.
- **Limitacoes:** Melhor dentro do ecossistema Microsoft; conectores externos mais limitados; interface pode ser lenta; versionamento precario.
- **Casos de uso:**
  - Aprovacao de documentos via Teams com assinatura digital
  - Extrair dados de emails do Outlook e popular planilha SharePoint
  - Notificar gestores quando arquivo e modificado no SharePoint

### IFTTT

- **Descricao:** Plataforma de automacao simplificada, focada em conexoes 1:1 (se isso, entao aquilo).
- **Pricing:** Free (2 applets) | Pro $2.99/mes | Pro+ $14.99/mes
- **Melhor para:** Automacoes pessoais simples, IoT, smart home, cenarios com trigger unico.
- **Limitacoes:** Sem logica condicional complexa; sem ramificacao; delay de ate 15 min no plano free; poucos conectores empresariais.
- **Casos de uso:**
  - Salvar posts favoritados do Twitter em planilha
  - Notificacao quando sensor IoT detecta anomalia
  - Backup automatico de fotos do celular para cloud

### Comparativo Rapido iPaaS

| Criterio | n8n | Zapier | Make | Power Automate | IFTTT |
|---|---|---|---|---|---|
| Complexidade | Alta | Baixa | Media | Media | Muito Baixa |
| Custo em escala | Baixo | Alto | Medio | Medio | Baixo |
| Integracoes | 400+ | 6.000+ | 1.500+ | 1.000+ | 800+ |
| Self-hosting | Sim | Nao | Nao | Nao (on-prem limitado) | Nao |
| Curva de aprendizado | Moderada | Facil | Moderada | Moderada | Muito facil |

---

## 2. RPA (Robotic Process Automation)

Robos que simulam acoes humanas em interfaces graficas. Ideal para sistemas legados sem API.

### UiPath

- **Descricao:** Lider de mercado em RPA enterprise. Plataforma completa com orquestracao, AI, document understanding.
- **Pricing:** Free (Community) | Pro $420/mes | Enterprise sob consulta
- **Melhor para:** Automacao em larga escala em ambientes corporativos, processos complexos com multiplos sistemas, document processing com AI.
- **Limitacoes:** Custo alto para empresas; requer infraestrutura dedicada em escala; curva de aprendizado significativa.
- **Casos de uso:**
  - Extrair dados de sistema SAP legado e inserir em ERP novo
  - Processar faturas recebidas por email: extrair dados com OCR, validar, lancar no sistema financeiro
  - Reconciliacao bancaria automatizada entre extratos e sistema contabil

### Automation Anywhere

- **Descricao:** Plataforma cloud-native de RPA com foco em AI e automacao inteligente.
- **Pricing:** Free (Community) | Business sob consulta (tipicamente $750+/bot/mes)
- **Melhor para:** Empresas que preferem cloud-first, automacoes com componente de AI integrado.
- **Limitacoes:** Preco elevado; menos flexivel que UiPath para cenarios customizados; migracao entre versoes pode ser problematica.
- **Casos de uso:**
  - Atendimento ao cliente: coletar dados do chat, consultar sistemas internos, gerar resposta
  - Onboarding de funcionarios: criar contas em 10+ sistemas diferentes
  - Geracao automatica de relatorios consolidados de multiplas fontes

### Power Automate Desktop

- **Descricao:** Ferramenta RPA gratuita da Microsoft, integrada ao Power Automate cloud.
- **Pricing:** Gratis com Windows 10/11 | Recursos premium requerem licenca Power Automate
- **Melhor para:** Automacoes desktop simples a moderadas, especialmente em ambiente Windows/Microsoft.
- **Limitacoes:** Apenas Windows; orquestracao limitada sem licenca premium; menos robusto que UiPath/AA para cenarios complexos; sem gravacao web avancada.
- **Casos de uso:**
  - Preencher formularios repetitivos em sistemas internos sem API
  - Extrair dados de aplicacoes desktop legadas e exportar para Excel
  - Automatizar rotinas de backup e organizacao de arquivos

### Quando Usar RPA vs iPaaS

| Cenario | Escolha | Motivo |
|---|---|---|
| Sistemas com API disponivel | iPaaS | Mais estavel, mais rapido, menor manutencao |
| Sistema legado sem API | RPA | Unica opcao viavel sem modificar o sistema |
| Interface web moderna | iPaaS ou Scripting | APIs REST geralmente disponiveis |
| Aplicacao desktop Windows | RPA | Manipulacao de UI necessaria |
| Alto volume de transacoes | iPaaS | RPA e mais lento por simular cliques |
| Processo envolve decisao visual | RPA com AI | Document understanding, screen recognition |
| Integracao entre SaaS | iPaaS | Conectores nativos, mais confiavel |

**Regra geral:** Sempre prefira API/iPaaS. Use RPA apenas quando nao ha alternativa.

---

## 3. Scripting & Code

Automacao por codigo para cenarios que exigem flexibilidade total.

### Python

Linguagem mais popular para automacao devido ao ecossistema de bibliotecas.

**Bibliotecas essenciais:**
- `requests` / `httpx` - Chamadas HTTP e consumo de APIs
- `selenium` / `playwright` - Automacao de browser (web scraping, testes)
- `beautifulsoup4` / `lxml` - Parsing de HTML/XML
- `pandas` - Manipulacao e transformacao de dados
- `schedule` / `APScheduler` - Agendamento de tarefas
- `openpyxl` / `xlsxwriter` - Manipulacao de Excel
- `python-docx` - Geracao de documentos Word
- `pdfplumber` / `PyPDF2` - Extracao de dados de PDFs

**Melhor para:** Data pipelines, web scraping avancado, integracao com APIs, processamento de arquivos em lote.

### Node.js

Forte em automacoes web e integracao com servicos modernos.

**Bibliotecas essenciais:**
- `puppeteer` / `playwright` - Automacao de browser headless
- `cheerio` - Parsing de HTML leve (sem browser)
- `node-cron` - Agendamento de tarefas
- `axios` / `node-fetch` - Chamadas HTTP
- `exceljs` - Manipulacao de Excel
- `nodemailer` - Envio de emails

**Melhor para:** Automacoes web, bots, webhooks, integracao com servicos real-time.

### Bash / PowerShell

**Bash (Linux/Mac):**
- Automacao de sistema operacional, DevOps, pipelines CI/CD
- Manipulacao de arquivos, logs, backups
- Excelente com `cron` para agendamento

**PowerShell (Windows):**
- Administracao de sistemas Windows e Active Directory
- Automacao de Office 365 e Azure
- Manipulacao de registros, servicos, processos do Windows

### Google Apps Script

- **Descricao:** JavaScript integrado ao Google Workspace (Sheets, Docs, Drive, Gmail).
- **Melhor para:** Automacoes dentro do ecossistema Google; triggers baseados em eventos de planilha/formulario.
- **Casos de uso:**
  - Enviar email automatico quando status muda na planilha
  - Gerar documentos a partir de template + dados da planilha
  - Criar dashboard automatizado que puxa dados de multiplas sheets

### Quando Usar Codigo vs No-Code

| Cenario | Escolha | Motivo |
|---|---|---|
| Integracao simples entre 2 SaaS | No-code (iPaaS) | Mais rapido de implementar e manter |
| Transformacao complexa de dados | Codigo (Python/pandas) | Flexibilidade de manipulacao |
| Web scraping avancado | Codigo (Playwright/Puppeteer) | Controle total sobre navegacao |
| Processamento de arquivos em lote | Codigo (Python) | Loops, condicoes, tratamento de erro |
| Prototipo rapido de integracao | No-code | Validar ideia antes de investir |
| Equipe sem desenvolvedores | No-code | Autonomia da equipe de negocios |
| Requisitos mudam frequentemente | No-code | Ajuste visual mais rapido |
| Performance critica | Codigo | Otimizacao de recursos |
| Logica de negocios complexa | Codigo | Testes unitarios, versionamento |

---

## 4. AI/LLM Automation

Automacao inteligente usando modelos de linguagem.

### Claude API / Anthropic SDK

- **Descricao:** API do Claude (Anthropic) para integracao de AI em workflows.
- **Pricing:** Claude Sonnet ~$3/$15 por milhao de tokens (input/output) | Claude Opus sob consulta
- **Pontos fortes:** Janela de contexto grande (200K tokens), forte em raciocinio, analise de documentos, seguir instrucoes complexas.
- **SDKs:** Python (`anthropic`), TypeScript (`@anthropic-ai/sdk`)

### OpenAI API

- **Descricao:** API do GPT-4o e familia de modelos OpenAI.
- **Pricing:** GPT-4o ~$2.50/$10 por milhao de tokens | GPT-4o-mini ~$0.15/$0.60
- **Pontos fortes:** Ecossistema maduro, function calling robusto, vision, DALL-E para imagens.
- **SDKs:** Python (`openai`), Node.js (`openai`)

### Casos de Uso para AI em Automacao

| Caso de Uso | Descricao | Modelo Recomendado |
|---|---|---|
| Classificacao de documentos | Categorizar emails, tickets, contratos por tipo/urgencia | Claude Sonnet ou GPT-4o-mini |
| Extracao de dados | Extrair campos de PDFs, faturas, curriculos | Claude Sonnet (contexto longo) |
| Sumarizacao | Resumir reunioes, relatorios, threads de email | GPT-4o-mini (custo-beneficio) |
| Geracao de textos | Emails, relatorios, documentacao | Claude Sonnet ou GPT-4o |
| Suporte a decisao | Analisar opcoes, recomendar acoes com justificativa | Claude Opus (raciocinio complexo) |
| Traducao especializada | Documentos tecnicos, juridicos, medicos | GPT-4o ou Claude Sonnet |

### Quando AI Agrega Valor vs Exagero

**AI agrega valor quando:**
- Input e texto nao-estruturado (linguagem natural, documentos)
- Tarefa requer "julgamento" ou interpretacao
- Regras sao dificeis de codificar explicitamente
- Volume justifica o investimento em prompt engineering

**AI e exagero quando:**
- Regras sao claras e deterministas (use `if/else`)
- Dados ja estao estruturados (use SQL/pandas)
- Precisao de 100% e necessaria (AI e probabilistica)
- Custo por chamada de API nao justifica o ganho
- Latencia e critica (APIs de LLM tem latencia de 1-10s)

**Regra pratica:** Se voce consegue escrever as regras em um fluxograma simples, nao precisa de AI.

---

## 5. Scheduling & Orquestracao

Ferramentas para agendar e orquestrar execucao de automacoes.

### Cron (Linux/Mac)

- **Descricao:** Agendador nativo de sistemas Unix. Simples e confiavel.
- **Melhor para:** Scripts simples em servidores Linux, tarefas periodicas sem dependencias.
- **Sintaxe:** `*/15 * * * * python3 /scripts/sync.py` (a cada 15 minutos)
- **Limitacoes:** Sem retry, sem monitoramento nativo, sem dependencias entre jobs.

### Task Scheduler (Windows)

- **Descricao:** Agendador nativo do Windows. Interface grafica + linha de comando.
- **Melhor para:** Scripts PowerShell/Python em maquinas Windows, automacoes desktop.
- **Limitacoes:** Interface confusa para cenarios complexos; logs limitados; sem orquestracao.

### Apache Airflow

- **Descricao:** Plataforma de orquestracao de workflows em Python. Padrao da industria para data engineering.
- **Pricing:** Open source (self-hosted) | Managed: Astronomer, Google Cloud Composer, Amazon MWAA
- **Melhor para:** Pipelines de dados complexos com dependencias, ETL, workflows que requerem retry e monitoramento.
- **Limitacoes:** Overhead significativo para tarefas simples; requer infraestrutura; curva de aprendizado alta.
- **Casos de uso:**
  - Pipeline ETL: extrair de 5 fontes -> transformar -> carregar no data warehouse
  - Geracao diaria de relatorios com dependencias entre etapas
  - Orquestracao de treinamento de modelos ML

### Temporal

- **Descricao:** Plataforma de orquestracao de workflows duravelmente executados. Forte em workflows de longa duracao.
- **Pricing:** Open source (self-hosted) | Temporal Cloud a partir de $200/mes
- **Melhor para:** Workflows que duram horas/dias, processos com muitos estados e retries, microservicos.
- **Limitacoes:** Complexidade de setup; requer desenvolvedores experientes; overhead para tarefas simples.

### Quando Usar Cada

| Necessidade | Ferramenta | Motivo |
|---|---|---|
| Script simples a cada hora | Cron / Task Scheduler | Sem overhead, nativo do SO |
| Pipeline de dados com etapas | Airflow | Dependencias, retry, monitoramento |
| Workflow de longa duracao (dias) | Temporal | Durabilidade, estado persistente |
| Automacao no-code agendada | Make / n8n | Agendamento integrado na plataforma |
| Jobs em cloud | Cloud Functions + Cloud Scheduler | Serverless, sem infraestrutura |

---

## 6. Formularios & Data Collection

Ferramentas para coleta estruturada de dados.

### Google Forms + Sheets

- **Pricing:** Gratis (com conta Google) | Workspace a partir de $6/usuario/mes
- **Melhor para:** Coleta rapida de dados, pesquisas internas, formularios simples.
- **Integracao:** Respostas vao direto para Google Sheets; integra com Apps Script, Zapier, Make.
- **Limitacoes:** Design limitado; sem logica condicional avancada; sem pagamentos.

### Typeform

- **Pricing:** Free (10 respostas/mes) | Basic $25/mes | Plus $50/mes | Business $83/mes
- **Melhor para:** Formularios com experiencia premium, pesquisas de satisfacao, quizzes, lead capture.
- **Diferenciais:** Uma pergunta por vez; design bonito; logica condicional avancada.
- **Limitacoes:** Custo alto por resposta em escala; analytics limitado no plano free.

### Tally

- **Pricing:** Gratis (ilimitado para a maioria dos recursos) | Pro $29/mes
- **Melhor para:** Alternativa gratuita ao Typeform com boa experiencia de usuario.
- **Diferenciais:** Respostas ilimitadas no free; editor tipo Notion; integracao com webhooks.
- **Limitacoes:** Menos integracoes nativas que Typeform; marca d'agua no free.

### Airtable

- **Pricing:** Free (1.000 registros) | Team $20/usuario/mes | Business $45/usuario/mes
- **Melhor para:** Base de dados relacional com interface amigavel, gestao de projetos, CRM leve.
- **Diferenciais:** Views multiplas (grid, kanban, calendario, gallery); automacoes integradas; API nativa.
- **Limitacoes:** Custo escala com registros e usuarios; performance degrada com muitos dados; lock-in.

---

## 7. Comunicacao & Notificacoes

Ferramentas para notificacoes automatizadas e comunicacao programatica.

### Slack Webhooks & Bots

- **Incoming Webhooks:** Enviar mensagens para canais via HTTP POST. Zero codigo necessario.
- **Slack Bots (Bolt SDK):** Bots interativos com comandos, botoes, modais.
- **Melhor para:** Notificacoes de CI/CD, alertas de monitoramento, aprovacoes, comandos de operacao.
- **Exemplo:** Alerta de deploy falho -> canal #ops com botao "Rollback".

### Telegram Bots

- **Pricing:** Gratis
- **Melhor para:** Notificacoes pessoais, alertas de monitoramento, bots conversacionais simples.
- **Biblioteca:** `python-telegram-bot`, `node-telegram-bot-api`
- **Exemplo:** Bot que envia alerta quando preco de produto cai abaixo do alvo.

### Email Automation

**SendGrid:**
- Pricing: Free (100 emails/dia) | Essentials $19.95/mes
- Melhor para: Emails transacionais em volume (confirmacoes, notificacoes, relatorios)

**Resend:**
- Pricing: Free (3.000 emails/mes) | Pro $20/mes
- Melhor para: Desenvolvedores que preferem DX moderno, React Email templates

**Amazon SES:**
- Pricing: $0.10 por 1.000 emails
- Melhor para: Volume muito alto com custo minimo

### WhatsApp Business API

- **Pricing:** Meta cobra por conversa (varia por pais, ~$0.05-0.15/conversa)
- **Providers:** Twilio, MessageBird, 360dialog, WATI
- **Melhor para:** Notificacoes para clientes, suporte automatizado, confirmacoes de agendamento.
- **Limitacoes:** Requer aprovacao de templates de mensagem; custo por conversa; regras rigorosas contra spam.
- **Exemplo:** Confirmacao de consulta medica 24h antes com opcao de reagendar.

---

## 8. Matriz de Decisao

Dado um tipo de necessidade, qual categoria de ferramenta utilizar.

### Por Tipo de Necessidade

| Necessidade | 1a Opcao | 2a Opcao | Esforco | Impacto |
|---|---|---|---|---|
| Integracao entre SaaS | iPaaS (Zapier/Make) | Scripting (Python/Node) | Baixo | Alto |
| Processamento de dados | Scripting (Python/pandas) | iPaaS (n8n) | Medio | Alto |
| Notificacao automatica | Webhooks (Slack/Telegram) | iPaaS | Baixo | Medio |
| Geracao de documentos | Scripting (Python/docx) | AI + Templates | Medio | Alto |
| Web scraping | Scripting (Playwright) | RPA (se for desktop) | Medio | Medio |
| Agendamento simples | Cron / Task Scheduler | iPaaS com scheduler | Baixo | Medio |
| Sistema legado sem API | RPA (UiPath/PA Desktop) | Scripting com Selenium | Alto | Alto |
| Classificacao de textos | AI/LLM (Claude/GPT) | Regras manuais | Medio | Alto |
| Coleta de dados | Formularios (Tally/Typeform) | Google Forms | Baixo | Medio |
| Workflow com aprovacoes | iPaaS (Power Automate) | Slack Bot customizado | Medio | Alto |

### Por Perfil da Equipe

| Perfil | Ferramentas Recomendadas |
|---|---|
| Sem desenvolvedores | Zapier, Make, IFTTT, Google Forms, Tally |
| 1 dev generalista | n8n, Python scripts, Google Apps Script |
| Time de engenharia | Airflow, Temporal, Python/Node, APIs diretas |
| Ecossistema Microsoft | Power Automate, Power Automate Desktop, Teams |
| Ecossistema Google | Google Apps Script, Google Forms, BigQuery |

### Esforco vs Impacto (Guia Visual)

```
IMPACTO
  Alto  |  iPaaS simples     |  Pipeline dados    |  RPA enterprise
        |  Webhooks          |  AI classification |  Temporal workflows
  ------|--------------------|--------------------|--------------------
  Medio |  Google Forms      |  Web scraping      |  Airflow setup
        |  IFTTT             |  Email automation  |  Custom bot
  ------|--------------------|--------------------|--------------------
  Baixo |  (evitar)          |  Cron jobs         |  (evitar)
        |                    |  Bash scripts      |
        +--------------------|--------------------|------------------->
           Baixo                Medio                Alto       ESFORCO
```

**Prioridade de implementacao:** Comece pelo quadrante superior-esquerdo (alto impacto, baixo esforco).

---

## 9. Criterios de Automacao

### Checklist: "Devo Automatizar Isso?"

Responda cada pergunta com Sim ou Nao:

| # | Pergunta | Peso |
|---|---|---|
| 1 | A tarefa e executada mais de 2x por semana? | Alto |
| 2 | Cada execucao leva mais de 15 minutos? | Alto |
| 3 | A tarefa segue passos repetitivos e previsveis? | Alto |
| 4 | Erros humanos ocorrem com frequencia nesta tarefa? | Medio |
| 5 | O resultado da tarefa e determinista (mesma entrada = mesma saida)? | Medio |
| 6 | Os sistemas envolvidos tem APIs ou interfaces automatizaveis? | Alto |
| 7 | A tarefa nao requer julgamento subjetivo complexo? | Medio |
| 8 | Mais de 1 pessoa executa esta tarefa? | Baixo |
| 9 | A tarefa e critica e atrasos causam impacto no negocio? | Medio |
| 10 | Existe documentacao ou processo claro da tarefa? | Baixo |

**Interpretacao:**
- 7+ "Sim" (com pelo menos 2 de peso Alto): **Automatize agora**
- 5-6 "Sim": **Avalie com a formula de ROI abaixo**
- Menos de 5 "Sim": **Provavelmente nao vale o investimento**

### Formula de ROI

```
ROI_anual = (tempo_por_execucao_min × frequencia_anual × custo_hora / 60) - custo_implementacao

Onde:
  tempo_por_execucao_min  = Minutos gastos por execucao manual
  frequencia_anual        = Quantas vezes por ano a tarefa e executada
  custo_hora              = Custo/hora do profissional que executa (salario + encargos)
  custo_implementacao     = Horas de desenvolvimento × custo/hora do desenvolvedor
```

**Exemplo pratico:**
```
Tarefa: Gerar relatorio semanal consolidando dados de 3 fontes
  tempo_por_execucao  = 45 min
  frequencia_anual    = 52 (semanal)
  custo_hora          = R$ 80 (analista)
  custo_implementacao = 16h × R$ 120 (dev) = R$ 1.920

ROI_anual = (45 × 52 × 80 / 60) - 1.920
ROI_anual = (2.340 × 80 / 60) - 1.920
ROI_anual = 3.120 - 1.920
ROI_anual = R$ 1.200 de economia no primeiro ano
```

### Calculo de Break-Even

```
Break-even (meses) = custo_implementacao / (economia_mensal)
economia_mensal     = tempo_por_execucao_min × frequencia_mensal × custo_hora / 60

Usando o exemplo acima:
  economia_mensal = 45 × 4.33 × 80 / 60 = R$ 260/mes
  Break-even      = 1.920 / 260 = 7.4 meses
```

### Nao Esquecer: Custos Ocultos

Alem do custo de implementacao, considere:

| Custo | Descricao | Estimativa |
|---|---|---|
| Manutencao | APIs mudam, sistemas atualizam, bugs aparecem | 10-20% do custo inicial por ano |
| Monitoramento | Alguem precisa verificar se a automacao esta rodando | 1-2h/mes |
| Infraestrutura | Servidor, cloud functions, licencas de ferramentas | Variavel |
| Documentacao | Documentar para que outros entendam e mantenham | 2-4h inicial |
| Treinamento | Treinar equipe para usar/manter a automacao | 2-4h inicial |

### Regra dos 5 Minutos

> Se a tarefa manual leva menos de 5 minutos e acontece menos de 1x por dia,
> provavelmente nao vale automatizar. O custo de manutencao supera a economia.

### Fluxo de Decisao Simplificado

```
Tarefa identificada
       |
       v
  Repetitiva e previsivel? --Nao--> Nao automatize
       |
      Sim
       |
       v
  Leva mais de 15min ou
  ocorre mais de 3x/semana? --Nao--> Avalie ROI primeiro
       |
      Sim
       |
       v
  Sistemas tem API? --Sim--> iPaaS ou Scripting
       |
      Nao
       |
       v
  Interface grafica? --Sim--> RPA
       |
      Nao
       |
       v
  Requer interpretacao
  de texto? --Sim--> AI/LLM + Scripting
       |
      Nao
       |
       v
  Fale com o time de processos
  para reavaliar a tarefa
```

---

## Referencias e Recursos

- [n8n Docs](https://docs.n8n.io/)
- [Zapier Learning Center](https://zapier.com/learn)
- [Make Academy](https://www.make.com/en/academy)
- [UiPath Academy](https://academy.uipath.com/)
- [Airflow Docs](https://airflow.apache.org/docs/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)

---

> **Nota:** Precos e recursos atualizados ate Marco 2026. Sempre consulte os sites oficiais para informacoes mais recentes.
