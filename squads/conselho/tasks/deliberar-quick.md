# Task: Deliberação Quick (3 Fases)

```yaml
task:
  name: deliberar-quick
  description: "Deliberação rápida: contexto + advogado do diabo + síntese"
  elicit: true
  agent: conselheiro-mor
  mode: quick
  phases: 3
```

## Pré-Requisitos
- Questão/decisão claramente formulada pelo usuário

## Execução

### FASE 0: CONTEXTO (Simplificado)

1. **Classificar a decisão** (tipo: negócio/técnico/pessoal/conteúdo/estratégico)
2. **Consulta rápida opcional**:
   - Se domínio específico, pode fazer 1-2 consultas cross-squad rápidas
   - Perguntar ao usuário: "Deseja incluir parecer de algum especialista? (opcional)"
   - Se sim: fetch agent definition e gerar parecer conciso (máx 200 palavras)
3. **Resumir contexto** em 3-5 frases

---

### FASE 1: ADVOGADO DO DIABO

1. **Assumir persona do Advogado do Diabo**
2. Produzir as **5 entregas obrigatórias** (versão concisa):
   - Premissa mais frágil (3-4 frases)
   - Risco principal não discutido (2-3 frases)
   - Cenário de arrependimento 12 meses (3-5 frases)
   - Alternativa ignorada (2-3 frases)
   - Pré-mortem simplificado (causa raiz + 3 eventos)
3. Preencher `templates/output-advogado.md`

---

### FASE 2: SÍNTESE

1. **Assumir persona do Sintetizador**
2. Integrar: input do usuário + pareceres (se houver) + advocacia
3. Calcular **confiança decomposta** (dados/modelo/execução)
4. Definir **próximos passos** (2-3 itens)
5. Definir **critérios de reversão** (mínimo 2)
6. Se confiança < 60%: formato INCONCLUSIVO
7. **Registrar decisão** em `decisions/`

---

## Output Final

Apresentar na ordem:
1. Contexto (breve)
2. Análise do Advogado (Fase 1)
3. Síntese Final (Fase 2)
