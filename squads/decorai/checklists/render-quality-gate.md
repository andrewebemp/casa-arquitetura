# Checklist: Render Quality Gate

> Usado apos: wf-staging-pipeline.yaml (fase de geração)
> Agente responsavel: @visual-quality-engineer
> Nivel: blocking
> Quality Gate: QG-DA-003

---

## Criterios Obrigatorios (todos devem passar)

- [ ] **Fotorrealismo** - O render e indistinguivel de uma foto profissional em primeira inspeção visual (sem aparencia de CGI, ilustracao ou cartoon)
- [ ] **Integridade estrutural** - Paredes, piso, teto e elementos fixos da foto original estao preservados corretamente (sem distorcoes, warping ou desaparecimento)
- [ ] **Consistencia de estilo** - O estilo aplicado corresponde ao style guide selecionado (@interior-strategist) em cores, materiais e mobiliario
- [ ] **Iluminacao coerente** - Sombras e iluminacao dos elementos inseridos sao consistentes com as fontes de luz do ambiente original (direcao, intensidade, temperatura)
- [ ] **Ausencia de artefatos criticos** - Nenhum artefato de severidade "critico" detectado (floating furniture, perspective break, scale error grave)
- [ ] **Resolucao minima** - O render atende a resolucao minima do tier do usuario (Explorer: 720p, Pro: 1080p, Enterprise: 4K)
- [ ] **Perspectiva correta** - Linhas de perspectiva dos elementos inseridos convergem para o mesmo ponto de fuga da foto original

---

## Criterios de Qualidade (score 0-3 cada)

| Criterio | 0 (Ausente) | 1 (Basico) | 2 (Bom) | 3 (Excelente) |
|----------|-------------|-----------|---------|----------------|
| **Naturalidade das texturas** | Texturas borradas, repetitivas ou inexistentes | Texturas visiveis mas com repeticao perceptivel | Texturas naturais com detalhes adequados | Texturas fotorrealistas, detalhadas, sem repeticao |
| **Escala dos moveis** | Moveis com escala claramente errada (muito grandes ou pequenos) | Escala aproximada mas com inconsistencias visiveis | Escala correta na maioria dos elementos | Escala perfeita em todos os elementos, proporcional ao ambiente |
| **Qualidade das sombras** | Sombras ausentes ou completamente erradas | Sombras presentes mas com direcao ou intensidade inconsistente | Sombras coerentes com a iluminacao, pequenos ajustes necessarios | Sombras naturais, suaves, com oclusao ambiental realista |
| **Transicao piso/moveis** | Moveis flutuando visivelmente ou atravessando o piso | Contato com piso visivel mas com artefatos nas bordas | Transicao limpa com pequena imprecisao na borda | Transicao perfeita, com reflexo sutil no piso quando aplicavel |
| **Coerencia de cores** | Cores completamente destoantes do ambiente | Paleta aproximada mas com elementos que destoam | Cores harmonicas com o ambiente e entre si | Paleta perfeitamente integrada, cores se complementam |
| **Profundidade e composicao** | Elementos achatados, sem senso de profundidade | Alguma profundidade mas composicao desequilibrada | Boa profundidade e composicao, ambiente convidativo | Composicao fotogenica, profundidade natural, sensacao de "quero morar aqui" |
| **Detalhes decorativos** | Sem detalhes decorativos ou detalhes grotescos | Poucos detalhes, ambiente parece vazio ou generico | Detalhes adequados (almofadas, livros, plantas) | Detalhes ricos e realistas que completam o ambiente naturalmente |

---

## Metricas Automatizadas

| Metrica | Valor Medido | Threshold Minimo | Threshold Bom | Status |
|---------|-------------|------------------|---------------|--------|
| FID Score | `{fid}` | < 80 (aprovado) | < 50 (bom), < 30 (excelente) | {status} |
| SSIM | `{ssim}` | > 0.75 (aprovado) | > 0.85 (bom), > 0.90 (excelente) | {status} |
| LPIPS | `{lpips}` | < 0.35 (aprovado) | < 0.20 (bom), < 0.10 (excelente) | {status} |
| CLIP Score | `{clip}` | > 0.25 (aprovado) | > 0.30 (bom), > 0.35 (excelente) | {status} |
| PSNR | `{psnr}` dB | > 25 dB | > 30 dB (bom), > 35 dB (excelente) | {status} |

---

## Threshold

- **Minimo para aprovar:** 7/10 no score de qualidade (criterios 0-3) E todos os criterios obrigatorios passando
- **Score maximo possivel:** 21/21 (7 criterios x 3 pontos)
- **Condicao de veto:** Qualquer criterio obrigatorio falhando OU qualquer artefato de severidade "critico" OU FID > 80 OU SSIM < 0.75

### Classificacao

| Score | Classificacao | Acao |
|-------|--------------|------|
| 19-21 | Excelente | Aprovar e destacar como showcase |
| 15-18 | Bom | Aprovar para entrega |
| 10-14 | Aceitavel | Aprovar com recomendacao de refinamento |
| 7-9 | Minimo | Aprovar condicionalmente, sugerir melhoria |
| 0-6 | Reprovado | Rejeitar, acionar correcao automatica |

---

## Correcao

If failed:

1. **Se criterio obrigatorio falhou:**
   - Identificar qual criterio especifico falhou
   - Acionar @staging-architect para re-render com parametros ajustados
   - Se "integridade estrutural" falhou: aumentar peso do ControlNet depth (0.85 -> 0.95)
   - Se "iluminacao" falhou: acionar IC-Light com preset corrigido
   - Se "artefato critico" detectado: acionar inpainting seletivo na regiao afetada
   - Re-executar quality gate apos correcao

2. **Se score de qualidade < 7:**
   - Gerar relatorio detalhado dos criterios com score baixo
   - Ajustar parametros do pipeline (cfg_scale, denoising_strength, controlnet_weights)
   - Re-gerar render com parametros otimizados
   - Maximo de 3 tentativas automaticas antes de escalar para revisao manual

3. **Se metrica automatizada fora do threshold:**
   - FID alto: verificar se o style guide esta adequado ao tipo de ambiente
   - SSIM baixo: aumentar peso do ControlNet para preservar mais da estrutura original
   - LPIPS alto: reduzir denoising_strength para manter mais fidelidade perceptual
   - CLIP baixo: refinar prompt positivo e negativo com @interior-strategist

4. **Escalacao:**
   - Apos 3 falhas consecutivas: notificar @decorai-chief para revisao do pipeline
   - Apos 5 falhas no mesmo tipo de ambiente: acionar @pipeline-optimizer para analise

---

*Checklist v1.0.0 | Quality Gate QG-DA-003 | DecorAI Squad*
