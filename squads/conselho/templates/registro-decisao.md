# Template — Registro de Decisão

## Instruções de Uso
Este template é preenchido automaticamente ao final de cada deliberação.
Salvar em `squads/conselho/decisions/YYYY-MM-DD-{slug}.md`

---

## Output Format

```markdown
# Decisão: {Título curto da decisão}

**Data**: {YYYY-MM-DD}
**Modo**: {Full / Quick / Audit}
**Tipo**: {Negócio / Técnico / Pessoal / Conteúdo / Estratégico}
**Questão original**: "{A pergunta/decisão submetida ao Conselho}"

## Consultores Convocados

| Fonte | Agente | Squad | Contribuição |
|-------|--------|-------|-------------|
| {AIOS/Local/Externo} | {nome} | {squad} | {resumo em 1 frase} |

## Resultado

**Decisão**: {Recomendação do Sintetizador — ou INCONCLUSIVA}
**Confiança**: {X}% (Dados: {X}% | Modelo: {X}% | Execução: {X}%)
**Score do Crítico**: {X}/100

## Resumo do Processo

### Crítico Metodológico
- Score: {X}/100
- Recomendação: {APROVAR/REVISAR/REJEITAR}
- Vieses detectados: {lista ou "nenhum"}
- Gaps principais: {lista}

### Advogado do Diabo
- Premissa frágil: {resumo}
- Risco não discutido: {resumo}
- Alternativa ignorada: {resumo}

### Sintetizador
- Decisão: {resumo}
- Riscos residuais: {lista}
- Critérios de reversão: {lista}

## Próximos Passos
1. {Ação} — {responsável} — {prazo}

## Follow-up
<!-- Preencher quando houver acompanhamento -->
- [ ] Verificar critérios de reversão em {data}
- [ ] Avaliar resultado em {data}

**Resultado real**: {Preencher posteriormente}
**Lições aprendidas**: {Preencher posteriormente}
```
