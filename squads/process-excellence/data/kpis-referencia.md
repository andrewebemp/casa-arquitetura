# Base de Referencia de KPIs por Tipo de Processo

> Guia pratico para selecao, definicao e acompanhamento de indicadores de performance.
> Cada KPI inclui: definicao, formula, fonte, frequencia e benchmarks de referencia.

---

## 1. KPIs de Atendimento ao Cliente

**Tempo Medio de Resposta (TMR)**
- **Formula:** `TMR = Soma(tempo_primeira_resposta) / total_tickets`
- **Fonte:** Helpdesk (Zendesk, Freshdesk, Intercom) | **Freq:** Diaria/Semanal
- **Benchmarks:** Email < 4h | Chat < 1min | Telefone < 30s | Redes sociais < 1h

**Tempo Medio de Resolucao (TMRes)**
- **Formula:** `TMRes = Soma(data_fechamento - data_abertura) / total_tickets_resolvidos`
- **Fonte:** Helpdesk | **Freq:** Semanal
- **Benchmarks:** L1 < 4h | L2 < 24h | L3 < 72h

**Net Promoter Score (NPS)**
- **Formula:** `NPS = %Promotores(9-10) - %Detratores(0-6)` (escala 0-10)
- **Fonte:** Pesquisa pos-atendimento | **Freq:** Mensal/Trimestral
- **Benchmarks:** < 0 critico | 0-30 razoavel | 30-50 bom | 50-70 excelente | > 70 classe mundial

**Customer Satisfaction Score (CSAT)**
- **Formula:** `CSAT = (respostas_positivas / total_respostas) x 100`
- **Fonte:** Pesquisa pos-interacao (escala 1-5) | **Freq:** Por interacao (agregado semanal)
- **Benchmarks:** < 70% critico | 70-80% aceitavel | 80-90% bom | > 90% excelente

**First Contact Resolution (FCR)**
- **Formula:** `FCR = (tickets_resolvidos_1o_contato / total_tickets) x 100`
- **Fonte:** Helpdesk (flag de reabertura) | **Freq:** Semanal
- **Benchmarks:** < 60% critico | 60-70% aceitavel | 70-80% bom | > 80% excelente

**Taxa de Escalacao**
- **Formula:** `Taxa_Escalacao = (tickets_escalados / total_tickets) x 100`
- **Fonte:** Helpdesk | **Freq:** Semanal
- **Benchmarks:** < 10% excelente | 10-20% aceitavel | > 30% requer investigacao

---

## 2. KPIs de Vendas

**Taxa de Conversao**
- **Formula:** `Conversao = (vendas_fechadas / total_oportunidades) x 100`
- **Fonte:** CRM (HubSpot, Salesforce, Pipedrive) | **Freq:** Semanal/Mensal
- **Benchmarks:** B2B SaaS 2-5% (lead-to-customer) | E-commerce 1-3% | Inside Sales 15-25% (opp-to-close)

**Ticket Medio**
- **Formula:** `Ticket_Medio = receita_total / numero_de_vendas`
- **Fonte:** CRM / ERP / Gateway de pagamento | **Freq:** Semanal/Mensal
- **Benchmarks:** Varia por segmento. Monitorar tendencia (crescimento > 5% a.a. e saudavel).

**Custo de Aquisicao de Cliente (CAC)**
- **Formula:** `CAC = (custo_marketing + custo_vendas) / novos_clientes_no_periodo`
- **Fonte:** Financeiro + CRM | **Freq:** Mensal
- **Benchmarks:** Recuperar em < 12 meses. SaaS saudavel: CAC < LTV/3.

**Lifetime Value (LTV)**
- **Formula:** `LTV = Ticket_Medio x Frequencia_Compra x Tempo_Medio_Retencao`
- **Formula SaaS:** `LTV = ARPU_mensal / Churn_mensal`
- **Fonte:** CRM + Financeiro | **Freq:** Trimestral
- **Benchmarks:** LTV/CAC > 3 e saudavel | < 1 e insustentavel

**Ratio LTV/CAC**
- **Formula:** `LTV_CAC = LTV / CAC`
- **Freq:** Trimestral
- **Benchmarks:** < 1 prejuizo | 1-3 fragil | 3-5 saudavel | > 5 subinvestindo em crescimento

**Pipeline Velocity**
- **Formula:** `Velocity = (n_oportunidades x ticket_medio x win_rate) / ciclo_medio_dias`
- **Fonte:** CRM | **Freq:** Mensal
- **Benchmarks:** Tendencia crescente e o indicador. Comparar mes a mes.

**Ciclo de Vendas**
- **Formula:** `Ciclo = Soma(data_fechamento - data_criacao_opp) / total_opp_fechadas`
- **Fonte:** CRM | **Freq:** Mensal
- **Benchmarks:** SMB 14-30 dias | Mid-market 30-90 dias | Enterprise 90-180+ dias

**Win Rate**
- **Formula:** `Win_Rate = (opp_ganhas / (opp_ganhas + opp_perdidas)) x 100`
- **Fonte:** CRM | **Freq:** Mensal
- **Benchmarks:** B2B medio 20-30% | Top performers > 40%

**Churn Rate**
- **Formula:** `Churn = (clientes_perdidos / clientes_inicio_periodo) x 100`
- **Fonte:** CRM / Billing | **Freq:** Mensal
- **Benchmarks:** SaaS B2B < 2% mensal (bom) | < 5% aceitavel | > 5% critico

---

## 3. KPIs de Operacoes e Logistica

**Lead Time**
- **Formula:** `Lead_Time = data_entrega - data_pedido`
- **Fonte:** ERP / WMS | **Freq:** Diaria/Semanal
- **Benchmarks:** Monitorar percentis P50, P90, P95. Depende do setor.

**Throughput (Vazao)**
- **Formula:** `Throughput = unidades_concluidas / periodo`
- **Fonte:** Sistema de producao / ERP | **Freq:** Diaria/Por turno
- **Benchmarks:** Comparar com capacidade teorica. Utilizacao > 85% e boa.

**Utilizacao de Capacidade**
- **Formula:** `Utilizacao = (producao_real / capacidade_maxima) x 100`
- **Fonte:** ERP / MES | **Freq:** Diaria
- **Benchmarks:** 70-85% ideal | < 60% subocioso | > 90% risco de gargalo

**Taxa de Erro**
- **Formula:** `Taxa_Erro = (itens_com_erro / total_itens_processados) x 100`
- **Fonte:** Sistema de qualidade / ERP | **Freq:** Diaria/Semanal
- **Benchmarks:** < 1% excelente | 1-3% aceitavel | > 5% requer acao imediata

**Retrabalho**
- **Formula:** `Retrabalho = (itens_reprocessados / total_itens) x 100`
- **Fonte:** Sistema de qualidade | **Freq:** Semanal
- **Benchmarks:** < 2% bom | 2-5% aceitavel | > 5% investigar causa raiz

**OEE (Overall Equipment Effectiveness)**
- **Formula:** `OEE = Disponibilidade x Performance x Qualidade`
  - Disponibilidade = tempo_produtivo / tempo_planejado
  - Performance = producao_real / producao_teorica
  - Qualidade = pecas_boas / total_pecas
- **Fonte:** MES / sensores IoT | **Freq:** Diaria/Por turno
- **Benchmarks:** < 40% baixo | 40-60% tipico | 60-85% bom | > 85% classe mundial

**On-Time Delivery (OTD)**
- **Formula:** `OTD = (entregas_no_prazo / total_entregas) x 100`
- **Fonte:** ERP / TMS | **Freq:** Semanal
- **Benchmarks:** < 85% critico | 85-95% aceitavel | > 95% excelente

---

## 4. KPIs de Desenvolvimento de Software (DORA + Complementares)

**Lead Time for Changes** (DORA)
- **Formula:** `LT = timestamp_deploy - timestamp_primeiro_commit`
- **Fonte:** CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins) | **Freq:** Por deploy
- **Benchmarks:** Elite < 1 dia | High 1-7 dias | Medium 1-6 meses | Low > 6 meses

**Deployment Frequency** (DORA)
- **Formula:** `DF = numero_deploys / periodo`
- **Fonte:** CI/CD pipeline | **Freq:** Semanal
- **Benchmarks:** Elite multiplas/dia | High 1x/semana-1x/mes | Medium 1x/mes-1x/6meses

**Mean Time to Recovery** (DORA)
- **Formula:** `MTTR = Soma(tempo_recuperacao) / total_incidentes`
- **Fonte:** Monitoramento / incident management | **Freq:** Por incidente (agregado mensal)
- **Benchmarks:** Elite < 1h | High < 24h | Medium < 7 dias | Low > 7 dias

**Change Failure Rate** (DORA)
- **Formula:** `CFR = (deploys_com_falha / total_deploys) x 100`
- **Fonte:** CI/CD + incident management | **Freq:** Semanal/Mensal
- **Benchmarks:** Elite < 5% | High 5-10% | Medium 10-15% | Low > 15%

**Velocity (Scrum)**
- **Formula:** `Velocity = soma_story_points_concluidos_na_sprint`
- **Fonte:** Jira, Linear, Azure DevOps | **Freq:** Por sprint
- **Benchmarks:** Nao comparar entre times. Usar media das ultimas 3-5 sprints como referencia propria.

**Bug Density**
- **Formula:** `Bug_Density = total_bugs / KLOC (mil linhas de codigo)`
- **Fonte:** Issue tracker + analise de codigo | **Freq:** Mensal/Por release
- **Benchmarks:** < 1 bug/KLOC bom | 1-5 aceitavel | > 10 critico

**Code Coverage**
- **Formula:** `Coverage = (linhas_testadas / total_linhas) x 100`
- **Fonte:** Istanbul, JaCoCo, Coverage.py | **Freq:** Por commit/sprint
- **Benchmarks:** < 40% insuficiente | 40-60% aceitavel | 60-80% bom | > 80% excelente

**Cycle Time (Dev)**
- **Formula:** `Cycle_Time = data_done - data_in_progress`
- **Fonte:** Board (Jira, Linear, Trello) | **Freq:** Por item (agregado semanal)
- **Benchmarks:** Bugs < 2 dias | Features pequenas < 5 dias | Features medias < 10 dias

---

## 5. KPIs Financeiros

**Margem Bruta**
- **Formula:** `Margem_Bruta = ((receita - CMV) / receita) x 100`
- **Fonte:** DRE / ERP | **Freq:** Mensal
- **Benchmarks:** SaaS 70-85% | Servicos 40-60% | Varejo 25-50% | Industria 20-40%

**Margem Liquida**
- **Formula:** `Margem_Liquida = (lucro_liquido / receita_total) x 100`
- **Fonte:** DRE / Contabilidade | **Freq:** Mensal
- **Benchmarks:** SaaS 15-25% (maduro) | Servicos 10-20% | Varejo 2-5% | Industria 5-15%

**Retorno sobre Investimento (ROI)**
- **Formula:** `ROI = ((ganho - investimento) / investimento) x 100`
- **Fonte:** Financeiro + dados do projeto | **Freq:** Por projeto/Trimestral
- **Benchmarks:** > 0% positivo | > 20% bom | > 50% excelente (depende do risco)

**Payback Period**
- **Formula:** `Payback = investimento_inicial / retorno_mensal_medio`
- **Fonte:** Financeiro | **Freq:** Por projeto
- **Benchmarks:** < 6 meses excelente | 6-12 bom | 12-24 aceitavel | > 24 questionar

**Custo por Transacao**
- **Formula:** `CPT = custo_total_operacao / numero_transacoes`
- **Fonte:** Financeiro + sistema operacional | **Freq:** Mensal
- **Benchmarks:** Monitorar tendencia descendente. Comparar com concorrentes se disponivel.

**Custo por Processo**
- **Formula:** `CPP = (custo_pessoas + custo_tech + custo_infra) / instancias_executadas`
- **Fonte:** ABC Costing / Financeiro | **Freq:** Mensal/Trimestral
- **Benchmarks:** Usar como baseline para medir ganho de eficiencia apos melhorias.

---

## 6. KPIs de Processos (Genericos)

Aplicaveis a qualquer processo, independente do dominio.

| KPI | Formula | Meta Tipica |
|-----|---------|-------------|
| **Tempo de Ciclo** | `data_fim - data_inicio` | Reducao continua vs baseline |
| **Throughput** | `itens_concluidos / periodo` | Crescimento sem perda de qualidade |
| **WIP** | `itens_iniciados - itens_concluidos` | Menor possivel (Lei de Little) |
| **Taxa de Defeitos** | `(defeituosos / total) x 100` | < 1% para processos maduros |
| **First-Pass Yield** | `(corretos_1a_vez / total) x 100` | > 95% excelente, > 99% Six Sigma |
| **Custo por Unidade** | `custo_total / unidades_processadas` | Reducao continua |
| **Aderencia ao Processo** | `(conforme / total_execucoes) x 100` | > 90% minimo, > 95% ideal |
| **Satisfacao do Executor** | Pesquisa interna (escala 1-5) | > 3.5 aceitavel, > 4.0 bom |

**Lei de Little:** `WIP = Throughput x Cycle Time`. Se WIP sobe sem aumento de throughput, o cycle time aumenta. Controlar WIP e a alavanca mais poderosa para reduzir tempo de ciclo.

---

## 7. KPIs de Gestao de Mudanca

**Taxa de Adocao**
- **Formula:** `Adocao = (usuarios_ativos_novo_processo / total_alvo) x 100`
- **Fonte:** Logs de sistema / pesquisa | **Freq:** Semanal (90 dias) / Mensal (apos)
- **Benchmarks:** Semana 1 > 30% | Mes 1 > 60% | Mes 3 > 85% | Mes 6 > 95%

**Tempo para Proficiencia**
- **Formula:** `TTP = data_proficiencia - data_inicio_uso`
- **Fonte:** Avaliacao de performance | **Freq:** Por usuario (agregado mensal)
- **Benchmarks:** Varia por complexidade. Objetivo: reduzir com treinamento iterativo.

**Resistencia Medida**
- **Formula:** Score medio em pesquisa Likert (1-5) sobre aceitacao.
- **Fonte:** Survey anonimo | **Freq:** Quinzenal nos primeiros 90 dias
- **Benchmarks:** > 4.0 excelente | 3.0-4.0 atencao | < 3.0 intervencao necessaria

**ROI da Mudanca**
- **Formula:** `ROI = ((beneficio_pos - custo_mudanca) / custo_mudanca) x 100`
- **Fonte:** Financeiro + metricas operacionais (antes vs depois) | **Freq:** Trimestral
- **Benchmarks:** Positivo em ate 6 meses para mudancas processuais.

---

## 8. Como Definir Bons KPIs

### 8.1 Framework SMART

| Criterio | Pergunta-Chave | Exemplo Ruim | Exemplo Bom |
|----------|---------------|--------------|-------------|
| **Specific** | O que exatamente medimos? | "Melhorar atendimento" | "Reduzir TMR do chat" |
| **Measurable** | Temos dados para calcular? | "Ser mais agil" | "TMR < 2 minutos" |
| **Achievable** | A meta e realista? | "Zero defeitos amanha" | "Reducao de 30% em 6 meses" |
| **Relevant** | Conecta com objetivo de negocio? | "Medir linhas de codigo" | "Medir lead time for changes" |
| **Time-bound** | Quando avaliaremos? | "Melhorar algum dia" | "Atingir meta ate Q3 2026" |

### 8.2 Armadilhas Comuns

1. **Vanity Metrics:** Numeros que impressionam mas nao orientam acao (page views sem conversao).
2. **Gaming:** Meta vira objetivo e perde valor de medida. Ex: TMR < 5min leva agentes a responder "estamos analisando" so para parar o relogio.
3. **Over-measurement:** 50 KPIs = paralisia. Ninguem age sobre 50 numeros.
4. **Lag-only:** Medir so resultado (churn) sem indicadores de processo (engajamento).
5. **Sem baseline:** Definir meta sem conhecer estado atual e chutar no escuro.

### 8.3 Quantos KPIs Usar

**Regra: 3 a 5 KPIs por processo.**
- 1-2 de eficiencia (tempo, custo)
- 1-2 de qualidade (defeitos, satisfacao)
- 1 de volume/throughput

Mais que 5 = diluicao. Menos que 3 = ponto cego.

### 8.4 Como Definir Metas Realistas

```
Meta = Baseline + (Benchmark - Baseline) x Fator_Ambicao
```

| Nivel | Fator | Descricao |
|-------|-------|-----------|
| **Baseline** | 0.0 | Estado atual medido (minimo 30 dias de dados) |
| **Target** | 0.5-0.7 | Meta realista (50-70% do gap ate benchmark) |
| **Stretch** | 0.9-1.0 | Meta ambiciosa (90-100% do gap) |

**Exemplo:** Baseline TMR = 8min, Benchmark = 2min, Gap = 6min
- Target (60%): 8 - (6 x 0.6) = **4.4 min**
- Stretch (90%): 8 - (6 x 0.9) = **2.6 min**

---

## 9. Template de Definicao de KPI

Use este template para cada KPI em projetos de melhoria de processos.

```markdown
### [Nome do KPI]

| Campo | Valor |
|-------|-------|
| **Nome** | [Nome claro e sem ambiguidade] |
| **Objetivo** | [Por que existe? Que decisao informa?] |
| **Formula** | [Formula exata com variaveis nomeadas] |
| **Fonte de Dados** | [Sistema de onde os dados sao extraidos] |
| **Frequencia** | [Diaria / Semanal / Mensal / Por evento] |
| **Baseline** | [Valor atual medido - data da medicao] |
| **Target** | [Meta realista - prazo] |
| **Stretch** | [Meta ambiciosa - prazo] |
| **Responsavel** | [Quem monitora e reporta] |
| **Stakeholder** | [Quem recebe report e decide] |
| **Acao se fora da meta** | [Protocolo: notificacao, analise, prazo] |
| **Data de revisao** | [Quando sera revisado para relevancia] |
```

### Exemplo Preenchido

```markdown
### Tempo Medio de Resolucao (TMRes) - Suporte L1

| Campo | Valor |
|-------|-------|
| **Nome** | Tempo Medio de Resolucao - Suporte Nivel 1 |
| **Objetivo** | Garantir resolucao rapida de tickets L1 sem impacto no cliente |
| **Formula** | Soma(data_fechamento - data_abertura) / total_tickets_L1_resolvidos |
| **Fonte de Dados** | Zendesk - relatorio "Resolution Time by Tier" |
| **Frequencia** | Semanal (report segunda-feira) |
| **Baseline** | 6.2 horas (medido Jan/2026) |
| **Target** | 4.0 horas ate Jun/2026 |
| **Stretch** | 2.5 horas ate Dez/2026 |
| **Responsavel** | Coordenador de Suporte |
| **Stakeholder** | Head de Customer Success |
| **Acao se fora da meta** | TMRes > 5h por 2 semanas: (1) analise de causas, (2) plano em 48h, (3) report ao Head |
| **Data de revisao** | Jul/2026 - recalibrar metas |
```

---

> **Nota:** Documento de referencia viva. Adapte benchmarks ao contexto do seu setor e porte. Benchmarks sao direcoes, nao verdades absolutas. Sempre medie seu baseline antes de definir metas.
