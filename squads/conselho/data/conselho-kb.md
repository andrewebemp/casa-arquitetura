# Conselho Deliberativo — Knowledge Base

## O Que É

O Conselho é um sistema de deliberação multi-agente que analisa decisões de forma rigorosa antes de recomendar um caminho. Inspirado no Conclave do Mega Brain, com 9 melhorias significativas.

## Princípios Invioláveis

1. **Honestidade Epistêmica**: Nunca apresentar hipótese como fato. Declarar "não sei" quando necessário.
2. **Rastreabilidade**: Toda afirmação deve ter fonte ou ser declarada como inferência.
3. **Confiança Calibrada**: Nunca inflar confiança para parecer decisivo.
4. **Separação Fato vs Opinião**: Fatos com fontes, opiniões declaradas como tal.
5. **Escalonamento**: Se confiança < 60%, escalonar para decisão humana.

## Os 3 Agentes do Conselho

| Agente | Elemento | Função |
|--------|----------|--------|
| Crítico Metodológico 🔍 | Terra | Avalia qualidade do raciocínio (0-100) + detecta vieses |
| Advogado do Diabo 😈 | Fogo | Ataca a decisão: premissa frágil, riscos, pré-mortem, alternativas |
| Sintetizador 🔮 | Ar | Integra tudo em recomendação com confiança decomposta |

## Os 3 Modos

- **Full** (5 fases): Para decisões críticas/irreversíveis. Inclui pareceres cross-squad.
- **Quick** (3 fases): Para decisões moderadas. Advogado + Síntese.
- **Audit** (3 fases): Para decisões já tomadas. Auditoria retroativa.

## Consulta Cross-Squad

O Conselho pode convocar agentes de 3 fontes:
1. **AIOS Core**: 9 agentes especializados sempre disponíveis
2. **Squads locais**: Instalados em `squads/`
3. **Squads externos**: 99 agentes em `andrewebemp/squads-criados` via GitHub API

## Calibração de Confiança

A confiança é decomposta em 3 dimensões:
- **Dados** (0-100%): Qualidade e completude das informações disponíveis
- **Modelo** (0-100%): Robustez do raciocínio e análise aplicados
- **Execução** (0-100%): Viabilidade de implementar a decisão

Confiança geral = média ponderada (pesos ajustáveis por tipo de decisão)

## Quando NÃO Usar o Conselho

- Decisões triviais e facilmente reversíveis
- Questões puramente informativas
- Quando já existe consenso claro e evidências sólidas
- Para validar algo já decidido com viés de confirmação (use Audit honestamente)
