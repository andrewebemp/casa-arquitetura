# Process Excellence Squad

**Versao:** 1.0.0
**Ativacao:** `/processExcellence`
**Agente de Entrada:** `orquestrador-de-processos`

Squad de excelencia em processos com 8 agentes especializados, cobrindo o ciclo
completo de analise, otimizacao, documentacao e gestao de mudanca. Aplicavel a
processos de negocio, desenvolvimento de software e vida pessoal.

Cada agente e construido com Mind Clones de especialistas reais (Taiichi Ohno,
Goldratt, David Allen, Kotter, Kaplan & Norton, entre outros), combinando
frameworks comprovados com personalidades distintas.

---

## Quick Start

```
/processExcellence
```

O Orquestrador de Processos sera ativado automaticamente. Ele classifica sua
demanda usando a Matriz 9-Cell de Rummler e direciona ao agente mais adequado.

**Acesso direto a um agente especifico:**

```
/processExcellence @otimizador-de-processos
/processExcellence @decompositor-de-tarefas
```

---

## Agentes

O squad possui 8 agentes organizados em 2 tiers:

### Tier 1 -- Agentes Primarios

| Agente | Funcao | Mind Clones | Comandos Principais |
|--------|--------|-------------|---------------------|
| **Orquestrador de Processos** | Triagem e coordenacao via Matriz 9-Cell de Rummler | Geary Rummler | `*analisar`, `*classificar`, `*ajuda` |
| **Otimizador de Processos** | Analise AS-IS, eliminacao de desperdicios, proposta TO-BE | Taiichi Ohno, Goldratt, M. Hammer | `*otimizar`, `*gargalo`, `*valor`, `*ajuda` |
| **Decompositor de Tarefas** | Decomposicao em micro-tarefas executaveis para iniciantes | David Allen (GTD), Tiago Forte (BASB) | `*decompor`, `*micro-tarefa`, `*ajuda` |

### Tier 2 -- Agentes Especializados

| Agente | Funcao | Mind Clones / Frameworks | Comandos Principais |
|--------|--------|--------------------------|---------------------|
| **Auditor de Processos** | Auditoria de aderencia, riscos e nao-conformidades | ISO 9001, COSO | `*auditar`, `*risco`, `*gap`, `*ajuda` |
| **Documentador SOP** | Criacao de SOPs acessiveis com troubleshooting | Technical Writing, ELI5 | `*sop`, `*revisar`, `*ajuda` |
| **Analista de Metricas** | Definicao de KPIs, baselines, dashboards e comparativos | Kaplan & Norton (BSC), Andy Grove (OKRs), DORA | `*metricas`, `*baseline`, `*dashboard`, `*comparar`, `*ajuda` |
| **Gestor de Mudanca** | Planejamento de adocao humana e gestao de transicao | Kotter (8 Steps), ADKAR | `*mudanca`, `*stakeholders`, `*comunicacao`, `*treinamento`, `*ajuda` |
| **Cacador de Automacao** | Identificacao de oportunidades de automacao e calculo de ROI | RPA, No-Code/Low-Code | `*automatizar`, `*roi`, `*ferramenta`, `*ajuda` |

---

## Workflows

O squad oferece 3 workflows que orquestram multiplos agentes em sequencia:

### 1. Analise Completa (`analise-completa`)

Ciclo completo de analise de processo em 5 fases com checkpoints de aprovacao.

| Fase | Nome | Agentes Envolvidos |
|------|------|--------------------|
| 1 | Classificacao e Planejamento | Orquestrador |
| 2 | Mapeamento e Metricas | Otimizador + Analista de Metricas |
| 3 | Diagnostico e Oportunidades | Auditor + Otimizador + Cacador de Automacao |
| 4 | Planejamento da Implementacao | Decompositor + Gestor de Mudanca + Documentador SOP |
| 5 | Consolidacao e Entrega | Orquestrador |

**Quando usar:** Processos criticos que precisam de diagnostico profundo e plano de
implementacao completo. Tempo estimado: 4-8h.

### 2. Melhoria Rapida (`melhoria-rapida`)

Diagnostico e proposta sem planejamento de implementacao (Fases 1-3 da Analise Completa).

| Fase | Nome | Agentes Envolvidos |
|------|------|--------------------|
| 1 | Classificacao | Orquestrador |
| 2 | Mapeamento e Metricas | Otimizador + Analista de Metricas |
| 3 | Diagnostico e Proposta TO-BE | Otimizador + Auditor |

**Quando usar:** Processos que precisam de melhoria rapida sem projeto formal de mudanca.
Tempo estimado: 2-4h.

### 3. Decomposicao de Tarefa (`decomposicao`)

Foco exclusivo em quebrar uma tarefa complexa em micro-tarefas executaveis.

| Fase | Nome | Agentes Envolvidos |
|------|------|--------------------|
| 1 | Entendimento e Contexto | Decompositor |
| 2 | Decomposicao em Micro-tarefas | Decompositor |

**Quando usar:** Qualquer tarefa (tecnica, administrativa, pessoal) que precisa ser
detalhada para execucao por um iniciante. Tempo estimado: 15-60min.

---

## Modos de Operacao

| Modo | Fases | Descricao | Quando Usar |
|------|:-----:|-----------|-------------|
| **Completa** | 5 | Mapear, analisar, redesenhar, planejar, entregar | Processos criticos, decisoes irreversiveis |
| **Rapida** | 3 | Diagnosticar, propor, documentar | Melhorias moderadas, processos reversiveis |
| **Decomposicao** | 2 | Entender, quebrar em micro-tarefas | Tarefas complexas para iniciantes |
| **Direto** | 1 | Comando direto a um agente especifico | Necessidade pontual e clara |

---

## Arquitetura: Matriz 9-Cell de Rummler

O Orquestrador classifica cada demanda usando a Matriz 9-Cell de Rummler,
cruzando nivel de analise com perspectiva de melhoria:

```
                     PERSPECTIVA
              Objetivos    Design    Gestao
           +------------+----------+-----------+
  Org.     | Estrategia | Estrutura| Governanca|
           | do processo| org.     | e politica|
  NIVEL    +------------+----------+-----------+
  Processo | Metas do   | Fluxo e  | Medicao e |
           | processo   | handoffs | melhoria  |
           +------------+----------+-----------+
  Atividade| Resultado  | Passos e | Feedback  |
           | esperado   | instrucao| e ajuste  |
           +------------+----------+-----------+

  Roteamento por celula:
  +-----------------------------+----------------------------------+
  | Celula                      | Agente Principal                 |
  +-----------------------------+----------------------------------+
  | Processo x Design           | @otimizador-de-processos         |
  | Processo x Gestao           | @analista-de-metricas            |
  | Atividade x Design          | @decompositor-de-tarefas         |
  | Atividade x Gestao          | @documentador-sop                |
  | Qualquer x Objetivos        | @auditor-de-processos            |
  | Org. x Design               | @gestor-de-mudanca               |
  | Automacao identificada      | @cacador-de-automacao            |
  +-----------------------------+----------------------------------+
```

---

## Estrutura de Arquivos

```
squads/process-excellence/
|-- config.yaml              # Configuracao do squad
|-- README.md                # Este arquivo
|-- agents/                  # 8 agentes (Tier 1 + Tier 2)
|-- tasks/                   # 9 tarefas executaveis (incl. analise-completa)
|-- templates/               # 6 templates (mapa, SOP, auditoria, etc.)
|-- checklists/              # Checklists de validacao (processo, SOP)
|-- data/                    # Frameworks, KPIs de referencia, catalogo de automacoes
|-- workflows/               # Workflows multi-agente
+-- docs/                    # Documentacao adicional
```

---

## Principios do Squad

1. **Genchi Genbutsu** -- Analise processos reais, nao fluxogramas teoricos
2. **Dados antes de opiniao** -- Toda recomendacao tem numero, baseline e meta
3. **Eliminar antes de automatizar** -- Desperdicio eliminado nao precisa de software
4. **Clareza para iniciantes** -- Se o executor tem duvida, a instrucao falhou
5. **Lado humano da mudanca** -- Processo novo sem adocao e documento morto

---

*Process Excellence Squad v1.0.0 -- Synkra AIOS*
