# Checklist: Pipeline Performance Audit

> Usado apos: pipeline-benchmark.md (benchmark de performance do pipeline)
> Agente responsavel: @pipeline-optimizer
> Nivel: recommended
> Relacionado: NFRs de custo e latencia do DecorAI

---

## Criterios Obrigatorios (todos devem passar)

- [ ] **Custo por render < R$ 2,00** - O custo total de GPU compute + storage + CDN + API calls para um render completo nao ultrapassa R$ 2,00 (target: R$ 0,50 - R$ 1,50)
- [ ] **Latencia total < 30s** - O tempo total desde o upload da foto ate o render final disponivel nao ultrapassa 30 segundos para o tier Profissional
- [ ] **Cache hit rate > 60%** - A taxa de cache hit para modelos, controlnets e assets recorrentes esta acima de 60%
- [ ] **GPU utilization > 70%** - A utilizacao media da GPU durante o processamento esta acima de 70% (evitar idle time pago)
- [ ] **Error rate < 2%** - A taxa de erro do pipeline (renders falhados / renders tentados) esta abaixo de 2%
- [ ] **WebSocket feedback ativo** - O feedback em tempo real via WebSocket esta funcionando e reportando progresso ao usuario durante a geracao

---

## Criterios de Qualidade (score 0-3 cada)

| Criterio | 0 (Ausente) | 1 (Basico) | 2 (Bom) | 3 (Excelente) |
|----------|-------------|-----------|---------|----------------|
| **Eficiencia de custo** | > R$ 2,00/render | R$ 1,50 - R$ 2,00/render | R$ 0,80 - R$ 1,50/render | < R$ 0,80/render |
| **Latencia p50** | > 30s | 20-30s | 12-20s | < 12s |
| **Latencia p95** | > 60s | 30-60s | 15-30s | < 15s |
| **Cache efficiency** | < 40% hit rate | 40-60% hit rate | 60-80% hit rate | > 80% hit rate |
| **GPU routing intelligence** | Provider fixo, sem fallback | Fallback manual entre providers | Routing automatico por custo ou latencia | Routing inteligente multi-criterio (custo + latencia + disponibilidade + fila) |
| **Error recovery** | Sem recovery, usuario ve erro generico | Retry simples (1x) | Retry com fallback de provider | Retry com fallback + graceful degradation + notificacao proativa |
| **Observabilidade** | Sem metricas ou logs | Logs basicos sem agregacao | Metricas agregadas com dashboard | Full observability: traces, metricas, alertas, anomaly detection |
| **Batch processing** | Sem suporte a batch | Batch sequencial | Batch paralelo com limite fixo | Batch paralelo adaptativo com queue management e prioridade por tier |

---

## Breakdown de Latencia por Etapa

| Etapa | Latencia Medida | Budget Alocado | Status |
|-------|----------------|----------------|--------|
| Upload + pre-processamento | {upload_ms}ms | 2.000ms | {status} |
| Analise espacial (depth + seg) | {spatial_ms}ms | 5.000ms | {status} |
| ControlNet conditioning | {conditioning_ms}ms | 3.000ms | {status} |
| SDXL generation | {generation_ms}ms | 10.000ms | {status} |
| IC-Light relighting | {relighting_ms}ms | 3.000ms | {status} |
| Inpainting/refinement | {refinement_ms}ms | 3.000ms | {status} |
| Upscale (Real-ESRGAN) | {upscale_ms}ms | 3.000ms | {status} |
| Post-processing + upload S3 | {postprocess_ms}ms | 1.000ms | {status} |
| **Total** | **{total_ms}ms** | **30.000ms** | **{total_status}** |

---

## Breakdown de Custo por Componente

| Componente | Provider | Custo Medido | Budget | % do Total |
|-----------|----------|-------------|--------|-----------|
| Depth estimation | {depth_provider} | R$ {depth_cost} | R$ 0,15 | {depth_pct}% |
| Segmentation (SAM) | {seg_provider} | R$ {seg_cost} | R$ 0,15 | {seg_pct}% |
| SDXL + ControlNet | {sdxl_provider} | R$ {sdxl_cost} | R$ 0,60 | {sdxl_pct}% |
| IC-Light | {iclight_provider} | R$ {iclight_cost} | R$ 0,20 | {iclight_pct}% |
| Upscale | {upscale_provider} | R$ {upscale_cost} | R$ 0,15 | {upscale_pct}% |
| Storage (S3/R2) | {storage_provider} | R$ {storage_cost} | R$ 0,10 | {storage_pct}% |
| CDN | {cdn_provider} | R$ {cdn_cost} | R$ 0,05 | {cdn_pct}% |
| **Total** | - | **R$ {total_cost}** | **R$ 1,40** | **100%** |

---

## GPU Provider Comparison

| Provider | Custo/render | Latencia p50 | Latencia p95 | Uptime | Cold Start |
|----------|-------------|-------------|-------------|--------|------------|
| fal.ai | R$ {fal_cost} | {fal_p50}ms | {fal_p95}ms | {fal_uptime}% | {fal_cold}ms |
| Replicate | R$ {rep_cost} | {rep_p50}ms | {rep_p95}ms | {rep_uptime}% | {rep_cold}ms |
| Modal | R$ {mod_cost} | {mod_p50}ms | {mod_p95}ms | {mod_uptime}% | {mod_cold}ms |
| RunPod | R$ {run_cost} | {run_p50}ms | {run_p95}ms | {run_uptime}% | {run_cold}ms |

**Provider primario atual:** {primary_provider}
**Fallback chain:** {fallback_chain}

---

## Threshold

- **Minimo para aprovar:** 10/24 no score de qualidade E todos os criterios obrigatorios passando
- **Score maximo possivel:** 24/24 (8 criterios x 3 pontos)
- **Condicao de veto:** Custo > R$ 2,00/render OU latencia total > 30s OU error rate > 5%

### Classificacao

| Score | Classificacao | Acao |
|-------|--------------|------|
| 21-24 | Excelente | Pipeline otimizado, documentar configuracao como baseline |
| 16-20 | Bom | Pipeline saudavel, otimizacoes incrementais recomendadas |
| 10-15 | Aceitavel | Pipeline funcional, planejar sprint de otimizacao |
| 6-9 | Insuficiente | Pipeline com problemas, otimizacao urgente necessaria |
| 0-5 | Critico | Pipeline degradado, acionar correcao imediata |

---

## Correcao

If failed:

1. **Se custo > R$ 2,00/render:**
   - Analisar breakdown de custo para identificar componente mais caro
   - Verificar se cache de modelos esta funcionando (evitar recarregar modelos)
   - Considerar trocar para provider mais barato no componente critico
   - Avaliar reduzir steps de inferencia (de 30 para 25) se qualidade permitir
   - Implementar queue batching para amortizar cold start entre renders
   - Verificar se upscale e necessario para o tier do usuario (Explorer nao precisa de 4K)

2. **Se latencia > 30s:**
   - Identificar etapa bottleneck no breakdown de latencia
   - Se cold start: implementar keep-alive ou warm pool de instancias
   - Se generation: reduzir steps ou resolution intermediaria
   - Se upload: verificar se esta usando regiao CDN proxima (sa-east-1 para Brasil)
   - Paralelizar etapas independentes (depth + canny + segmentation em paralelo)
   - Considerar pre-computar conditioning maps durante o upload

3. **Se cache hit rate < 60%:**
   - Verificar TTL dos caches (modelos devem ter TTL longo)
   - Implementar cache warming para modelos mais usados
   - Adicionar cache layer para ControlNet configs recorrentes
   - Monitorar cache eviction rate e ajustar tamanho

4. **Se GPU utilization < 70%:**
   - Verificar se ha idle time entre etapas do pipeline
   - Implementar pipeline streaming (proxima etapa comeca antes da anterior terminar quando possivel)
   - Considerar batching de multiplos renders na mesma GPU
   - Avaliar right-sizing da GPU (nao usar A100 se T4 atende)

5. **Se error rate > 2%:**
   - Categorizar erros por tipo (OOM, timeout, model error, input error)
   - Implementar input validation mais rigorosa (antes de enviar para GPU)
   - Adicionar health checks para providers
   - Implementar circuit breaker pattern para providers instáveis

6. **Se WebSocket feedback nao funciona:**
   - Verificar conexao WebSocket entre backend e frontend
   - Implementar fallback para polling se WebSocket falhar
   - Garantir que cada etapa do pipeline emite evento de progresso
   - Testar reconexao automatica em caso de desconexao

---

*Checklist v1.0.0 | Pipeline Performance NFRs | DecorAI Squad*
