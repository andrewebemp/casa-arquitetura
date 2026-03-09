# Especificacao UX/UI — DecorAI Brasil
## 3. User Flows

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 3.1 Flow 1 — Primeiro Render (Time-to-Value < 3 min) [NFR-03]

```
[Landing Page] --> [CTA "Comece Gratis"] --> [Cadastro Rapido]
                                                    |
                                            Google OAuth (1 clique)
                                            OU email/password
                                                    |
                                                    v
                                          [Onboarding Guiado]
                                          "Envie sua primeira foto"
                                                    |
                                                    v
                                           [Upload de Foto]
                                           (drag & drop ou camera)
                                                    |
                                                    v
                                         [Selecao de Estilo]
                                         (grid visual de 10 estilos)
                                                    |
                                                    v
                                         [Croqui de Confirmacao]
                                         (ASCII floor plan gerado)
                                         [Aprovar] / [Ajustar]
                                                    |
                                                    v
                                           [Geracao do Render]
                                           (progress bar + WebSocket)
                                           (10-30 segundos)
                                                    |
                                                    v
                                          [Workspace do Projeto]
                                          (resultado + chat + slider)
```

**Ref:** FR-01, FR-02, FR-29, FR-31, NFR-03
**Meta:** Cadastro ao primeiro render em menos de 3 minutos.

### 3.2 Flow 2 — Refinamento via Chat [FR-04, FR-05, FR-27]

```
[Workspace do Projeto]
        |
        v
[Chat Panel] --> Usuario digita: "tira o tapete"
        |
        v
[IA processa] --> (< 15 seg) --> [Imagem atualizada no Canvas]
        |                                    |
        v                                    v
[Historico de Versoes]              [Slider antes/depois atualiza]
(thumbnail de cada versao)         (compara com versao anterior
 com opcao de voltar)               ou com foto original)
        |
        v
[Usuario continua refinando OU exporta]
```

**Ref:** FR-04, FR-05, FR-06, FR-27, FR-28, NFR-02

### 3.3 Flow 3 — Input Multi-Formato (Arquiteto/Designer) [FR-24, FR-25, FR-26]

```
[Novo Projeto] --> [Tipo de Input]
                        |
          +-------------+-------------+
          |             |             |
    [Foto do Local] [Descricao   [Combinado]
                     Textual]
          |             |             |
          v             v             v
    [Upload foto] [Formulario    [Upload foto
                   de medidas     + medidas
                   4m x 6m,      + fotos de
                   pe-direito,   referencia]
                   janelas]
          |             |             |
          +-------------+-------------+
                        |
                        v
              [Adicionar Itens Especificos]
              (opcional: fotos de referencia
               de moveis + medidas)
              "Sofa 2.20m" + [foto do sofa]
                        |
                        v
              [Croqui de Confirmacao]
              (planta ASCII com itens posicionados)
              [Aprovar] / [Ajustar posicoes]
                        |
                        v
              [Geracao do Render]
```

**Ref:** FR-24, FR-25, FR-26, FR-29, FR-30, FR-31, FR-32

### 3.4 Flow 4 — Reverse Staging (Funil Freemium) [FR-12, FR-13]

```
[Landing Page] --> [CTA "Descubra quanto seu imovel esta perdendo"]
        |
        v
[Upload de Foto do Anuncio]
(sem necessidade de cadastro)
        |
        v
[IA Analisa a Foto]
(loading com dicas sobre staging)
        |
        v
[Resultado do Diagnostico]
+---------------------------------------+
|  Sua foto atual        [Foto staging] |
|  [foto original]                       |
|                                        |
|  "Seu imovel pode estar perdendo       |
|   ate 30% do valor percebido"          |
|                                        |
|  Problemas encontrados:               |
|  - Ambiente vazio (sem staging)        |
|  - Iluminacao deficiente              |
|  - Objetos indesejados visiveis       |
|                                        |
|  [Decorar este imovel agora - GRATIS] |
+---------------------------------------+
        |
        v
[Cadastro] --> [Primeiro Render Gratis]
```

**Ref:** FR-12, FR-13

### 3.5 Flow 5 — Edicao de Elementos Individuais [FR-07]

```
[Workspace do Projeto]
        |
        v
[Barra de Ferramentas] --> [Modo Segmentacao]
        |
        v
[IA segmenta a imagem]
(SAM identifica: parede, piso, bancada, armario)
        |
        v
[Usuario clica no elemento]
(ex: piso fica selecionado com contorno)
        |
        v
[Painel de Opcoes do Elemento]
- Material: madeira, porcelanato, marmore...
- Cor/Textura: selecao visual
- [Aplicar]
        |
        v
[Render parcial] --> [Resultado no Canvas]
(apenas o elemento muda)
```

**Ref:** FR-07

### 3.6 Flow 6 — Compartilhamento [FR-10, FR-11]

```
[Workspace do Projeto]
        |
        v
[Botao "Compartilhar"]
        |
        v
[Modal de Compartilhamento]
+----------------------------------+
|  Compartilhar resultado          |
|                                  |
|  [Slider Antes/Depois - Preview] |
|                                  |
|  Link: decorai.com.br/s/abc123  |
|  [Copiar Link]                   |
|                                  |
|  [WhatsApp] [Instagram] [Email]  |
|                                  |
|  Incluir marca d'agua: [On/Off]  |
|  (Obrigatorio no plano Free)     |
+----------------------------------+
```

**Ref:** FR-10, FR-11, FR-17

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
