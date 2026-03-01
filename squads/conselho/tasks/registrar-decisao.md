# Task: Registrar Decisão no Histórico

```yaml
task:
  name: registrar-decisao
  description: "Registrar decisão no histórico para aprendizado futuro"
  elicit: false
  agent: conselheiro-mor
```

## Descrição

Ao final de cada deliberação, registrar a decisão no diretório `squads/conselho/decisions/` para memória e aprendizado.

## Processo

### 1. Gerar Nome do Arquivo

Formato: `YYYY-MM-DD-{slug}.md`

Exemplos:
- `2026-03-01-migrar-para-nextjs.md`
- `2026-03-01-investir-em-ads.md`
- `2026-03-01-mudar-modelo-pricing.md`

### 2. Preencher Template

Usar `templates/registro-decisao.md` preenchendo:

- Data
- Modo (Full/Quick/Audit)
- Tipo (Negócio/Técnico/Pessoal/etc.)
- Questão original
- Consultores convocados
- Resultado (decisão + confiança + score)
- Resumo de cada agente
- Próximos passos
- Checklist de follow-up

### 3. Salvar Arquivo

Salvar em `squads/conselho/decisions/{nome-do-arquivo}.md`

### 4. Informar Usuário

```
📋 Decisão registrada em: squads/conselho/decisions/{arquivo}

Follow-up programado:
- [ ] Verificar critérios de reversão em {data}
- [ ] Avaliar resultado em {data}
```

## Consulta do Histórico

Para o comando `*historico`, listar todos os arquivos em `decisions/` com:
- Data
- Título
- Modo
- Confiança
- Decisão (resumo de 1 frase)
