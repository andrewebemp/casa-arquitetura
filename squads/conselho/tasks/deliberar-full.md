# Task: Deliberação Full (5 Fases)

```yaml
task:
  name: deliberar-full
  description: "Deliberação completa com pareceres cross-squad, crítica metodológica, advocacia do diabo e síntese final"
  elicit: true
  agent: conselheiro-mor
  mode: full
  phases: 5
```

## Pré-Requisitos
- Questão/decisão claramente formulada pelo usuário

## Execução

### FASE 0: CONTEXTO & CONVOCAÇÃO

**Objetivo**: Classificar a decisão, determinar configuração e convocar consultores.

1. **Classificar a decisão**:
   - Ler `data/tipos-decisao.yaml`
   - Identificar tipo: negócio / técnico / pessoal / conteúdo / estratégico
   - Apresentar ao usuário: "Identifiquei esta como uma decisão de **{tipo}**. Correto?"

2. **Confirmar modo Full**:
   - Explicar brevemente: "Modo Full = 5 fases completas com pareceres cross-squad"
   - Se usuário preferir outro modo, redirecionar para task correspondente

3. **Convocar consultores cross-squad**:
   - Ler `data/consulta-cross-squad.yaml`
   - Baseado no tipo de decisão, sugerir 2-4 agentes relevantes
   - Formato de apresentação:
     ```
     Consultores sugeridos para esta deliberação:
     1. @{agente} ({squad}) — {justificativa}
     2. @{agente} ({squad}) — {justificativa}
     3. @{agente} ({squad}) — {justificativa}

     Deseja adicionar, remover ou aprovar esta lista?
     ```
   - **Esperar aprovação do usuário** (elicit: true)

4. **Output da Fase 0**: Configuração aprovada (tipo + modo + consultores)

---

### FASE 1: PARECERES & DEBATE

**Objetivo**: Coletar pareceres técnicos dos consultores convocados.

Para CADA consultor aprovado:

1. **Resolver fonte do agente**:
   - AIOS Core: Ler `.claude/commands/AIOS/agents/{agent}.md`
   - Squad local: Ler `squads/{squad}/agents/{agent}.md`
   - Squad externo: `gh api repos/andrewebemp/squads-criados/contents/{squad}/agents/{agent}.md --jq '.content' | base64 -d`

2. **Formular consulta contextualizada**:
   ```
   CONSULTA DO CONSELHO:
     Questão: {decisão em análise}
     Contexto: {contexto fornecido pelo usuário}
     Agente consultado: {nome} ({squad})
     Aspecto específico: {o que se espera deste agente}
     Formato: Posição clara + evidências + riscos
     Limite: Máximo 500 palavras
   ```

3. **Gerar parecer** (assumindo a persona do agente com base no seu DNA/definition):
   ```
   PARECER DE {AGENTE} ({SQUAD}):
     Posição: {favorável/desfavorável/neutra} — {resumo}
     Evidências:
       1. {evidência}
       2. {evidência}
     Riscos no meu domínio:
       - {risco}
     Recomendação: {ação concreta}
     Confiança: {X}%
   ```

4. **Se múltiplos pareceres**: Identificar convergências e divergências

5. **Output da Fase 1**: Todos os pareceres + síntese do debate

---

### FASE 2: CRÍTICA METODOLÓGICA

**Objetivo**: Avaliar a qualidade do processo de raciocínio.

1. **Assumir persona do Crítico Metodológico** (`agents/critico-metodologico.md`)
2. Carregar `data/scoring-framework.yaml` e `data/vieses-cognitivos.yaml`
3. Avaliar TODO o material produzido (pareceres + argumentos do usuário)
4. Pontuar cada um dos 5 critérios (0-20 cada)
5. Aplicar penalidades se aplicável
6. Verificar ativamente cada viés do catálogo
7. Preencher `templates/output-critico.md` COMPLETO
8. **Gate**: Se score < 50, alertar:
   ```
   ⚠️ Score: {X}/100 — ABAIXO DO THRESHOLD DE REJEIÇÃO
   O processo tem falhas fundamentais. Deseja:
   1. Continuar mesmo assim
   2. Pausar e endereçar os gaps
   ```

---

### FASE 3: ADVOGADO DO DIABO

**Objetivo**: Atacar a decisão e encontrar vulnerabilidades.

1. **Assumir persona do Advogado do Diabo** (`agents/advogado-do-diabo.md`)
2. Analisar: decisão proposta + pareceres + resultado do Crítico
3. Produzir as **5 entregas obrigatórias**:
   - Premissa mais frágil (com probabilidade)
   - Risco principal não discutido (com probabilidade e impacto)
   - Cenário de arrependimento 12 meses (narrativa realista)
   - Alternativa ignorada (com trade-offs)
   - Pré-mortem (causa raiz + sequência de eventos)
4. Preencher `templates/output-advogado.md` COMPLETO

---

### FASE 4: SÍNTESE FINAL

**Objetivo**: Integrar todas as perspectivas em recomendação final.

1. **Assumir persona do Sintetizador** (`agents/sintetizador.md`)
2. Integrar: pareceres (Fase 1) + crítica (Fase 2) + advocacia (Fase 3)
3. Para cada gap do Crítico: endereçar ou justificar
4. Para cada vulnerabilidade do Advogado: mitigar ou aceitar
5. Calcular **confiança decomposta**:
   - Dados/Informação: X%
   - Modelo/Raciocínio: X%
   - Execução/Viabilidade: X%
   - Geral: média ponderada (35/35/30)
6. Construir **matriz de stakeholders**
7. Definir **riscos residuais** com mitigações
8. Definir **próximos passos** com responsáveis e prazos
9. Definir **critérios de reversão** (mínimo 2)
10. Preencher `templates/output-sintese.md` COMPLETO
11. **Se confiança < 60%**: Usar formato INCONCLUSIVO
12. **Registrar decisão**: Preencher `templates/registro-decisao.md` e salvar em `decisions/`

---

## Output Final

Apresentar ao usuário a deliberação completa na seguinte ordem:
1. Pareceres cross-squad (Fase 1)
2. Avaliação do Crítico (Fase 2)
3. Análise do Advogado (Fase 3)
4. Síntese Final (Fase 4)
