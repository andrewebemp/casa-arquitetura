# Epic 2 — Chat Visual de Refinamento

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## Requisitos Funcionais

| ID | Requisito | Prioridade | Rastreabilidade |
|----|-----------|-----------|-----------------|
| FR-04 | O sistema deve oferecer um chat conversacional onde o usuario refina o resultado em linguagem natural (ex: "deixa mais aconchegante", "tira o tapete", "muda o piso para madeira clara") | Must Have | Brief §F02 |
| FR-05 | O chat deve aplicar edicoes pontuais sem regenerar a cena inteira, respondendo em menos de 15 segundos por iteracao | Must Have | Brief §F02, §Tech Requirements |
| FR-06 | O sistema deve interpretar comandos em portugues brasileiro usando LLM (Claude ou GPT) | Must Have | Brief §F02, §Tech Preferences |
| FR-27 | O chat deve permitir iteracoes ilimitadas de refinamento, mantendo historico visual de versoes (com possibilidade de voltar a qualquer versao anterior) | Must Have | Requisito do Usuario |
| FR-28 | Cada iteracao de refinamento deve respeitar rigorosamente as especificacoes do usuario (medidas, posicoes, materiais, itens especificos), sem inventar ou substituir elementos nao solicitados | Must Have | Requisito do Usuario |

---

## Descricao do Epic

**Objetivo:** Oferecer dialogo iterativo com IA para refinamento de resultados em linguagem natural, com iteracoes ilimitadas e fidelidade rigorosa as especificacoes do usuario.

**Justificativa:** Principal diferencial competitivo — concorrentes sao "caixas pretas". O refinamento iterativo com respeito as especificacoes transforma a ferramenta de "gerador de imagens" em "assistente de design".

---

> **Ref:** Brief §F02, §Tech Requirements, §Tech Preferences, Requisito do Usuario
