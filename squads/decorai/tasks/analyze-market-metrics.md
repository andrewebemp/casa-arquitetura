# Task: Analyze Growth Metrics and KPIs for the Platform

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | analyze-market-metrics |
| **status** | `pending` |
| **responsible_executor** | @proptech-growth |
| **execution_type** | `Agent` |
| **input** | Platform usage data + market benchmarks + business goals |
| **output** | Metrics dashboard definition with KPIs, targets, and analysis framework |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Define, analyze, and track the growth metrics and KPIs that measure DecorAI's market performance and business health. This task establishes the measurement framework from day one, defining what to measure, how to measure it, target values, and interpretation guidelines. The framework covers acquisition (how users find us), activation (first value delivery), retention (repeat usage), revenue (monetization), and referral (viral growth) following the AARRR pirate metrics model adapted for the Brazilian PropTech market.

## Inputs

- Platform usage data (when available; benchmarks when pre-launch)
- Market benchmarks from comparable PropTech/AI SaaS products
- Business goals and milestones (from PRD and business plan)
- Funnel design (from design-reverse-staging-funnel)
- Pricing model (from create-pricing-strategy)

## Preconditions

- Business model defined (pricing tiers, target market)
- Funnel stages defined
- Understanding of Brazilian PropTech market dynamics

## Steps

1. **Define AARRR metric categories**
   - Acquisition: how users discover DecorAI
     - Organic traffic, paid acquisition, portal integration referrals, word-of-mouth
   - Activation: first value moment
     - Free diagnostic completed, first render viewed, "aha moment"
   - Retention: repeat usage
     - Return within 7 days, monthly active users, renders per user per month
   - Revenue: monetization
     - Conversion rate, ARPU, MRR, LTV, CAC
   - Referral: viral growth
     - Referral rate, viral coefficient, NPS

2. **Define primary KPIs (North Star + supporting)**
   - North Star Metric: "Number of staged listing photos delivered per month"
     - Why: directly correlates with value delivered and revenue
   - Supporting KPIs:
     - Diagnostic-to-staging conversion rate (target: 15-25%)
     - Average renders per paying user per month
     - Time from upload to delivery (< 2 minutes target)
     - Quality satisfaction score (user rating > 4.2/5)
     - Net Revenue Retention (NRR > 110%)

3. **Set benchmark targets by phase**
   - Pre-launch (beta): focus on activation and quality
   - Launch (month 1-3): focus on acquisition and conversion
   - Growth (month 4-12): focus on retention and revenue
   - Scale (month 12+): focus on efficiency and expansion
   - For each phase, define target values for each KPI

4. **Design cohort analysis framework**
   - Weekly cohorts: track behavior from first visit through 30/60/90 days
   - Cohort metrics: retention curve, time-to-first-purchase, LTV evolution
   - Segment cohorts by: acquisition channel, user type (corretor vs imobiliaria), region
   - Define healthy vs concerning cohort patterns

5. **Map unit economics metrics**
   - Customer Acquisition Cost (CAC) by channel
   - Lifetime Value (LTV) by segment
   - LTV/CAC ratio (target: > 3.0)
   - Payback period (target: < 6 months)
   - Gross margin per render
   - Blended vs channel-specific CAC

6. **Define operational metrics**
   - Render quality: average FID, SSIM, CLIP Score per day
   - Pipeline performance: average render time, failure rate, retry rate
   - Infrastructure cost: cost per render trend over time
   - User satisfaction: NPS, support tickets, churn reasons
   - Feature adoption: % using refinement, % using style comparison

7. **Compile metrics dashboard specification**
   - Dashboard layout with primary KPIs prominently displayed
   - Drill-down capability for each metric
   - Alerting thresholds: when metrics deviate from targets
   - Reporting cadence: daily (operational), weekly (growth), monthly (business)
   - Data sources and collection methodology for each metric

## Outputs

- **KPI Framework** with North Star metric and supporting KPIs
- **Benchmark Targets** per phase (pre-launch, launch, growth, scale)
- **Cohort Analysis Framework** with segmentation criteria
- **Unit Economics Dashboard** (CAC, LTV, LTV/CAC, payback)
- **Operational Metrics** definition (quality, performance, cost)
- **Dashboard Specification** with layout, alerts, and reporting cadence
- **Metric Interpretation Guide** explaining what each metric means and how to act on it

## Acceptance Criteria

- [ ] AARRR categories defined with specific metrics for each stage
- [ ] North Star metric identified with clear rationale
- [ ] Benchmark targets set for at least 4 business phases
- [ ] Cohort analysis framework defined with segmentation criteria
- [ ] Unit economics metrics defined: CAC, LTV, LTV/CAC, payback
- [ ] Operational metrics defined for quality, performance, and cost
- [ ] Dashboard specification includes alerting thresholds and reporting cadence

## Quality Gate

- North Star metric must be actionable (team can influence it) and measurable
- Benchmark targets must be realistic for the Brazilian PropTech market (not US/EU benchmarks directly)
- LTV/CAC ratio target must account for Brazilian payment patterns (boleto delays, chargebacks)
- All metrics must have a clear data collection methodology defined
- Vanity metrics (total registrations, page views) should be excluded or clearly labeled as secondary
- Metrics framework must be implementable with standard analytics tools (Mixpanel, Amplitude, or PostHog)
