# Task: Parse Textual Description with Measurements

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | parse-dimensions |
| **status** | `pending` |
| **responsible_executor** | @spatial-analyst |
| **execution_type** | `Agent` |
| **input** | Textual description with room measurements |
| **output** | Structured dimension table with validated plausibility |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Parse natural language descriptions containing room measurements and convert them into structured spatial data. Users describe spaces in varied formats ("sala 4x6", "quarto de 3 por 4 metros", "cozinha 2.5m x 3m com pe direito 2.8m"). This task normalizes all formats into a validated dimension table that feeds the croqui generation pipeline.

## Inputs

- Textual description from user containing measurements (any format)
- Optional: room type specification
- Optional: photo reference for cross-validation

## Preconditions

- User has provided at least one textual description with spatial information
- Description contains at least one dimensional reference (explicit or implicit)

## Steps

1. **Receive and classify input text**
   - Identify language and measurement units used
   - Classify description richness: detailed (with numbers), moderate (some numbers), vague (no numbers)
   - If vague (no numbers at all), switch to estimation mode and ask for key measurements

2. **Extract explicit dimensions**
   - Parse all numeric measurements using accepted formats:
     - `NxM` or `N x M` (4x6, 4 x 6)
     - `N por M` (3 por 4)
     - `N metros por M metros`
     - `NmxMm` (4m x 6m)
   - Extract room dimensions: length, width
   - Extract ceiling height if mentioned
   - Extract opening dimensions (doors, windows) if mentioned
   - Extract furniture dimensions if mentioned

3. **Extract positional information**
   - Parse wall references: "parede norte", "parede da frente", "lado esquerdo"
   - Parse element positions: "janela na parede norte", "porta lado esquerdo"
   - Parse orientation mentions: cardinal directions, relative positions
   - Map all positional data to a consistent coordinate system

4. **Infer missing standard dimensions**
   - If door dimensions not given, infer standard: 0.80m x 2.10m
   - If ceiling height not given, infer standard: 2.70m (flag as inferred)
   - If window sill not given, infer standard: 1.00-1.10m
   - Mark ALL inferred dimensions with "(?) inferred" flag

5. **Validate physical plausibility**
   - No residential dimension > 20m (flag as probable typo if exceeded)
   - Ceiling height within 2.40m - 4.00m range
   - Minimum areas by room type: bathroom 2.5m2, bedroom 8m2, living room 12m2
   - Door minimum width: 0.60m (accessibility: 0.80m+)
   - Furniture must fit within stated room dimensions

6. **Check circulation feasibility**
   - Verify mentioned furniture fits in the room with circulation space
   - Minimum circulation: 0.60m between furniture pieces
   - Flag impossible configurations ("cama + guarda-roupa na parede de 3.5m = 3.58m NAO CABE")

7. **Identify missing data**
   - List all data points that were not provided but are needed for croqui
   - Prioritize questions: most impactful missing data first
   - Formulate specific questions for the user (max 4 questions per round)

8. **Generate structured dimension table**
   - Create table with columns: Element, Dimension, Source, Status
   - Source values: "Texto usuario", "Inferido (padrao)", "Calculado"
   - Status values: "Validado", "Precisa confirmacao", "Flag: inconsistencia"

## Outputs

- **Dimension Table** with all extracted and inferred measurements
- **Plausibility Report** with validation results
- **Circulation Check** confirming furniture layout feasibility
- **Missing Data List** with prioritized questions for the user
- **Parsing Summary** in natural language explaining interpretation

## Acceptance Criteria

- [ ] All explicit numeric dimensions extracted and tabulated
- [ ] All positional references mapped to consistent coordinate system
- [ ] Missing standard dimensions inferred with "(?) inferred" flag
- [ ] Physical plausibility validated for all dimensions (range checks applied)
- [ ] Circulation feasibility checked for mentioned furniture
- [ ] Missing data identified with max 4 specific questions formulated
- [ ] Structured dimension table generated with Element, Dimension, Source, Status columns

## Quality Gate

- Every extracted dimension must trace back to the original text (no hallucinated measurements)
- Inferred dimensions must be clearly distinguished from user-provided dimensions
- If any dimension exceeds plausibility ranges, task must flag it and ask for confirmation before proceeding
- Output format must match the parse-dimensions example in spatial-analyst agent definition
- At minimum, length and width of the room must be captured (explicitly or via clarification request)
