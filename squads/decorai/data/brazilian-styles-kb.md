# Brazilian Interior Design Styles Knowledge Base

Knowledge base completa dos 10 estilos de design de interiores usados pela plataforma DecorAI Brasil.
Cada estilo e mapeado com DNA visual, paleta hex, materiais, e tokens ControlNet.

---

## 1. Moderno

**Descricao:** Linhas retas e limpas, materiais industriais polidos, paleta monocromatica com pontos de cor saturada. Funcionalidade e forma coexistem sem ornamentacao excessiva.

**Caracteristicas-chave:**
- Geometria pura, simetria parcial
- Superficies lisas e acabamentos polidos
- Mobiliario de linhas retas com pes metalicos
- Espacos abertos e integrados
- Tecnologia embutida (automacao, LED)

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Branco puro | `#FFFFFF` | Paredes, teto |
| Cinza claro | `#D3D3D3` | Pisos, mobiliario |
| Cinza chumbo | `#5A5A5A` | Detalhes, molduras |
| Preto | `#1A1A1A` | Acentos, luminarias |
| Azul Royal (accent) | `#2962FF` | Almofadas, arte |
| Amarelo mostarda (accent) | `#FFD600` | Peca destaque |

**Materiais:** Vidro temperado, aco escovado, laca fosca (branca/preta), marmore branco Carrara, concreto polido, MDF com acabamento liso

**Mobiliario:** Sofa modular reto, mesa de jantar retangular com tampo de vidro, cadeiras em aco e couro, rack suspenso, estante geometrica

**Iluminacao:** Embutida (spots LED), fitas LED em sancas, pendentes geometricos metalicos, trilho com spots direcionais

**Ambientes tipicos:** Living integrado, home office, loft, cozinha americana

**Contexto cultural BR:** Popular em apartamentos novos de classe media-alta em SP, RJ, Curitiba. Associado a modernidade urbana. Combina com porcelanato grande formato (60x120cm+) da Portobello/Eliane.

**Mapeamento ControlNet:**
```
Positive: modern interior, clean lines, minimalist furniture, polished concrete floor, glass partitions, white walls, LED lighting, geometric pendant, open plan, professional photography, 8k uhd
Negative: rustic, ornate, vintage, cluttered, traditional, wooden beams, floral patterns
CFG Scale: 7-9 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.75 | Depth Weight: 0.65
```

---

## 2. Industrial

**Descricao:** Materiais brutos expostos, estetica de loft e fabrica convertida. Metalurgia visivel, tijolo a vista, tubulacoes expostas como elementos decorativos.

**Caracteristicas-chave:**
- Materiais crus e sem acabamento final
- Estrutura exposta como decoracao
- Mistura de texturas brutas (metal, tijolo, concreto, madeira envelhecida)
- Pe-direito alto, espacos amplos
- Iluminacao com filamento aparente

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Cinza concreto | `#8C8C8C` | Paredes, pisos |
| Ferrugem/Corten | `#B7410E` | Acentos metalicos |
| Preto fosco | `#2B2B2B` | Serralheria, luminarias |
| Tijolo | `#CB4335` | Parede destaque |
| Madeira escura | `#5D3A1A` | Bancadas, prateleiras |
| Cobre envelhecido | `#B87333` | Tubulacoes, detalhes |

**Materiais:** Concreto aparente, tijolo a vista, tubulacao metalica exposta, aco corten, madeira de demolicao, ferro forjado/serralheria preta, couro natural envelhecido

**Mobiliario:** Banquetas altas de metal+madeira, mesa de centro com base de ferro, prateleiras com tubulacao, sofa em couro cognac, cadeiras Tolix

**Iluminacao:** Pendentes metalicos em formato de gaiola, lampadas de filamento Edison, trilhos industriais, luminarias articuladas de metal

**Ambientes tipicos:** Lofts, estudio, cervejaria, coworking, cozinha tipo gastropub

**Contexto cultural BR:** Forte em Belo Horizonte, Porto Alegre, e areas como Vila Madalena (SP). Muito usado em reformas de imoveis antigos. Madeira de demolicao (peroba, ipe) e material icone brasileiro nesse estilo.

**Mapeamento ControlNet:**
```
Positive: industrial loft interior, exposed brick wall, metal pipes, concrete walls, Edison bulb pendants, raw materials, reclaimed wood, leather sofa, metal shelving, high ceiling, 8k uhd, architectural photography
Negative: delicate, pastel, ornate, traditional, cozy, feminine, wallpaper, carpet
CFG Scale: 7-8.5 | Denoising: 0.50-0.65
ControlNet Canny Weight: 0.80 | Depth Weight: 0.60
```

---

## 3. Minimalista

**Descricao:** Menos e mais. Espacos limpos com funcionalidade pura, ausencia deliberada de excesso. Cada objeto presente tem proposito e presenca.

**Caracteristicas-chave:**
- Negative space como elemento de design
- Funcionalidade acima de decoracao
- Armazenamento oculto, superficies limpas
- Poucas pecas, cada uma significativa
- Proporcoes auricas e simetria

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Branco neve | `#FAFAFA` | Paredes, teto, mobiliario |
| Off-white | `#F5F0EB` | Texteis, cortinas |
| Cinza perola | `#E0E0E0` | Pisos, detalhes |
| Bege natural | `#D5C4A1` | Madeira, acabamentos |
| Preto pontual | `#1C1C1C` | Acentos minimos |

**Materiais:** Laca branca fosca, pedra natural clara (limestone, nanoglass), vidro transparente, madeira clara (carvalho, pinus), linho cru, microcimento

**Mobiliario:** Sofa de linhas puras em tecido neutro, mesa de comer redonda ou oval, cadeira de madeira clara com assento forrado, cama platform sem cabeceira ornamentada

**Iluminacao:** Luz natural maximizada (cortinas translucidas), embutida difusa (LED 4000K), luminarias escultoricas pontuais como peca de arte

**Ambientes tipicos:** Suite master, studio, sala de meditacao, banheiro spa

**Contexto cultural BR:** Crescente entre jovens profissionais urbanos. Desafiador no BR onde "mais e mais" e cultural. Exige disciplina de organizacao. Combina com o movimento de minimalismo e tidying up (Marie Kondo effect).

**Mapeamento ControlNet:**
```
Positive: minimalist interior, clean white walls, sparse furniture, abundant natural light, negative space, simple elegant, neutral tones, uncluttered, zen atmosphere, 8k uhd, architectural digest
Negative: cluttered, ornate, colorful, busy patterns, excessive decoration, dark, heavy curtains
CFG Scale: 8-10 | Denoising: 0.50-0.65
ControlNet Canny Weight: 0.70 | Depth Weight: 0.70
```

---

## 4. Classico

**Descricao:** Elegancia atemporal inspirada em estilos europeus. Simetria, molduras, tecidos nobres, e detalhes refinados. Transmite status e permanencia.

**Caracteristicas-chave:**
- Simetria rigorosa na disposicao
- Molduras e boiseries nas paredes
- Tecidos nobres (jacquard, veludo, seda)
- Moveis com curvas classicas e detalhes em talha
- Ornamentacao controlada mas presente

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Bege champagne | `#F5E6CC` | Paredes principais |
| Dourado | `#D4AF37` | Detalhes, molduras |
| Marsala | `#800020` | Estofados, cortinas |
| Azul marinho | `#1B2A4A` | Almofadas, tapete |
| Creme | `#FFFDD0` | Teto, tecidos claros |
| Verde ingles | `#1B4D3E` | Parede destaque |

**Materiais:** Marmore Crema Marfil, madeira mogno/cerejeira, tecido jacquard, cristal (lustres), espelhos bisotados, gesso moldado, piso em madeira macica ou porcelanato imitando

**Mobiliario:** Sofa capitone em veludo, poltrona bergere, mesa de jantar em madeira macica com pes torneados, aparador com espelho, console com vasos

**Iluminacao:** Lustres de cristal, arandelas douradas, abajures com cupula em tecido, spots embutidos como complemento

**Ambientes tipicos:** Sala de jantar formal, hall de entrada, quarto de casal premium, lavabo sofisticado

**Contexto cultural BR:** Forte em apartamentos de alto padrao em Higienopolis (SP), Leblon (RJ), Batel (Curitiba). Clientela 50+ com poder aquisitivo. Gesso moldado e especialidade de artesaos brasileiros.

**Mapeamento ControlNet:**
```
Positive: classic elegant interior, crown molding, marble floor, crystal chandelier, symmetrical layout, elegant drapery, tufted velvet sofa, gold accents, boiserie wall, formal dining, 8k uhd, luxury photography
Negative: modern, industrial, minimalist, concrete, raw, casual, plastic
CFG Scale: 7-9 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.80 | Depth Weight: 0.65
```

---

## 5. Escandinavo

**Descricao:** Claridade nordica adaptada ao Brasil. Madeira clara, funcionalidade acolhedora (hygge), e formas organicas suaves. Simplicidade com calor humano.

**Caracteristicas-chave:**
- Luz natural como protagonista
- Madeira clara em abundancia
- Texturas acolhedoras (la, linho, ceramica)
- Formas organicas com pernas de palito
- Plantas como complemento natural

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Branco neve | `#F8F8F8` | Paredes, teto |
| Cinza nordico | `#B0B7BF` | Texteis, acentos |
| Rosa cha | `#D4A5A5` | Almofadas, ceramicas |
| Azul acinzentado | `#7B9EA8` | Parede destaque |
| Mostarda pontual | `#E8A317` | Objetos, almofada |
| Carvalho claro | `#C8A96E` | Pisos, mobiliario |

**Materiais:** Madeira pinus/carvalho claro (vinilico Durafloor Carvalho Munique R$89/m2), la (mantas/almofadas), ceramica artesanal, papel de parede geometrico (Bobinex), couro natural claro, linho

**Mobiliario:** Sofa linhao cru com pernas de madeira, mesa redonda em carvalho, cadeira com assento estofado e encosto em madeira, prateleira em nichos geometricos

**Iluminacao:** Natural abundante (cortinas translucidas), pendentes de papel rice/madeira (Yamamura), velas como ambientacao, fitas LED 3000K (quente)

**Ambientes tipicos:** Living integrado, quarto de casal jovem, cozinha aberta, area de leitura

**Contexto cultural BR:** Muito popular entre casais jovens (25-35 anos) urbanos. Combina com apartamentos compactos por maximizar claridade. Adaptacao ao clima tropical: menos la pesada, mais linho e algodao.

**Mapeamento ControlNet:**
```
Positive: scandinavian interior, light wood floor, white walls, hygge atmosphere, wool textures, simple furniture, natural light, indoor plants, cozy warm, neutral palette, 8k uhd, interior photography
Negative: dark, ornate, heavy, industrial, baroque, cluttered, excessive color
CFG Scale: 7-9 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.75 | Depth Weight: 0.65
```

---

## 6. Rustico

**Descricao:** Conexao profunda com a natureza e artesanato. Materiais naturais em estado bruto ou semi-processado. Evoca fazenda, campo, e tradição.

**Caracteristicas-chave:**
- Madeira macica como protagonista
- Texturas irregulares e artesanais
- Pecas robustas e duráveis
- Integração com elementos naturais (pedra, fibra)
- Sensação de acolhimento e permanência

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Terracota | `#C04000` | Ceramica, pisos |
| Verde musgo | `#4A5D23` | Plantas, detalhes |
| Marrom terra | `#6B4226` | Madeira, mobiliario |
| Bege palha | `#D4C5A9` | Paredes, texteis |
| Creme natural | `#F5F0E1` | Teto, tecidos |
| Ferrugem | `#A0522D` | Metal envelhecido |

**Materiais:** Madeira macica de lei (peroba, ipe, canela), pedra natural (arenito, ardosia, pedra ferro), ceramica artesanal, fibras naturais (sisal, juta, rattan), ferro forjado, ladrilho hidraulico

**Mobiliario:** Mesa de madeira macica com bordas vivas (live edge), banco rustico, cadeira com assento de palha/couro, aparador em madeira de demolicao, prateleira de tronco

**Iluminacao:** Arandelas de ferro forjado, pendentes em fibra natural/ceramica, velas e lanternas, spots embutidos discretos

**Ambientes tipicos:** Casa de campo, varanda gourmet, area de churrasco, fazenda, pousada

**Contexto cultural BR:** Muito forte no interior de MG, GO, MT, SC. Madeira de demolicao e diferencial brasileiro. Casa de campo como aspiracao de fim de semana. Ladrilho hidraulico artesanal e heranca colonial.

**Mapeamento ControlNet:**
```
Positive: rustic interior, wooden beams, stone wall, handcrafted furniture, natural fibers, farmhouse style, warm earthy tones, terracotta tiles, wrought iron, 8k uhd, natural lighting
Negative: modern, polished, glass, chrome, minimalist, high-tech, plastic
CFG Scale: 7-8.5 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.75 | Depth Weight: 0.60
```

---

## 7. Tropical

**Descricao:** Exuberância brasileira traduzida em interiores. Folhagens abundantes, cores vibrantes, materiais naturais, e integração indoor-outdoor. E o estilo mais genuinamente brasileiro.

**Caracteristicas-chave:**
- Plantas como elemento principal de design
- Integracao interior-exterior
- Cores vibrantes e saturadas
- Materiais naturais com textura
- Ventilação e luz natural abundantes

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Verde esmeralda | `#046307` | Plantas, estofados |
| Rosa flamingo | `#FC8EAC` | Almofadas, ceramicas |
| Azul turquesa | `#30D5C8` | Parede destaque, objetos |
| Amarelo ouro | `#FFD700` | Acentos, detalhes |
| Branco natural | `#FEFEFA` | Base neutra |
| Madeira teca | `#7B5B3A` | Pisos, mobiliario |

**Materiais:** Madeira teca/cumaru, palhinha (nanica e indiana), ceramica esmaltada colorida, rattan, fibra de banana, ladrilho hidraulico estampado, bambu, palha natural

**Mobiliario:** Poltrona em rattan ou palhinha, mesa de centro em madeira com base organica, cadeira Acapulco, banco de tronco, aparador com palhinha nas portas

**Iluminacao:** Natural abundante (janelas amplas), pendentes em fibra natural (palha, rattan), lanternas de bambu, luz quente (2700-3000K)

**Ambientes tipicos:** Varanda, sala de estar tropical, area gourmet, banheiro-jardim, lobby de hotel praiano

**Contexto cultural BR:** O estilo mais alinhado com a identidade brasileira. Forte em todo litoral, especialmente NE (Bahia, Pernambuco). Palhinha e material nacional que virou trend global. Roberto Burle Marx como inspiracao paisagistica.

**Mapeamento ControlNet:**
```
Positive: tropical interior, lush indoor plants, rattan furniture, natural wood, vibrant colors, indoor garden, Brazilian tropical style, palm leaves, woven textures, bright natural light, 8k uhd, interior design
Negative: cold, industrial, minimal, dark, enclosed, winter, snow, sterile
CFG Scale: 7-8.5 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.70 | Depth Weight: 0.60
```

---

## 8. Contemporaneo

**Descricao:** Atual sem ser datado. Ecleticismo curado que mistura referencias com coerencia. Conforto com sofisticacao, sem rigidez de um unico estilo.

**Caracteristicas-chave:**
- Mix controlado de materiais e referencias
- Curvas suaves combinadas com linhas retas
- Texturas variadas em harmonia
- Iluminacao em camadas (geral + tarefa + destaque)
- Pecas de design autoral como pontos focais

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Neutro quente | `#E8DFD0` | Paredes, base |
| Terroso | `#A67B5B` | Madeira, detalhes |
| Verde salvia | `#87AE73` | Estofados, plantas |
| Azul petroleo | `#1B4F72` | Parede destaque |
| Terracota suave | `#CC7755` | Almofadas, ceramicas |
| Bronze metalico | `#CD7F32` | Luminarias, detalhes |

**Materiais:** Madeira freijo/carvalho (piso e moveis), tecidos texturizados (boucle, linho, veludo), metais escovados (bronze, latao), porcelanato grande formato (120x120cm), vidro canelado, couro natural

**Mobiliario:** Sofa curvo em boucle, poltrona de design autoral, mesa de jantar em madeira com base metalica, estante assimetrica, puff organico

**Iluminacao:** Sistema em camadas: geral (LED embutido), tarefa (luminaria de mesa), destaque (spot em arte). Pendentes de design, fitas LED indiretas em sancas/nichos

**Ambientes tipicos:** Living completo, sala de TV, home office, quarto master, apartamento decorado de showroom

**Contexto cultural BR:** O estilo mais vendido em decorados de incorporadoras (Cyrela, Even, Trisul). Agrada maioria dos compradores por ser neutro mas com personalidade. Funciona como "estilo default" seguro para staging imobiliario.

**Mapeamento ControlNet:**
```
Positive: contemporary interior, mixed materials, textured fabrics, warm neutrals, layered lighting, curated decor, boucle sofa, brass accents, large format tiles, design furniture, 8k uhd, architectural digest
Negative: dated, excessive, baroque, purely minimalist, cold, cheap, mass-produced
CFG Scale: 7-9 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.75 | Depth Weight: 0.65
```

---

## 9. Boho (Bohemio)

**Descricao:** Ecletico, viajante, e livre. Mix cultural de texturas, padroes, e cores quentes. Acumulo curado que conta historias. Autenticidade acima de perfeicao.

**Caracteristicas-chave:**
- Camadas de texteis (tapetes, mantas, almofadas)
- Mix de padroes etnicos e artesanais
- Plantas em abundancia
- Pecas com historia e patina
- Assimetria intencional e descontração

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Terracota quente | `#C45D3E` | Texteis, ceramicas |
| Mostarda | `#D4A017` | Almofadas, detalhes |
| Turquesa | `#48C9B0` | Acentos, mosaicos |
| Creme envelhecido | `#E8DCCA` | Base, paredes |
| Bordo | `#6B1D2A` | Tapetes kilim, tecidos |
| Verde oliva | `#6B8E23` | Plantas, texteis |

**Materiais:** Macrame artesanal, tapetes kilim, madeira natural com patina, ceramica artesanal pintada a mao, couro natural envelhecido, linho cru, juta, algodao cru, rattan

**Mobiliario:** Poltrona em rattan natural, puffs de chao em couro ou tecido, mesa baixa em madeira, estante com objetos de viagem, futon/daybed, cadeira de balanco

**Iluminacao:** Pendentes de macrame ou fibra natural, lanternas decorativas, fairy lights (pisca-pisca), velas em abundancia, lampadas com filamento visivel

**Ambientes tipicos:** Quarto de solteiro/jovem, sala de estar descontraida, varanda, atelier, espaco de yoga

**Contexto cultural BR:** Forte no circuito Trancoso-Arraial-Noronha. Popular entre millennials e Gen Z criativos. O artesanato brasileiro (macrame nordestino, ceramica do Jequitinhonha) encontra eco natural nesse estilo.

**Mapeamento ControlNet:**
```
Positive: bohemian interior, macrame wall hanging, kilim rug, layered textiles, eclectic mix, indoor plants, warm earthy tones, handcrafted ceramics, rattan chair, vintage furniture, 8k uhd, lifestyle photography
Negative: sterile, corporate, minimal, chrome, uniform, monochromatic, cold
CFG Scale: 6.5-8.5 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.65 | Depth Weight: 0.55
```

---

## 10. Luxo

**Descricao:** Sofisticacao maxima e exclusividade. Materiais premium, design de autor, e atencao obsessiva aos detalhes. Cada elemento e selecionado pela qualidade e raridade.

**Caracteristicas-chave:**
- Materiais premium e exclusivos
- Design de autor em pecas-chave
- Iluminacao dramatica e cenica
- Proporcoes generosas e espacos amplos
- Acabamentos impecaveis, zero compromisso

**Paleta de Cores (Hex):**
| Cor | Hex | Uso |
|-----|-----|-----|
| Preto profundo | `#0D0D0D` | Acentos dramaticos |
| Dourado | `#C9A44A` | Metais, detalhes |
| Champagne | `#F7E7CE` | Paredes, estofados |
| Esmeralda profundo | `#004D40` | Parede destaque, veludo |
| Azul royal | `#1A237E` | Estofados premium |
| Branco puro | `#FFFFFF` | Marmore, superficies |

**Materiais:** Marmore Calacatta/Nero Marquina, onix retroiluminado, couro nappa, madeira ebano/nogueira americana, metal dourado/rose gold, cristal, seda, porcelanato SPC premium

**Mobiliario:** Sofa em couro nappa ou veludo italiano, poltronas de design assinado (B&B Italia, Minotti), mesa em marmore macico, luminarias Flos/Tom Dixon, carpete sob medida

**Iluminacao:** Lustres de design (cristal ou contemporaneo), fitas LED em nichos retroiluminados, iluminacao cenica em obras de arte, dimmers em todos os circuitos, spots embutidos anti-ofuscamento

**Ambientes tipicos:** Penthouse, suite master de alto padrao, sala de jantar formal premium, lavabo de impacto, lobby de hotel 5 estrelas

**Contexto cultural BR:** Mercado concentrado em Jardins/Itaim (SP), Barra/Leblon (RJ), Lago Sul (Brasilia). Marcas brasileiras de luxo: Saccaro, Breton, Dpot. Marmores italianos importados convivem com pedras brasileiras (quartzito, granito Via Lactea).

**Mapeamento ControlNet:**
```
Positive: luxury interior, marble floor, gold accents, designer furniture, high-end materials, dramatic lighting, premium finishes, velvet upholstery, crystal chandelier, art on walls, 8k uhd, luxury architectural photography
Negative: cheap, plastic, mass-produced, basic, simple, budget, ikea, cluttered
CFG Scale: 7-9.5 | Denoising: 0.55-0.70
ControlNet Canny Weight: 0.80 | Depth Weight: 0.70
```

---

## Resumo Comparativo Rapido

| Estilo | CFG Range | Denoising | Canny Weight | Depth Weight | Keyword Token Principal |
|--------|-----------|-----------|-------------|-------------|------------------------|
| Moderno | 7-9 | 0.55-0.70 | 0.75 | 0.65 | `modern interior, clean lines` |
| Industrial | 7-8.5 | 0.50-0.65 | 0.80 | 0.60 | `industrial loft, exposed brick` |
| Minimalista | 8-10 | 0.50-0.65 | 0.70 | 0.70 | `minimalist interior, negative space` |
| Classico | 7-9 | 0.55-0.70 | 0.80 | 0.65 | `classic elegant, crown molding` |
| Escandinavo | 7-9 | 0.55-0.70 | 0.75 | 0.65 | `scandinavian, light wood, hygge` |
| Rustico | 7-8.5 | 0.55-0.70 | 0.75 | 0.60 | `rustic, wooden beams, stone` |
| Tropical | 7-8.5 | 0.55-0.70 | 0.70 | 0.60 | `tropical, lush plants, rattan` |
| Contemporaneo | 7-9 | 0.55-0.70 | 0.75 | 0.65 | `contemporary, mixed materials` |
| Boho | 6.5-8.5 | 0.55-0.70 | 0.65 | 0.55 | `bohemian, macrame, kilim` |
| Luxo | 7-9.5 | 0.55-0.70 | 0.80 | 0.70 | `luxury, marble, gold accents` |

---

## Notas de Uso

1. **Qualidade universal:** Sempre adicionar ao final do prompt: `8k uhd, professional interior photography, architectural digest, natural lighting, detailed textures, photorealistic`
2. **Negative universal:** Sempre incluir: `cartoon, anime, painting, sketch, drawing, watercolor, blurry, low quality, deformed`
3. **Sampler recomendado:** DPM++ 2M Karras, 25-35 steps
4. **Resolucao:** 1024x768 (paisagem) para ambientes abertos, 768x1024 (retrato) para ambientes verticais
5. **Adaptacao BR:** Quando o prompt mencionar materiais, preferir nomes brasileiros (porcelanato vs marble tile, madeira de demolicao vs reclaimed wood)

---

*DecorAI Brasil -- Knowledge Base v1.0*
