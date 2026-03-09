# Requisitos Nao-Funcionais

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## 3.1 Performance

| ID | Requisito | Rastreabilidade |
|----|-----------|-----------------|
| NFR-01 | Geracao de render inicial deve completar em menos de 30 segundos | Brief §Tech Requirements |
| NFR-02 | Refinamento via chat deve responder em menos de 15 segundos por iteracao | Brief §Tech Requirements |
| NFR-03 | Time-to-value (do cadastro ao primeiro render) deve ser menor que 3 minutos no MVP | Brief §KPIs |
| NFR-04 | Custo por render deve ser inferior a R$ 2,00 no MVP | Brief §KPIs |

## 3.2 Escalabilidade

| ID | Requisito | Rastreabilidade |
|----|-----------|-----------------|
| NFR-05 | A arquitetura deve suportar 2.000 renders/mes no MVP e escalar para 50.000 renders/mes em 12 meses | Brief §KPIs |
| NFR-06 | O processamento de renders deve usar fila de jobs assincronos com workers GPU independentes | Brief §Tech Architecture |
| NFR-07 | O sistema deve utilizar cache Redis para sessoes e cache semantico de renders | Brief §Tech Preferences |

## 3.3 Seguranca e Compliance

| ID | Requisito | Rastreabilidade |
|----|-----------|-----------------|
| NFR-08 | O sistema deve estar em conformidade com a LGPD, exigindo consentimento explicito para processamento de imagens | Brief §Security/Compliance |
| NFR-09 | Imagens do usuario nao devem ser usadas para treinamento de modelos sem opt-in explicito | Brief §Security/Compliance |
| NFR-10 | O sistema deve implementar rate limiting por tier para evitar abuso | Brief §Security/Compliance |
| NFR-11 | Imagens devem ser armazenadas em S3 com entrega via CDN (CloudFront ou Cloudflare) | Brief §Tech Integration |

## 3.4 Usabilidade e Compatibilidade

| ID | Requisito | Rastreabilidade |
|----|-----------|-----------------|
| NFR-12 | A plataforma deve ser web responsiva (desktop + mobile browsers), sem necessidade de app nativo | Brief §Platform Requirements |
| NFR-13 | Suporte a Chrome 90+, Safari 15+, Firefox 90+, Edge 90+ | Brief §Browser Support |
| NFR-14 | Toda a interface deve ser em portugues brasileiro (PT-BR) | Brief §Proposed Solution |
| NFR-15 | Qualidade perceptual dos renders deve atingir satisfacao > 4.0/5.0 em pesquisa com usuarios | Brief §USM-02, §MVP Success Criteria |

## 3.5 Disponibilidade e Observabilidade

| ID | Requisito | Rastreabilidade |
|----|-----------|-----------------|
| NFR-16 | O sistema deve fornecer feedback visual em tempo real durante geracao de renders (progress indicator via WebSocket) | Brief §Tech Architecture |
| NFR-17 | O sistema deve incluir disclaimer de "imagem ilustrativa gerada por IA" nas imagens geradas | Brief §Risks — Regulamentacao |

---

> **Ref:** Brief §Tech Requirements, §KPIs, §Tech Architecture, §Tech Preferences, §Security/Compliance, §Tech Integration, §Platform Requirements, §Browser Support, §Proposed Solution, §USM-02, §MVP Success Criteria, §Risks
