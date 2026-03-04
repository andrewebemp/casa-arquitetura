# Criar SOP (Standard Operating Procedure)

**Task ID:** `PE-T-005`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar SOP (Standard Operating Procedure) |
| **status** | pending |
| **responsible_executor** | @documentador-sop |
| **execution_type** | Agent |
| **input** | [processo documentado: mapa, descricao ou observacao] |
| **output** | [SOP completa e versionada] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-005 |
| Rationale | Documentacao SOP requer clareza extrema, linguagem acessivel e estrutura padronizada |

## Overview
Transforma qualquer processo (mapeado, descrito ou observado) em uma SOP completa e acessivel. A SOP e escrita para que alguem sem experiencia previa consiga executar o processo com autonomia. Inclui passo-a-passo detalhado, troubleshooting por etapa, FAQ e versionamento.

## Input
- **processo** (documento): Mapa do processo, descricao textual ou observacao direta
- **publico_alvo** (string, opcional): Quem vai usar a SOP (perfil, experiencia)
- **normas** (lista, opcional): Normas ou politicas que a SOP deve atender

## Output
- **sop** (documento): SOP completa usando template `templates/sop-tmpl.md`
- **changelog** (texto): Registro de versao inicial com data e autor
- **checklist-validacao** (lista): Checklist para validar que a SOP esta completa

## Action Items
### Step 1: Entender o Processo e Publico
- [ ] Revisar documentacao disponivel sobre o processo
- [ ] Identificar o publico-alvo da SOP (experiencia, contexto)
- [ ] Definir o nivel de detalhe necessario
- [ ] Listar normas ou politicas aplicaveis
- [ ] Identificar pre-requisitos para execucao do processo

### Step 2: Estruturar a SOP
- [ ] Definir titulo, codigo e versao
- [ ] Escrever objetivo da SOP (uma frase clara)
- [ ] Definir escopo (o que esta coberto e o que nao esta)
- [ ] Listar materiais, ferramentas e acessos necessarios
- [ ] Listar definicoes e siglas utilizadas

### Step 3: Escrever Passos Detalhados
Para cada etapa do processo:
- [ ] Descrever a acao como verbo no imperativo ("Abra o sistema X")
- [ ] Incluir onde clicar, o que digitar, o que verificar
- [ ] Adicionar capturas de tela ou exemplos quando possivel
- [ ] Indicar resultado esperado apos cada passo
- [ ] Marcar pontos de atencao e avisos importantes

### Step 4: Adicionar Troubleshooting por Etapa
Para cada etapa critica:
- [ ] Listar problemas mais comuns
- [ ] Descrever sintoma (o que o usuario ve)
- [ ] Descrever causa provavel
- [ ] Descrever solucao passo-a-passo
- [ ] Indicar quando escalar (e para quem)

### Step 5: Criar FAQ
- [ ] Antecipar duvidas frequentes do publico-alvo
- [ ] Responder de forma direta e objetiva
- [ ] Incluir casos de borda e excecoes
- [ ] Referenciar secoes relevantes da SOP
- [ ] Manter linguagem acessivel e sem jargao

### Step 6: Revisar Linguagem
- [ ] Verificar que toda frase usa linguagem simples
- [ ] Eliminar jargao tecnico desnecessario (ou explicar se inevitavel)
- [ ] Garantir que frases sao curtas e diretas
- [ ] Testar mentalmente: um iniciante entenderia?
- [ ] Revisar consistencia de termos ao longo do documento

### Step 7: Versionar e Entregar
- [ ] Atribuir numero de versao (1.0.0 para versao inicial)
- [ ] Registrar data de criacao e autor
- [ ] Preencher changelog com descricao da versao
- [ ] Gerar checklist de validacao preenchido
- [ ] Entregar SOP final ao usuario para aprovacao

## Acceptance Criteria
- [ ] **AC-1:** Cada passo e uma acao concreta e executavel (verbo no imperativo)
- [ ] **AC-2:** Linguagem acessivel para iniciante sem conhecimento previo
- [ ] **AC-3:** Troubleshooting incluido para etapas criticas
- [ ] **AC-4:** FAQ completo com duvidas antecipadas e casos de borda
- [ ] **AC-5:** SOP versionada com changelog e data de criacao

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| - | Entrega direta ao usuario | - |

## Error Handling
- Se processo de origem esta incompleto -> solicitar complemento via mapear-processo
- Se publico-alvo nao esta definido -> assumir iniciante sem experiencia e avisar
- Se processo muda durante documentacao -> versionar a SOP e registrar alteracao
