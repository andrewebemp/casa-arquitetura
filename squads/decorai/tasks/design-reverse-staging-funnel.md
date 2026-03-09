# Task: Design the Complete Reverse Staging Diagnostic Funnel

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | design-reverse-staging-funnel |
| **status** | `pending` |
| **responsible_executor** | @proptech-growth |
| **execution_type** | `Agent` |
| **input** | Product requirements + target market data + competitive landscape |
| **output** | Complete reverse staging funnel design with conversion metrics and implementation spec |
| **action_items** | 9 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Design the complete reverse staging diagnostic funnel -- DecorAI's unique growth mechanism where users start with a "diagnostico de vendabilidade" (saleability diagnostic) for their property listing, receive free value (current listing analysis), and are upsold into paid virtual staging services. This funnel inverts the traditional staging approach: instead of "make your room pretty", it starts with "let me show you why your listing isn't converting" and positions virtual staging as the evidence-based solution. Implements FR-12 (reverse staging entry), FR-13 (diagnostic pipeline), FR-16 (conversion optimization).

## Inputs

- Product requirements document (docs/prd.md)
- Brazilian real estate market data (portal metrics, listing conversion benchmarks)
- Competitive landscape analysis (existing staging services, pricing)
- Target user profiles (corretores, imobiliarias, incorporadoras)
- Platform capabilities (what DecorAI can technically deliver)

## Preconditions

- Product vision and core features defined in PRD
- Understanding of Brazilian real estate portal ecosystems (ZAP, QuintoAndar, OLX Imoveis)
- Baseline metrics for listing performance (views, contacts, time-to-sell)

## Steps

1. **Define funnel stages**
   - Stage 0 - Awareness: how users discover the diagnostic
   - Stage 1 - Entry: free saleability diagnostic submission (photo upload)
   - Stage 2 - Analysis: AI analysis of current listing quality
   - Stage 3 - Report: diagnostic report with issues identified and scored
   - Stage 4 - Solution: virtual staging as the recommended solution
   - Stage 5 - Conversion: paid staging service purchase
   - Stage 6 - Delivery: staged photos delivered
   - Stage 7 - Retention: repeat usage, subscription, referral

2. **Design Stage 1: Diagnostic Entry**
   - Minimal friction entry: upload 1 photo + select room type
   - No registration required for initial diagnostic
   - Mobile-optimized (corretores use phones predominantly)
   - Copy framework: "Descubra por que seu imovel nao vende em 30 segundos"
   - Value proposition: free analysis, no obligation

3. **Design Stage 2-3: Analysis and Report**
   - AI analyzes listing photo for:
     - Lighting quality (dark rooms = fewer clicks)
     - Clutter and visual noise
     - Room staging quality (empty vs furnished)
     - Photo composition and angle
     - Comparison to high-converting listings
   - Generate scored report (0-100 "vendabilidade" score)
   - Identify top 3 improvement opportunities
   - Show before/after preview of what staging could do

4. **Design Stage 4-5: Solution and Conversion**
   - Position virtual staging as the solution to identified issues
   - Show ROI calculator: "Imoveis com staging vendem X% mais rapido"
   - Offer tiered pricing: single room, full property, subscription
   - Include social proof: testimonials, case studies, statistics
   - Create urgency: "Seu concorrente ja usa staging em 3 de 5 anuncios"

5. **Define conversion micro-metrics**
   - Entry rate: % of visitors who upload a photo
   - Completion rate: % who complete the diagnostic
   - Report engagement: time spent reading report, sections clicked
   - Preview interaction: % who interact with before/after preview
   - Conversion rate: % who purchase staging after diagnostic
   - Average order value (AOV) per conversion
   - Time from diagnostic to purchase

6. **Design retention and referral loops**
   - Post-delivery feedback: "Did the staging help sell faster?"
   - Referral mechanism: share diagnostic link with other corretores
   - Subscription model: unlimited staging for monthly fee
   - Agency dashboard: manage multiple listings and agents
   - Re-engagement: notify when listing hasn't updated photos in 30+ days

7. **Map funnel to technical implementation**
   - Stage 1: simple upload API + room classification
   - Stage 2-3: lightweight AI analysis (CLIP scoring, basic quality metrics)
   - Stage 4: before/after preview using quick-render (low-quality for speed)
   - Stage 5: payment integration (Stripe/Asaas) + full pipeline trigger
   - Stage 6: @staging-architect full pipeline delivery
   - Stage 7: CRM integration + notification system

8. **Define A/B testing framework**
   - Key variables to test: entry copy, diagnostic depth, preview quality, pricing display
   - Test methodology: sequential A/B with statistical significance thresholds
   - Minimum sample sizes per variant
   - Test duration guidelines (7-14 day cycles minimum)

9. **Compile funnel design document**
   - Complete funnel diagram with all stages and metrics
   - UX wireframes or descriptions for each stage
   - Copy framework for key conversion points
   - Technical implementation requirements per stage
   - Metric targets for each funnel stage
   - A/B testing plan for optimization

## Outputs

- **Funnel Design Document** with all 8 stages mapped
- **Conversion Metrics Framework** with target KPIs per stage
- **UX Flow Description** for each funnel stage
- **Copy Framework** for key conversion moments
- **Technical Implementation Spec** mapping stages to pipeline components
- **A/B Testing Plan** for funnel optimization
- **ROI Calculator Model** for the solution stage

## Acceptance Criteria

- [ ] All 8 funnel stages defined with clear entry/exit criteria
- [ ] Minimal-friction entry designed (1 photo upload, no registration)
- [ ] Diagnostic scoring system defined (0-100 vendabilidade score)
- [ ] Conversion micro-metrics identified with target ranges
- [ ] Retention and referral loops designed
- [ ] Technical implementation mapped to DecorAI pipeline components
- [ ] A/B testing framework defined with variables and methodology
- [ ] ROI calculator model created with Brazilian market data

## Quality Gate

- Funnel must be mobile-first (corretores work from phones)
- Free diagnostic must deliver genuine value (not just a teaser) to build trust
- Conversion pressure must be ethical -- no dark patterns, no misleading statistics
- All market statistics used must be verifiable or clearly stated as estimates
- Pricing in the funnel must align with create-pricing-strategy task output
- Technical implementation must be feasible with current DecorAI pipeline capabilities
