# Epic 6 — Autenticacao, Perfil e Billing

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## Requisitos Funcionais

| ID | Requisito | Prioridade | Rastreabilidade |
|----|-----------|-----------|-----------------|
| FR-14 | O sistema deve suportar login via Google OAuth e email/password | Must Have | Brief §F09, §Tech Integration |
| FR-15 | O sistema deve manter perfil do usuario com historico de projetos, favoritos e preferencias | Must Have | Brief §F09 |
| FR-16 | O sistema deve implementar 3 tiers de pricing: Free (3 renders/mes com marca d'agua), Pro (R$ 79–149/mes) e Business (R$ 299–499/mes) | Must Have | Brief §F10 |
| FR-17 | O sistema deve aplicar marca d'agua nas imagens geradas no tier Free | Must Have | Brief §F10 |
| FR-18 | O sistema deve integrar com gateway de pagamento brasileiro (Asaas ou Pagar.me) e Stripe para pagamentos internacionais | Must Have | Brief §Tech Integration |

---

## Descricao do Epic

**Objetivo:** Gerenciar identidade do usuario, historico e monetizacao da plataforma.

**Justificativa:** Infraestrutura essencial para operacao e receita do produto.

---

> **Ref:** Brief §F09, §F10, §Tech Integration
