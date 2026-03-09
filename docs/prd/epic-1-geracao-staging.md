# Epic 1 — Geracao e Staging AI

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## Requisitos Funcionais

| ID | Requisito | Prioridade | Rastreabilidade |
|----|-----------|-----------|-----------------|
| FR-01 | O sistema deve permitir upload de foto do local (JPEG/PNG, ate 20MB) — incluindo ambientes vazios, em reforma ou com mobilia existente — e gerar uma versao decorada fotorrealista em 10–30 segundos | Must Have | Brief §F01, §Tech Requirements, Requisito do Usuario |
| FR-02 | O sistema deve oferecer 10 estilos predefinidos de decoracao: moderno, industrial, minimalista, classico, escandinavo, rustico, tropical, contemporaneo, boho e luxo | Must Have | Brief §F01 |
| FR-03 | O sistema deve permitir gerar variacoes do mesmo ambiente em estilos diferentes com 1 clique, sem necessidade de novo upload | Must Have | Brief §F04 |
| FR-24 | O sistema deve aceitar como input alternativo uma descricao textual do ambiente com medidas (ex: "sala 4m x 6m com pe-direito de 2.80m, janela na parede norte de 2m x 1.5m") e gerar a cena decorada a partir dessas especificacoes | Must Have | Requisito do Usuario |
| FR-25 | O sistema deve permitir que o usuario especifique itens desejados com medidas e/ou fotos de referencia (ex: "sofa de 2.20m nesta posicao" + foto do sofa, "bancada de granito preto de 3m") e gerar a cena respeitando rigorosamente as especificacoes fornecidas | Must Have | Requisito do Usuario |
| FR-26 | O sistema deve permitir combinar inputs: foto do local + descricao textual + fotos de referencia de itens, gerando resultado que respeite todos os inputs fornecidos | Must Have | Requisito do Usuario |
| FR-29 | Antes de gerar as imagens, o sistema deve criar um croqui/planta baixa ASCII do ambiente interpretado, exibindo: dimensoes do espaco, posicao de portas/janelas, e itens de mobilia adicionados pelo usuario com suas medidas e posicoes — como etapa de confirmacao | Must Have | Requisito do Usuario, skill/ascii-design |
| FR-30 | O croqui de confirmacao deve usar a tecnica de 3 turnos (gerar -> iterar -> confirmar) das ASCII Skills (`skill/ascii-design`, `skill/ascii-architecture`, `skill/ascii-concept`), permitindo que o usuario corrija posicoes, medidas ou itens antes da geracao da imagem | Must Have | Requisito do Usuario, skill/ascii-design |
| FR-31 | O usuario deve poder aprovar ou solicitar ajustes no croqui. Somente apos aprovacao explicita do croqui o sistema deve prosseguir para a geracao da imagem fotorrealista | Must Have | Requisito do Usuario |
| FR-32 | Quando o input for uma foto, o sistema deve interpretar a foto (via IA de visao computacional) para extrair dimensoes estimadas, identificar elementos existentes (portas, janelas, pilares) e gerar o croqui correspondente para confirmacao | Must Have | Requisito do Usuario |

---

## Descricao do Epic

**Objetivo:** Permitir que o usuario transforme ambientes em versoes decoradas fotorrealistas, aceitando multiplos tipos de input: foto do local (vazio, em reforma ou mobiliado), descricao textual com medidas, e fotos de referencia de itens desejados.

**Justificativa:** Core do produto. Sem essa funcionalidade, nao existe proposta de valor. A flexibilidade de inputs atende desde corretores com foto do imovel ate arquitetos com planta e especificacoes detalhadas. O croqui de confirmacao (FR-29 a FR-32) garante que o sistema entendeu corretamente o ambiente antes de gastar GPU na geracao, usando as ASCII Skills como motor de visualizacao previa.

---

> **Ref:** Brief §F01, §F04, §Tech Requirements, Requisito do Usuario
