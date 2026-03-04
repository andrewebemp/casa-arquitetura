# SOP: [PREENCHER]

## Identificacao

| Campo | Valor |
|-------|-------|
| **ID** | SOP-[XXX] <!-- Ex: SOP-001 --> |
| **Titulo** | [PREENCHER] <!-- Ex: Procedimento de Deploy em Producao --> |
| **Versao** | 1.0 |
| **Data de Criacao** | [AAAA-MM-DD] |
| **Ultima Revisao** | [AAAA-MM-DD] |
| **Proxima Revisao** | [AAAA-MM-DD] <!-- Recomendado: a cada 6 meses --> |
| **Autor** | [PREENCHER] |
| **Aprovador** | [PREENCHER] |
| **Status** | [ ] Rascunho / [ ] Em revisao / [ ] Aprovada / [ ] Obsoleta |

---

## Objetivo

[PREENCHER]
<!-- Ex: Garantir que todo deploy em producao siga um processo padronizado, minimizando riscos de indisponibilidade e perda de dados. -->

---

## Escopo

**O que esta SOP cobre:**
- [PREENCHER] <!-- Ex: Deploys de aplicacoes web no ambiente de producao -->
- [PREENCHER] <!-- Ex: Rollback em caso de falha -->

**O que esta SOP NAO cobre:**
- [PREENCHER] <!-- Ex: Deploys em ambiente de homologacao (ver SOP-003) -->
- [PREENCHER] <!-- Ex: Mudancas de infraestrutura (ver SOP-007) -->

---

## Responsaveis

| Papel | Quem | Responsabilidade |
|-------|------|-----------------|
| Executor | [PREENCHER] | [PREENCHER] <!-- Ex: Dev senior | Executar os passos do deploy --> |
| Aprovador | [PREENCHER] | [PREENCHER] <!-- Ex: Tech Lead | Autorizar inicio do deploy --> |
| Suporte | [PREENCHER] | [PREENCHER] <!-- Ex: DevOps | Apoiar em caso de problemas --> |

---

## Pre-requisitos

<!-- Tudo que precisa estar pronto/disponivel antes de iniciar -->

- [ ] [PREENCHER] <!-- Ex: Todos os testes automatizados passando na branch main -->
- [ ] [PREENCHER] <!-- Ex: Aprovacao do Tech Lead no pull request -->
- [ ] [PREENCHER] <!-- Ex: Janela de deploy confirmada com o time de operacoes -->
- [ ] [PREENCHER]

---

## Materiais e Ferramentas Necessarios

| Item | Finalidade | Onde acessar |
|------|-----------|--------------|
| [PREENCHER] | [PREENCHER] | [PREENCHER] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] |
<!-- Ex: Acesso ao CI/CD | Executar pipeline de deploy | https://ci.empresa.com -->

---

## Procedimento

### Etapa 1: [PREENCHER] <!-- Ex: Preparacao -->

1. [PREENCHER]
   <!-- Ex: Verifique se todos os testes estao passando no CI -->
2. [PREENCHER]
   <!-- Ex: Confirme que o changelog esta atualizado -->
3. [PREENCHER]

   > **Atencao:** [PREENCHER] <!-- Alertas importantes para esta etapa -->

### Etapa 2: [PREENCHER] <!-- Ex: Execucao -->

4. [PREENCHER]
5. [PREENCHER]
6. [PREENCHER]

   > **Ponto de verificacao:** Antes de prosseguir, confirme que [PREENCHER]

### Etapa 3: [PREENCHER] <!-- Ex: Validacao -->

7. [PREENCHER]
8. [PREENCHER]
9. [PREENCHER]

### Etapa 4: [PREENCHER] <!-- Ex: Finalizacao -->

10. [PREENCHER]
11. [PREENCHER]

---

## Se Algo Der Errado (Troubleshooting)

### Etapa 1 - [Nome da etapa]

| Problema | Causa Provavel | Solucao |
|----------|---------------|---------|
| [PREENCHER] | [PREENCHER] | [PREENCHER] |

### Etapa 2 - [Nome da etapa]

| Problema | Causa Provavel | Solucao |
|----------|---------------|---------|
| [PREENCHER] | [PREENCHER] | [PREENCHER] |
<!-- Ex: Pipeline falha no step de build | Dependencia nao encontrada | Rode npm ci manualmente e verifique o lock file -->

### Etapa 3 - [Nome da etapa]

| Problema | Causa Provavel | Solucao |
|----------|---------------|---------|
| [PREENCHER] | [PREENCHER] | [PREENCHER] |

> **Escalacao:** Se o problema nao for resolvido em [TEMPO], escale para [PREENCHER]

---

## FAQ

**P: [PREENCHER]?**
<!-- Ex: Posso fazer deploy na sexta-feira? -->
R: [PREENCHER]
<!-- Ex: Nao recomendado. Deploys devem ser feitos de segunda a quinta, preferencialmente pela manha. -->

**P: [PREENCHER]?**
R: [PREENCHER]

**P: [PREENCHER]?**
R: [PREENCHER]

---

## Glossario

| Termo | Definicao |
|-------|-----------|
| [PREENCHER] | [PREENCHER] <!-- Ex: Rollback | Reverter a aplicacao para a versao anterior ao deploy --> |
| [PREENCHER] | [PREENCHER] |
| [PREENCHER] | [PREENCHER] |

---

## Historico de Revisoes

| Versao | Data | Autor | Descricao da Mudanca |
|--------|------|-------|---------------------|
| 1.0 | [AAAA-MM-DD] | [PREENCHER] | Criacao inicial |
| | | | <!-- Ex: 1.1 | 2024-06-15 | Joao Silva | Adicionado passo de rollback automatico --> |

---

*Template: sop-tmpl v1.0 | Squad: Process Excellence*
