# Checklist: Style Fidelity Check

> Usado apos: generate-staging.md (geracao de staging com estilo aplicado)
> Agente responsavel: @interior-strategist
> Nivel: blocking
> Relacionado: tmpl-style-guide.yaml, Quality Gate QG-DA-003

---

## Criterios Obrigatorios (todos devem passar)

- [ ] **Cores correspondem a paleta** - As cores primarias, secundarias e de destaque no render correspondem aos valores hex definidos no style guide (tolerancia: deltaE < 10 para cores primarias, deltaE < 15 para secundarias)
- [ ] **Materiais corretos** - Os materiais visiveis no render (madeira, pedra, tecido, metal, etc.) correspondem aos especificados no style guide para o estilo selecionado
- [ ] **Mobiliario apropriado** - As pecas de mobiliario inseridas sao apropriadas para o estilo (ex: nao colocar movel rustico em estilo minimalista, nao colocar movel industrial em estilo classico)
- [ ] **Iluminacao compativel** - A temperatura de cor e o mood de iluminacao correspondem ao especificado no style guide (quente/fria/neutra, intensidade adequada)
- [ ] **Coerencia geral do estilo** - O render transmite o "feeling" correto do estilo (ex: minimalista deve parecer clean e despojado, luxo deve parecer sofisticado e premium)

---

## Criterios de Qualidade (score 0-3 cada)

| Criterio | 0 (Ausente) | 1 (Basico) | 2 (Bom) | 3 (Excelente) |
|----------|-------------|-----------|---------|----------------|
| **Aderencia a paleta de cores** | Cores completamente fora da paleta definida | Cor primaria presente mas secundarias e accents erradas | Cores primarias e secundarias corretas, accents aproximados | Paleta perfeita incluindo proporcoes de uso (ex: 50% base, 30% primaria, 20% accent) |
| **Fidelidade dos materiais** | Materiais nao correspondem ao style guide | Material principal correto mas texturas/acabamentos errados | Materiais e texturas corretos na maioria das superficies | Materiais perfeitos com acabamentos fieis (polido, acetinado, fosco conforme spec) |
| **Adequacao do mobiliario** | Moveis de estilo completamente diferente | Estilo aproximado mas com pecas destoantes | Moveis no estilo correto, proporcoes adequadas | Moveis perfeitamente alinhados, incluindo detalhes como pes, bracos e formas |
| **Harmonia de iluminacao** | Iluminacao contradiz o mood do estilo | Temperatura de cor aproximada mas intensidade errada | Temperatura e intensidade corretas, camadas de luz presentes | Iluminacao perfeita com todas as camadas MEPI (geral, tarefa, accent, decorativa) |
| **Elementos decorativos** | Decoracao ausente ou incongruente com o estilo | Poucos elementos decorativos, escolha generica | Decoracao adequada ao estilo com variedade | Decoracao rica, curada, que completa o estilo (plantas, livros, arte, texteis) |
| **Proporcao e equilibrio** | Espaco visualmente desequilibrado ou superlotado | Equilibrio basico mas com areas vazias ou sobrecarregadas | Boa distribuicao de elementos no espaco | Composicao equilibrada seguindo principios de design (regra dos tercos, pontos focais) |
| **Contexto brasileiro** | Nenhuma referencia ao mercado/gosto brasileiro | Elementos genericos sem identidade local | Alguns elementos com referencia brasileira | Adaptacao completa ao contexto BR (madeiras brasileiras, plantas tropicais, proporcoes de apartamento BR) |

---

## Validacao por Estilo

### Checklist Especifico por Preset

**Moderno:**
- [ ] Linhas retas e geometricas predominam
- [ ] Paleta neutra com accents pontuais
- [ ] Materiais: madeira clara, metal escovado, vidro
- [ ] Mobiliario mid-century ou contemporaneo

**Industrial:**
- [ ] Elementos de metal/ferro expostos
- [ ] Tijolos aparentes ou concreto visivel
- [ ] Paleta cinza/preto/marrom com accents metalicos
- [ ] Luminarias estilo pendente industrial

**Minimalista:**
- [ ] Poucos elementos, espaco "respirando"
- [ ] Cores neutras (branco, cinza, bege)
- [ ] Moveis com linhas puras, sem ornamentacao
- [ ] Ausencia de clutter visual

**Classico:**
- [ ] Molduras, simetria, detalhes ornamentais
- [ ] Cores ricas (azul marinho, vinho, dourado)
- [ ] Moveis com curvas, pes torneados
- [ ] Tecidos nobres (veludo, seda, linho)

**Escandinavo:**
- [ ] Predominancia de branco e madeira clara
- [ ] Funcionalidade evidente
- [ ] Texturas aconchegantes (la, tricot)
- [ ] Plantas e elementos naturais

**Rustico:**
- [ ] Madeira como material dominante
- [ ] Texturas naturais e organicas
- [ ] Cores terrosas (marrom, bege, verde oliva)
- [ ] Elementos artesanais ou vintage

**Tropical:**
- [ ] Plantas exuberantes e folhagens
- [ ] Paleta verde + madeira + cores vibrantes
- [ ] Materiais naturais (rattan, bambu, fibras)
- [ ] Sensacao de frescor e natureza

**Contemporaneo:**
- [ ] Mix eclético com coerência
- [ ] Materiais modernos combinados com tradicionais
- [ ] Cores sofisticadas com contraste
- [ ] Pecas de design statement

**Boho:**
- [ ] Texturas diversas e sobrepostas
- [ ] Cores quentes e terrosas com accents vibrantes
- [ ] Macrame, tecidos artesanais, tapetes
- [ ] Visual "curado mas casual"

**Luxo:**
- [ ] Materiais premium (marmore, couro, metais dourados)
- [ ] Pecas de designer ou alta decoracao
- [ ] Paleta sofisticada com dourado/champagne
- [ ] Iluminacao dramatica e detalhes premium

---

## Threshold

- **Minimo para aprovar:** 10/21 no score de qualidade E todos os criterios obrigatorios passando
- **Score maximo possivel:** 21/21 (7 criterios x 3 pontos)
- **Condicao de veto:** Qualquer criterio obrigatorio falhando OU estilo completamente errado (ex: render minimalista quando pedido era classico)

### Classificacao

| Score | Classificacao | Acao |
|-------|--------------|------|
| 19-21 | Excelente | Estilo perfeitamente aplicado, aprovar |
| 15-18 | Bom | Estilo bem aplicado, aprovar |
| 10-14 | Aceitavel | Estilo reconhecivel, aprovar com sugestao de refinamento |
| 7-9 | Insuficiente | Estilo impreciso, solicitar ajustes de prompt ao @interior-strategist |
| 0-6 | Reprovado | Estilo incorreto, re-gerar com style guide revisado |

---

## Correcao

If failed:

1. **Se cores nao correspondem:**
   - Verificar se o prompt positivo inclui os tokens de cor corretos do style guide
   - Adicionar color reference image como IP-Adapter input
   - Ajustar prompt negativo para excluir cores indesejadas
   - Se persistir: solicitar @interior-strategist para revisar paleta e gerar novo style prompt

2. **Se materiais incorretos:**
   - Verificar tokens de textura no prompt (texture_prompt_token do style guide)
   - Aumentar especificidade do prompt para materiais (ex: "natural freijo wood" ao inves de apenas "wood")
   - Se texturas borradas: aumentar steps de inferencia ou CFG scale
   - Acionar @interior-strategist para revisar material palette

3. **Se mobiliario inapropriado:**
   - Revisar style_keywords no style guide para cada peca
   - Verificar se escala esta condizente com o espaco (via @spatial-analyst)
   - Substituir pecas genericas por pecas especificas do estilo
   - Adicionar exclusoes no prompt negativo (ex: "no rustic furniture" para estilo moderno)

4. **Se iluminacao incompativel:**
   - Verificar preset IC-Light utilizado vs recomendado no style guide
   - Ajustar temperatura de cor no pos-processamento
   - Se mood errado: re-processar com IC-Light e preset correto
   - Acionar @staging-architect para enhance-lighting com parametros do style guide

5. **Se coerencia geral falhou:**
   - Re-avaliar style guide completamente com @interior-strategist
   - Considerar usar reference image para guiar o estilo (IP-Adapter)
   - Gerar 3 variacoes com parametros diferentes e escolher a melhor
   - Se necessario: ajustar cfg_scale (mais alto = mais aderente ao prompt)

---

*Checklist v1.0.0 | Style Fidelity | DecorAI Squad*
