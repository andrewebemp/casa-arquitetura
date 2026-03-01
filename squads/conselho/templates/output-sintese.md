# Template — Sintetizador 🔮

## Instruções de Uso
O Sintetizador preenche este template integrando TODAS as perspectivas anteriores.
Se confiança < 60%: usar o formato INCONCLUSIVO no final deste template.
NÃO ignorar críticas do Advogado para inflar confiança.

---

## Output Format

```
═══════════════════════════════════════════════════════════════
SÍNTESE FINAL DO CONSELHO 🔮
═══════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────
DECISÃO RECOMENDADA
───────────────────────────────────────────────────────────────

{Recomendação clara e acionável em 2-4 frases.
 Deve ser inequívoca: SIM fazer X, NÃO fazer Y, ou ADIAR até Z.}

───────────────────────────────────────────────────────────────
MODIFICAÇÕES INCORPORADAS
───────────────────────────────────────────────────────────────

DO CRÍTICO:
• Gap "{gap}": Endereçado com {ação}
• Gap "{gap}": Justificado porque {razão}
• Viés "{viés}": Mitigado com {ação}

DO ADVOGADO:
• Premissa frágil: Mitigada com {ação de validação}
• Risco não discutido: {aceito/mitigado} porque {razão}
• Alternativa ignorada: {incorporada/descartada} porque {razão}
• Pré-mortem: Endereçado com {salvaguarda}

DOS PARECERES CROSS-SQUAD (se houver):
• @{agente} ({squad}): {Contribuição principal incorporada}
• @{agente} ({squad}): {Contribuição principal incorporada}

───────────────────────────────────────────────────────────────
CONFIANÇA DECOMPOSTA
───────────────────────────────────────────────────────────────

┌──────────────────────┬───────────┬────────────────────────┐
│ DIMENSÃO             │ CONFIANÇA │ JUSTIFICATIVA          │
├──────────────────────┼───────────┼────────────────────────┤
│ Dados / Informação   │ {X}%      │ {por que este nível}   │
│ Modelo / Raciocínio  │ {X}%      │ {por que este nível}   │
│ Execução / Viabilidade│ {X}%     │ {por que este nível}   │
├──────────────────────┼───────────┼────────────────────────┤
│ CONFIANÇA GERAL      │ {X}%      │ Média ponderada        │
└──────────────────────┴───────────┴────────────────────────┘

CÁLCULO:
  Base (consenso do debate):     {X}%
  Ajuste do Crítico (score):     {+/- Y}%
  Ajuste do Advogado (riscos):   {+/- Z}%
  ──────────────────────────────
  TOTAL:                         {X}%

───────────────────────────────────────────────────────────────
MATRIZ DE STAKEHOLDERS
───────────────────────────────────────────────────────────────

┌─────────────────┬────────────┬─────────────────────────────┐
│ STAKEHOLDER     │ IMPACTO    │ CONSIDERAÇÃO                │
├─────────────────┼────────────┼─────────────────────────────┤
│ {Stakeholder 1} │ {+/-/neutro}│ {como é afetado}           │
│ {Stakeholder 2} │ {+/-/neutro}│ {como é afetado}           │
│ {Stakeholder 3} │ {+/-/neutro}│ {como é afetado}           │
└─────────────────┴────────────┴─────────────────────────────┘

───────────────────────────────────────────────────────────────
RISCOS RESIDUAIS
───────────────────────────────────────────────────────────────

• RISCO: {Risco 1}
  Mitigação: {ação concreta}
  Responsável: {quem}
  Prazo: {quando}

• RISCO: {Risco 2 — NÃO MITIGÁVEL}
  Aceito porque: {justificativa}
  Monitorar: {métrica ou sinal}

───────────────────────────────────────────────────────────────
PRÓXIMOS PASSOS
───────────────────────────────────────────────────────────────

1. {Ação} — Responsável: {quem} — Prazo: {quando}
2. {Ação} — Responsável: {quem} — Prazo: {quando}
3. {Ação} — Responsável: {quem} — Prazo: {quando}

───────────────────────────────────────────────────────────────
CRITÉRIOS DE REVERSÃO
───────────────────────────────────────────────────────────────

SE {condição 1} ENTÃO {ação — pausar/reverter/escalonar}
SE {condição 2} ENTÃO {ação — pausar/reverter/escalonar}
SE {condição 3} ENTÃO {ação — pausar/reverter/escalonar}

═══════════════════════════════════════════════════════════════
```

---

## Formato INCONCLUSIVO (se confiança < 60%)

```
═══════════════════════════════════════════════════════════════
⚠️ CONSELHO: DECISÃO INCONCLUSIVA
═══════════════════════════════════════════════════════════════

CONFIANÇA: {X}% — ABAIXO DO THRESHOLD DE 60%

TIPO DE INCERTEZA:
[ ] Dados insuficientes
[ ] Conflito irresolvível entre perspectivas
[ ] Fora do escopo de conhecimento disponível
[ ] Risco alto demais sem mitigação viável

───────────────────────────────────────────────────────────────
OPÇÕES PARA DECISÃO HUMANA:
───────────────────────────────────────────────────────────────

OPÇÃO A: {descrição}
  Trade-off: {ganhos} vs {perdas}
  Favorecida por: {quem/qual perspectiva}

OPÇÃO B: {descrição}
  Trade-off: {ganhos} vs {perdas}
  Favorecida por: {quem/qual perspectiva}

OPÇÃO C (se aplicável): {descrição}
  Trade-off: {ganhos} vs {perdas}

───────────────────────────────────────────────────────────────
O QUE FALTA PARA DECIDIR:
───────────────────────────────────────────────────────────────

1. {Informação ou validação necessária}
2. {Informação ou validação necessária}

⚠️ Este caso requer DECISÃO HUMANA.
   O Conselho apresenta as opções, mas não recomenda.

═══════════════════════════════════════════════════════════════
```
