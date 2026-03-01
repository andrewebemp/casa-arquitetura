# Task: Consultar Especialista Cross-Squad

```yaml
task:
  name: consultar-especialista
  description: "Convocar agente de qualquer squad para parecer técnico"
  elicit: false
  agent: conselheiro-mor
```

## Descrição

Protocolo para consultar agentes de 3 fontes: AIOS Core, squads locais, squads externos.

## Processo

### 1. Identificar Agente

Referência: `data/consulta-cross-squad.yaml`

Formas de consulta:
- **Por expertise**: O Conselheiro-Mor mapeia a questão para expertises no registry
- **Por nome**: `*consultar marketing-ops:marketing-cmo`
- **Por sugestão automática**: Baseado no tipo de decisão em `tipos-decisao.yaml`

### 2. Resolver Fonte do Agente

```
SE agente está em .claude/commands/AIOS/agents/:
  → Fonte: AIOS Core
  → Método: Ler o arquivo .md diretamente

SE agente está em squads/{squad}/agents/:
  → Fonte: Squad local
  → Método: Ler o arquivo .md diretamente

SE agente está em andrewebemp/squads-criados:
  → Fonte: Squad externo
  → Método: gh api repos/andrewebemp/squads-criados/contents/{squad}/agents/{agent}.md --jq '.content' | base64 -d
```

### 3. Formular Consulta

```
CONSULTA DO CONSELHO:
  Questão: {decisão em análise}
  Contexto: {contexto relevante fornecido pelo usuário}
  Agente consultado: {nome} ({squad})
  Aspecto específico: {o que se espera deste agente — focado no seu domínio}
  Formato esperado: Posição clara + evidências + riscos identificados
  Limite: Máximo 500 palavras, foco no domínio de expertise
```

### 4. Gerar Parecer

Assumir a persona do agente com base no seu DNA/definition e gerar:

```
PARECER DE {AGENTE} ({SQUAD}):
  Posição: {favorável / desfavorável / neutra} — {resumo em 1 frase}

  Evidências:
    1. {evidência concreta do domínio do agente}
    2. {evidência concreta do domínio do agente}

  Riscos no meu domínio:
    - {risco específico que este agente identifica}
    - {risco específico que este agente identifica}

  Recomendação específica: {ação concreta}

  Confiança: {0-100}%
  Limitação: {o que este agente NÃO pode avaliar}
```

### 5. Retornar ao Fluxo

O parecer é incorporado ao contexto da deliberação em andamento.
