# DecorAI Decision Trees

Arvores de decisao para cenarios comuns do pipeline DecorAI.
Referencia rapida para o decorai-chief e agentes especialistas.

---

## 1. Input Type Routing

Classifica o tipo de input do usuario e roteia para o caminho correto.

```
INPUT RECEBIDO
    |
    +-- Contem imagem/foto?
    |       |
    |       +-- SIM: Contem instrucao textual junto?
    |       |       |
    |       |       +-- SIM -> MULTI PATH
    |       |       |   Rotear para: spatial-analyst (depth+seg)
    |       |       |   + Claude API (NLP parsing)
    |       |       |   Prioridade: Contexto visual + instrucao textual
    |       |       |
    |       |       +-- NAO -> PHOTO PATH
    |       |           E render existente (refinamento)?
    |       |               |
    |       |               +-- SIM -> conversational-designer
    |       |               |   (interpretar intencao de refinamento)
    |       |               |
    |       |               +-- NAO -> spatial-analyst
    |       |                   (analise espacial completa)
    |       |
    |       +-- NAO: Contem descricao textual?
    |               |
    |               +-- SIM: Menciona estilo/decoracao?
    |               |       |
    |               |       +-- SIM -> interior-strategist
    |               |       |   (definir estilo, gerar guia+prompt)
    |               |       |
    |               |       +-- NAO: Menciona negocio/pricing/growth?
    |               |               |
    |               |               +-- SIM -> proptech-growth
    |               |               |
    |               |               +-- NAO: Menciona pipeline/custo/GPU?
    |               |                       |
    |               |                       +-- SIM -> pipeline-optimizer
    |               |                       |
    |               |                       +-- NAO -> decorai-chief
    |               |                           (resposta direta ou pedir clarificacao)
    |               |
    |               +-- NAO -> decorai-chief
    |                   (pedir input: "Envie uma foto ou descreva o que precisa")
```

---

## 2. Style Selection Guidance

Ajuda o usuario a escolher o estilo ideal baseado em perfil e contexto.

```
PERFIL DO USUARIO
    |
    +-- Tipo de imovel?
    |       |
    |       +-- Apartamento compacto (<60m2)
    |       |   Recomendado: Escandinavo, Minimalista, Moderno
    |       |   Razao: Maximiza claridade e sensacao de amplitude
    |       |
    |       +-- Apartamento medio (60-120m2)
    |       |   Recomendado: Contemporaneo, Escandinavo, Moderno
    |       |   Razao: Versatil, agrada maioria dos compradores
    |       |
    |       +-- Apartamento grande / Cobertura (>120m2)
    |       |   Recomendado: Classico, Luxo, Contemporaneo
    |       |   Razao: Espacos amplos comportam estilos elaborados
    |       |
    |       +-- Casa em condominio
    |       |   Recomendado: Contemporaneo, Tropical, Moderno
    |       |   Razao: Integracao indoor-outdoor, areas amplas
    |       |
    |       +-- Casa de campo / Fazenda
    |       |   Recomendado: Rustico, Tropical, Boho
    |       |   Razao: Conexao com natureza, materiais naturais
    |       |
    |       +-- Studio / Loft
    |           Recomendado: Industrial, Moderno, Minimalista
    |           Razao: Pe-direito alto, espaco unico
    |
    +-- Publico-alvo do imovel?
    |       |
    |       +-- Jovens profissionais (25-35)
    |       |   Tendencia: Escandinavo, Industrial, Boho
    |       |
    |       +-- Familias (35-50)
    |       |   Tendencia: Contemporaneo, Moderno, Tropical
    |       |
    |       +-- Premium / 3a idade (50+)
    |       |   Tendencia: Classico, Luxo, Contemporaneo
    |       |
    |       +-- Investidor (aluguel)
    |           Tendencia: Contemporaneo, Moderno
    |           Razao: Neutro, agrada maioria, facil de manter
    |
    +-- Em duvida entre dois estilos?
            |
            Sugerir: Gerar render nos dois estilos para comparar
            Custo: 2 renders (dentro do limite do tier)
```

---

## 3. Quality Issue Diagnosis

Diagnostica problemas de qualidade no render gerado.

```
PROBLEMA REPORTADO
    |
    +-- Moveis flutuando / desproporcionais?
    |   Causa: Depth map impreciso ou ControlNet Depth weight baixo
    |   Acao: Re-gerar com depth weight +0.10
    |   Agente: visual-quality-engineer -> staging-architect
    |
    +-- Estilo nao corresponde ao pedido?
    |   Causa: Prompt mal montado ou CFG muito baixo
    |   Acao: Revisar tokens de estilo, aumentar CFG +0.5
    |   Agente: interior-strategist -> staging-architect
    |
    +-- Imagem borrada / baixa resolucao?
    |   Causa: Denoising muito alto ou falta de upscale
    |   Acao: Reduzir denoising -0.05, aplicar Real-ESRGAN 2x
    |   Agente: visual-quality-engineer
    |
    +-- Paredes/piso distorcidos?
    |   Causa: ControlNet Canny weight muito baixo
    |   Acao: Aumentar Canny weight para 0.85+
    |   Agente: staging-architect
    |
    +-- Artefatos visuais (mãos, texto, glitches)?
    |   Causa: Comum em diffusion models, area de falha conhecida
    |   Acao: Re-gerar com seed diferente, inpainting na regiao
    |   Agente: staging-architect
    |
    +-- Cores muito saturadas / lavadas?
    |   Causa: CFG muito alto (saturacao) ou muito baixo (lavado)
    |   Acao: Ajustar CFG para range do estilo (ver KB)
    |   Agente: staging-architect
    |
    +-- Iluminacao irreal (sombras erradas, luz de fonte inexistente)?
    |   Causa: Conflito entre lighting tokens e depth map
    |   Acao: Usar IC-Light para corrigir iluminacao pos-geracao
    |   Agente: visual-quality-engineer
    |
    +-- Perspectiva incorreta (angulo errado)?
        Causa: ControlNet Depth nao preservou perspectiva original
        Acao: Re-gerar com Depth weight 0.80+ e Canny weight 0.85+
        Agente: staging-architect
```

---

## 4. Pricing Tier Recommendation

Recomenda o tier ideal baseado no perfil de uso.

```
PERFIL DO CLIENTE
    |
    +-- Quantos imoveis/mes anuncia?
    |       |
    |       +-- 1-2 imoveis -> Explorador (Free) pode ser suficiente
    |       |   (3 renders/mes = 1-2 por imovel)
    |       |
    |       +-- 3-10 imoveis -> Profissional (R$ 89/mes)
    |       |   (50 renders = ~5-16 por imovel, com refinamentos)
    |       |
    |       +-- 10+ imoveis ou equipe -> Imobiliaria (R$ 299+/mes)
    |           (Ilimitado, multi-usuario, API)
    |
    +-- Precisa de marca propria (white-label)?
    |       |
    |       +-- SIM -> Imobiliaria (unico tier com white-label)
    |       +-- NAO -> Pro ou Free
    |
    +-- Precisa de integracao API?
    |       |
    |       +-- SIM -> Imobiliaria (unico tier com API)
    |       +-- NAO -> Pro ou Free
    |
    +-- Resolucao necessaria?
            |
            +-- Redes sociais (1080px) -> Pro suficiente
            +-- Portal imobiliario (1080-2048px) -> Pro ou Enterprise
            +-- Impressao / material de venda (4096px) -> Enterprise
```

---

## 5. SAM vs Full Regeneration

Decide quando usar segmentacao+inpainting vs re-gerar o render completo.

```
TIPO DE ALTERACAO
    |
    +-- Mudar 1 objeto especifico? (ex: trocar sofa)
    |   |
    |   +-- Objeto ocupa < 30% da imagem?
    |   |       |
    |   |       +-- SIM -> SAM + Inpainting (LaMa + ControlNet regional)
    |   |       |   Vantagem: Preserva contexto, mais rapido, mais barato
    |   |       |   Custo: ~R$ 0.15 (vs R$ 0.70 full render)
    |   |       |   Latencia: ~5s (vs 15s full)
    |   |       |
    |   |       +-- NAO -> Full regeneration
    |   |           Razao: Inpainting em area grande gera inconsistencia
    |   |
    |   +-- Alteracao afeta iluminacao global?
    |           |
    |           +-- SIM -> Full regeneration
    |           |   (ex: trocar janela afeta luz em todo o ambiente)
    |           |
    |           +-- NAO -> SAM + Inpainting
    |               (ex: trocar almofada nao muda iluminacao)
    |
    +-- Mudar estilo inteiro?
    |   -> Full regeneration (obrigatorio)
    |   Razao: Estilo afeta tudo: materiais, cores, formas, iluminacao
    |
    +-- Mudar cor de parede/piso?
    |   |
    |   +-- Parede unica -> SAM + Inpainting
    |   +-- Todas as paredes -> Full regeneration
    |   +-- Piso inteiro -> Full regeneration (afeta reflexos)
    |
    +-- Adicionar/remover objeto?
    |   |
    |   +-- Adicionar -> Inpainting na regiao vazia
    |   |   (gerar objeto com prompt especifico na mascara)
    |   |
    |   +-- Remover -> LaMa inpainting (preencher com fundo)
    |       (LaMa e melhor que diffusion para remocao limpa)
    |
    +-- Ajustar iluminacao?
        |
        +-- Leve (mais claro/escuro) -> IC-Light (pos-processamento)
        +-- Drastico (dia->noite, sol->nublado) -> Full regeneration
```

---

## Notas de Uso

1. Estas decision trees sao **heuristicas**, nao regras absolutas. O decorai-chief pode
   desviar quando o contexto justificar.
2. Em caso de duvida entre SAM e full regeneration, **preferir full regeneration** --
   qualidade > economia.
3. Style selection e **sugestao**, nao imposicao. Sempre confirmar com o usuario antes
   de gerar.
4. Quality diagnosis deve ser feito pelo visual-quality-engineer, nao pelo decorai-chief.
   O chief roteia, nao diagnostica.

---

*DecorAI Brasil -- Decision Trees v1.0*
