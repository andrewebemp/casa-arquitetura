# Conselho Deliberativo

Sistema de deliberação multi-agente para análise rigorosa de decisões. Inspirado no Conclave do Mega Brain, com 9 melhorias significativas.

## Ativação

```
/conselho                              # Ativa o Conselheiro-Mor
/conselho "Devo investir em X?"        # Ativa e inicia deliberação diretamente
```

Agentes individuais (standalone):
```
/conselho:agents:critico-metodologico  # Avaliação metodológica standalone
/conselho:agents:advogado-do-diabo     # Análise de vulnerabilidades standalone
/conselho:agents:sintetizador          # Síntese standalone
```

## Os 3 Agentes

| Agente | Elemento | Função |
|--------|----------|--------|
| Crítico Metodológico 🔍 | Terra | Score 0-100 do processo + detecção de 12 vieses cognitivos |
| Advogado do Diabo 😈 | Fogo | 5 entregas: premissa frágil, risco oculto, arrependimento 12m, alternativa, pré-mortem |
| Sintetizador 🔮 | Ar | Integração com confiança decomposta (dados/modelo/execução) + stakeholders |

## 3 Modos de Deliberação

| Modo | Fases | Quando Usar |
|------|-------|-------------|
| **Full** | 5 | Decisões críticas, irreversíveis, alto valor |
| **Quick** | 3 | Decisões moderadas, reversíveis |
| **Audit** | 3 | Decisões já tomadas (retroativa) |

## Comandos

| Comando | Descrição |
|---------|-----------|
| `*deliberar [questão]` | Deliberação Full (5 fases) |
| `*quick [questão]` | Deliberação Quick (3 fases) |
| `*audit [decisão]` | Auditoria retroativa |
| `*consultar [squad:agente]` | Consultar especialista |
| `*historico` | Ver decisões anteriores |

## Consulta Cross-Squad

O Conselho pode convocar agentes de 3 fontes para pareceres técnicos:

1. **AIOS Core** (9 agentes): @architect, @dev, @qa, @analyst, @data-engineer, @pm, @po, @devops, @ux-design-expert
2. **Squads locais**: Qualquer squad em `squads/`
3. **Squads externos** (99 agentes): 13 squads em `andrewebemp/squads-criados` via GitHub API

## Melhorias sobre o Mega Brain

1. **3 modos** de deliberação (Full/Quick/Audit)
2. **Detecção de 12 vieses** cognitivos pelo Crítico
3. **Pré-mortem** pelo Advogado (técnica Gary Klein)
4. **Matriz de stakeholders** pelo Sintetizador
5. **Confiança decomposta** (dados/modelo/execução)
6. **Memória de decisões** em `decisions/`
7. **Debate de domínio** opcional com agentes especializados
8. **Escopo universal** (negócio, técnico, pessoal, conteúdo, estratégico)
9. **Consulta cross-squad** (AIOS Core + locais + 99 agentes externos)

## Estrutura

```
squads/conselho/
├── config.yaml           # Metadata
├── agents/               # 4 agentes (conselheiro-mor, critico, advogado, sintetizador)
├── workflows/            # Protocolo de deliberação
├── tasks/                # 5 tasks executáveis
├── templates/            # 4 templates de output
├── data/                 # Frameworks, vieses, registry cross-squad
├── decisions/            # Histórico de decisões
└── docs/                 # Esta documentação
```
