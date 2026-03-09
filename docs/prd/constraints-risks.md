# Restricoes, Premissas e Riscos

**PRD:** DecorAI Brasil v1.2
**Data:** 2026-03-08
**Ref:** [PRD Index](index.md) | [PRD Principal](../prd.md)

---

## 4. Restricoes (Constraints)

| ID | Restricao | Rastreabilidade |
|----|-----------|-----------------|
| CON-01 | Budget lean para MVP; custo de GPU e o principal gargalo financeiro (estimativa: R$ 4–8K/mes para 2.000 renders) | Brief §Constraints |
| CON-02 | Timeline de 3–4 meses para MVP com equipe enxuta (1–2 devs full-stack + 1 ML engineer) | Brief §Constraints |
| CON-03 | Qualidade fotorrealista depende de fine-tuning com dataset de interiores brasileiros (necessario curar 5K–10K imagens) | Brief §Constraints |
| CON-04 | MVP apenas em PT-BR (multi-idioma fora do escopo) | Brief §Out of Scope |
| CON-05 | Sem app mobile nativo — web responsivo apenas | Brief §Out of Scope |
| CON-06 | Considerar servicos gerenciados (Replicate, Modal) vs. infraestrutura propria para custo inicial | Brief §Constraints |
| CON-07 | Monorepo (Turborepo) com packages: web, api, ai-pipeline, shared | Brief §Tech Architecture |

---

## 8.1 Premissas-chave

1. Corretores brasileiros estao dispostos a pagar R$ 79–149/mes se ROI for demonstravel — **Ref:** Brief §Key Assumptions
2. Qualidade de SDXL + ControlNet ja e suficiente para uso profissional imobiliario — **Ref:** Brief §Key Assumptions
3. Reverse Staging tera conversao > 10% para plano pago — **Ref:** Brief §Key Assumptions
4. Dialogo iterativo com IA sera adotado (nao apenas "gerar e baixar") — **Ref:** Brief §Key Assumptions
5. Custos de GPU continuarao diminuindo — **Ref:** Brief §Key Assumptions
6. Nao havera regulamentacao restritiva sobre imagens AI em anuncios no curto prazo — **Ref:** Brief §Key Assumptions

---

## 8.2 Riscos Principais

| Risco | Impacto | Mitigacao | Ref |
|-------|---------|-----------|-----|
| Qualidade insuficiente dos renders | Alto | Fine-tuning com dataset BR, benchmark FID, beta testers | Brief §Key Risks |
| Custo de GPU inviavel (> R$ 2/render) | Alto | SDXL Turbo, distillation, cache semantico, GPU spot | Brief §Key Risks |
| Big Tech entra no mercado BR | Medio | Moat de localizacao, velocidade, parcerias locais | Brief §Key Risks |
| Baixa adocao inicial | Alto | Reverse Staging gratuito, tier free, onboarding guiado | Brief §Key Risks |
| Regulamentacao de IA em anuncios | Baixo | Disclaimer desde o inicio, transparencia | Brief §Key Risks |

---

> **Ref:** Brief §Constraints, §Out of Scope, §Key Assumptions, §Key Risks
