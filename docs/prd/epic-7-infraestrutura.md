# Epic 7 — Infraestrutura e Pipeline de IA

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## Requisitos Funcionais

| ID | Requisito | Prioridade | Rastreabilidade |
|----|-----------|-----------|-----------------|
| FR-19 | O sistema deve processar renders em fila assincrona com feedback em tempo real via WebSocket durante a geracao | Must Have | Brief §Tech Architecture |
| FR-20 | O sistema deve entregar imagens em resolucao ate 2048x2048 (HD) para planos pagos | Must Have | Brief §Tech Requirements |
| FR-21 | O pipeline de IA deve utilizar Stable Diffusion XL + ControlNet (multi-conditioning: depth + normal + edge) | Must Have | Brief §Tech Preferences |
| FR-22 | O sistema deve usar ZoeDepth para depth estimation e escala automatica dos ambientes | Must Have | Brief §Tech Preferences |
| FR-23 | O sistema deve usar CLIP para extracao de estilo e correspondencia de referencias visuais | Must Have | Brief §Tech Preferences |

---

## Descricao do Epic

**Objetivo:** Construir o pipeline de IA/ML que sustenta todas as funcionalidades de geracao e edicao.

**Justificativa:** Fundacao tecnica do produto. Determina qualidade, performance e custo.

---

> **Ref:** Brief §Tech Architecture, §Tech Requirements, §Tech Preferences
