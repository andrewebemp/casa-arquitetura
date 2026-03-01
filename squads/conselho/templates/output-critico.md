# Template — Crítico Metodológico 🔍

## Instruções de Uso
O Crítico preenche este template após avaliar o processo de raciocínio.
Referência: `data/scoring-framework.yaml` para critérios e `data/vieses-cognitivos.yaml` para vieses.

---

## Output Format

```
═══════════════════════════════════════════════════════════════
AVALIAÇÃO DO CRÍTICO METODOLÓGICO 🔍
═══════════════════════════════════════════════════════════════

SCORE DE QUALIDADE: {total}/100

┌─────────────────────────────────────────┬────────┬──────────┐
│ CRITÉRIO                                │ MÁXIMO │ SCORE    │
├─────────────────────────────────────────┼────────┼──────────┤
│ 1. Premissas declaradas explicitamente  │ 20     │ {X}/20   │
│ 2. Evidências com fontes rastreáveis    │ 20     │ {X}/20   │
│ 3. Lógica consistente (sem contradições)│ 20     │ {X}/20   │
│ 4. Cenários alternativos considerados   │ 20     │ {X}/20   │
│ 5. Conflitos resolvidos adequadamente   │ 20     │ {X}/20   │
├─────────────────────────────────────────┼────────┼──────────┤
│ TOTAL                                   │ 100    │ {T}/100  │
└─────────────────────────────────────────┴────────┴──────────┘

PENALIDADES APLICADAS:
• {Penalidade 1}: {-X pontos} — {justificativa}
• {Penalidade 2}: {-X pontos} — {justificativa}

SCORE FINAL (com penalidades): {SF}/100

───────────────────────────────────────────────────────────────
VIESES COGNITIVOS DETECTADOS:
───────────────────────────────────────────────────────────────

⚠️ VIÉS: {Nome do viés}
   Onde: {Onde apareceu no raciocínio}
   Sinal: {Qual sinal disparou a detecção}
   Impacto: {Como afeta a decisão}
   Pergunta: {Pergunta de detecção do catálogo}

⚠️ VIÉS: {Nome do viés 2}
   ...

(Se nenhum viés detectado: "✅ Nenhum viés cognitivo significativo detectado")

───────────────────────────────────────────────────────────────
GAPS CRÍTICOS IDENTIFICADOS:
───────────────────────────────────────────────────────────────

1. {Gap 1} — Severidade: {alta/média/baixa}
   Impacto: {Como compromete a decisão}
   Sugestão: {Como endereçar}

2. {Gap 2} — Severidade: {alta/média/baixa}
   ...

───────────────────────────────────────────────────────────────
RECOMENDAÇÃO: {APROVAR / REVISAR / REJEITAR}
───────────────────────────────────────────────────────────────

Justificativa: {1-3 frases explicando a recomendação}

{Se REVISAR}: Pontos que precisam ser endereçados antes de prosseguir:
  1. {Ponto 1}
  2. {Ponto 2}

{Se REJEITAR}: O processo precisa ser reiniciado porque:
  {Razão fundamental}

═══════════════════════════════════════════════════════════════
```
