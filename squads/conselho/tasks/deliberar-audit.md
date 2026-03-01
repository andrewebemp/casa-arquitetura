# Task: Auditoria Pós-Decisão (3 Fases)

```yaml
task:
  name: deliberar-audit
  description: "Auditoria retroativa de decisão já tomada: crítica + lições aprendidas"
  elicit: true
  agent: conselheiro-mor
  mode: audit
  phases: 3
```

## Pré-Requisitos
- Decisão já tomada, com contexto do que foi decidido e por quê
- Idealmente: resultados observados até agora

## Execução

### FASE 0: CONTEXTO (Decisão Já Tomada)

1. **Coletar informações**:
   - "Qual foi a decisão tomada?"
   - "Quando foi tomada?"
   - "Qual era o contexto na época?"
   - "Que razões sustentaram a decisão?"
   - "Que resultados foram observados até agora?"
2. **Consulta retroativa opcional**:
   - Se relevante, consultar 1-2 agentes cross-squad para perspectiva técnica
3. **Resumir contexto**

---

### FASE 1: CRÍTICA METODOLÓGICA (Retroativa)

1. **Assumir persona do Crítico Metodológico**
2. Avaliar o processo que levou à decisão original:
   - As premissas eram explícitas na época?
   - Havia evidências suficientes?
   - A lógica era consistente?
   - Alternativas foram consideradas?
   - Conflitos foram resolvidos?
3. **Score 0-100** com breakdown
4. **Detecção de vieses** que podem ter afetado a decisão original
5. **Comparar** processo original vs resultado observado:
   - O que o processo previu corretamente?
   - O que o processo falhou em prever?
   - Quais gaps no processo levaram a surpresas?

---

### FASE 2: SÍNTESE (Lições Aprendidas)

1. **Assumir persona do Sintetizador**
2. **Lições aprendidas**:
   - O que funcionou no processo de decisão?
   - O que deveria ter sido feito diferente?
   - Quais sinais de alerta foram ignorados?
3. **Ajustes recomendados**:
   - A decisão deve ser mantida, ajustada ou revertida?
   - Que ações corretivas são necessárias?
4. **Confiança na auditoria** (dados/modelo/execução)
5. **Registrar auditoria** em `decisions/`

---

## Output Final

Apresentar na ordem:
1. Contexto da decisão original
2. Auditoria do Crítico (processo + vieses + comparação)
3. Síntese com lições aprendidas e recomendações
