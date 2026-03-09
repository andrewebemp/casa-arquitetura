# Checklist: Spatial Analysis Validation

> Usado apos: analyze-photo.md (analise espacial de foto)
> Agente responsavel: @spatial-analyst
> Nivel: blocking
> Quality Gate: QG-DA-002 (croqui approval)

---

## Criterios Obrigatorios (todos devem passar)

- [ ] **Dimensoes plausiveis** - As dimensoes estimadas (largura, comprimento, pe-direito) sao fisicamente plausiveis para o tipo de comodo identificado (ex: sala nao pode ter 1m de largura, pe-direito nao pode ser 10m)
- [ ] **Elementos estruturais identificados** - Todos os elementos estruturais visiveis na foto foram detectados e catalogados (paredes, janelas, portas, colunas, vigas, desniveis)
- [ ] **Croqui corresponde a foto** - O croqui ASCII gerado representa fielmente a planta baixa do ambiente conforme visivel na foto (posicao de paredes, aberturas, elementos fixos)
- [ ] **Medicoes consistentes** - As medicoes internas sao matematicamente consistentes (area = largura x comprimento, perimetro coerente com dimensoes, volume = area x pe-direito)
- [ ] **Orientacao correta** - A orientacao/posicionamento relativo dos elementos no croqui corresponde a perspectiva da foto (esquerda/direita, frente/fundo)
- [ ] **Tipo de comodo correto** - O tipo de comodo foi corretamente identificado (sala, quarto, cozinha, etc.)
- [ ] **Mapas de condicionamento gerados** - Depth map, edge map (canny) e segmentation map foram gerados e estao acessiveis

---

## Criterios de Qualidade (score 0-3 cada)

| Criterio | 0 (Ausente) | 1 (Basico) | 2 (Bom) | 3 (Excelente) |
|----------|-------------|-----------|---------|----------------|
| **Precisao dimensional** | Erro > 30%, medidas implausíveis | Erro 20-30%, ordem de grandeza correta | Erro 10-20%, medidas proximas do real | Erro < 10%, medidas calibradas com referencia confiavel |
| **Completude da deteccao** | < 50% dos elementos detectados | 50-70% dos elementos detectados | 70-90% dos elementos detectados | > 90% dos elementos detectados, incluindo detalhes sutis |
| **Qualidade do croqui** | Croqui ilegivel ou muito impreciso | Croqui legivel mas com erros de proporcao | Croqui proporcional com legendas claras | Croqui preciso, proporcional, com legendas, escala e zonas sugeridas |
| **Identificacao de restricoes** | Restricoes para staging nao identificadas | Algumas restricoes identificadas mas incompletas | Restricoes principais identificadas com justificativa | Todas as restricoes mapeadas com impacto no staging documentado |
| **Qualidade dos mapas** | Mapas nao gerados ou corrompidos | Mapas gerados mas com artefatos visiveis | Mapas limpos, bordas adequadas | Mapas de alta qualidade, depth suave, segmentacao precisa, edges limpos |
| **Sugestoes de layout** | Sem sugestoes de zonas ou layout | Sugestao generica sem considerar o espaco | Sugestoes adequadas ao espaco com 2-3 zonas | Sugestoes detalhadas com zonas, areas em m2, e pontos focais aproveitados |
| **Calibracao de referencia** | Nenhuma referencia utilizada para calibrar | Referencia utilizada mas com baixa confianca | Referencia clara (porta, janela standard) com boa confianca | Multiplas referencias cruzadas com margem de erro documentada |

---

## Validacao do Protocolo 3-Turn

| Turno | Status | Verificacao |
|-------|--------|-------------|
| **Turno 1 (Draft)** | {turn_1_status} | Croqui inicial gerado e apresentado ao usuario |
| **Turno 2 (Corrections)** | {turn_2_status} | Correcoes do usuario aplicadas ao croqui |
| **Turno 3 (Final)** | {turn_3_status} | Croqui final confirmado pelo usuario |

- [ ] Protocolo 3-turn foi seguido (draft -> correcoes -> confirmacao)
- [ ] Correcoes do usuario foram incorporadas no croqui final
- [ ] Confirmacao explicita do usuario obtida antes do handoff

---

## Threshold

- **Minimo para aprovar:** 10/21 no score de qualidade E todos os criterios obrigatorios passando E confirmacao do usuario no protocolo 3-turn
- **Score maximo possivel:** 21/21 (7 criterios x 3 pontos)
- **Condicao de veto:** Qualquer criterio obrigatorio falhando OU usuario rejeitou o croqui no turno 3 OU mapas de condicionamento nao gerados

### Classificacao

| Score | Classificacao | Acao |
|-------|--------------|------|
| 19-21 | Excelente | Aprovar handoff imediato para @staging-architect |
| 15-18 | Bom | Aprovar handoff com nota de confianca |
| 10-14 | Aceitavel | Aprovar handoff, @staging-architect deve compensar imprecisoes |
| 7-9 | Insuficiente | Solicitar nova analise com foto adicional ou informacoes do usuario |
| 0-6 | Reprovado | Rejeitar, solicitar foto melhor ou medidas manuais do usuario |

---

## Correcao

If failed:

1. **Se "dimensoes plausiveis" falhou:**
   - Verificar se o modelo de profundidade (DUSt3R/Depth Anything) convergiu corretamente
   - Solicitar ao usuario uma referencia dimensional (ex: "a porta tem 2.10m de altura?")
   - Recalibrar todas as medidas com base na referencia fornecida
   - Re-executar analise com calibracao manual

2. **Se "elementos estruturais" falhou:**
   - Verificar se a foto tem resolucao suficiente (minimo 1024x768)
   - Solicitar foto adicional de outro angulo se elementos estao ocultos
   - Executar segmentacao com modelo SAM para detectar elementos perdidos
   - Adicionar elementos manualmente ao croqui baseado em informacao do usuario

3. **Se "croqui nao corresponde" falhou:**
   - Retornar ao turno 1 do protocolo 3-turn
   - Apresentar croqui revisado ao usuario com areas de incerteza marcadas
   - Solicitar correcoes especificas do usuario

4. **Se "medicoes inconsistentes" falhou:**
   - Recalcular area, perimetro e volume a partir das dimensoes base
   - Verificar se ha paredes nao-ortogonais que justifiquem a inconsistencia
   - Ajustar dimensoes para manter consistencia matematica

5. **Se mapas de condicionamento nao gerados:**
   - Verificar disponibilidade do GPU provider
   - Re-executar pipeline de condicionamento (depth + canny + segmentation)
   - Se falha persistir, acionar @pipeline-optimizer para roteamento alternativo

6. **Escalacao:**
   - Apos 2 tentativas falhadas: solicitar foto adicional de angulo complementar
   - Apos 3 tentativas: oferecer ao usuario opcao de inserir medidas manualmente
   - Se usuario inserir medidas: validar consistencia e gerar croqui manual

---

*Checklist v1.0.0 | Quality Gate QG-DA-002 | DecorAI Squad*
