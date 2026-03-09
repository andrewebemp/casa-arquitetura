# Task: Plan Integration Strategy with Brazilian Real Estate Portals

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | plan-portal-integration |
| **status** | `pending` |
| **responsible_executor** | @proptech-growth |
| **execution_type** | `Agent` |
| **input** | Portal API documentation + partnership models + technical requirements |
| **output** | Integration strategy document with technical spec and partnership approach |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Plan the integration strategy with major Brazilian real estate portals (ZAP Imoveis, QuintoAndar, OLX Imoveis, Imovelweb, VivaReal) to enable seamless virtual staging from within listing workflows. Portal integration is a critical distribution channel -- instead of users coming to DecorAI separately, staging is offered at the point of listing creation where the pain is most acute. This task defines the technical integration approach, partnership model, and go-to-market strategy for each portal.

## Inputs

- Brazilian real estate portal landscape analysis
- Portal API documentation (where publicly available)
- Partnership model templates (revenue share, flat fee, freemium)
- DecorAI technical capabilities and API design
- Market data: listing volumes per portal, user demographics

## Preconditions

- DecorAI core pipeline functional (generate renders from photos)
- API design for external consumption planned
- Understanding of Brazilian PropTech partnership dynamics

## Steps

1. **Map the Brazilian portal ecosystem**
   - Tier 1 (must-have): ZAP Imoveis (Grupo OLX), QuintoAndar
   - Tier 2 (high value): OLX Imoveis, VivaReal, Imovelweb
   - Tier 3 (opportunistic): Loft, EmCasa, Casafe, regional portals
   - For each: listing volume, user base, API availability, tech stack
   - Identify key decision-makers and partnership paths

2. **Define integration patterns**
   - Pattern A - Embedded Widget: staging button within listing creation flow
   - Pattern B - API Integration: portal calls DecorAI API, displays results
   - Pattern C - Photo Enhancement: auto-suggest staging for low-quality photos
   - Pattern D - Plugin/Extension: browser extension for portal users
   - Pattern E - White-Label: portal-branded staging (powered by DecorAI)
   - Recommend optimal pattern per portal based on their tech openness

3. **Design the DecorAI API for portal consumption**
   - POST /v1/staging/analyze - submit photo for diagnostic (lightweight)
   - POST /v1/staging/generate - request full staging render
   - GET /v1/staging/{id}/status - check render status (async)
   - GET /v1/staging/{id}/result - retrieve rendered image
   - POST /v1/staging/{id}/refine - request refinement on existing render
   - Authentication: API key per portal partner
   - Rate limiting: based on partnership tier
   - Webhooks: notify portal when render is complete

4. **Define partnership models per portal**
   - Revenue share: DecorAI charges portal a discounted rate, portal marks up to user
   - Flat fee per listing: portal pays fixed fee for staging included in listing package
   - Freemium bundle: basic staging free with listing, premium features paid
   - Lead generation: free staging, DecorAI gets user data for direct marketing
   - White-label licensing: monthly fee for branded solution
   - Recommend model per portal based on their business model alignment

5. **Analyze technical integration requirements**
   - OAuth/SSO for seamless user experience
   - Image format and resolution requirements per portal
   - Metadata standards (RESO, custom schemas)
   - CDN and delivery requirements (latency, availability)
   - Mobile SDK requirements (if portal has mobile apps)
   - LGPD compliance requirements for data handling

6. **Design go-to-market approach per portal**
   - ZAP: approach via Grupo OLX innovation/partnerships team
   - QuintoAndar: approach via product/engineering (tech-forward culture)
   - OLX: approach via marketplace tools team
   - For each: pitch deck angle, POC scope, timeline, success metrics
   - Identify potential blockers: exclusive deals, competitive products, tech debt

7. **Define integration success metrics**
   - Adoption rate: % of portal users who use staging
   - Conversion lift: % increase in listing views/contacts after staging
   - Revenue per integration: monthly revenue from each portal partnership
   - Technical SLA: uptime, response time, error rate per integration
   - User satisfaction: NPS from portal users using DecorAI

8. **Compile integration strategy document**
   - Portal ecosystem map with priority ranking
   - Integration pattern recommendations per portal
   - API specification summary
   - Partnership model recommendations
   - Go-to-market playbook per Tier 1 portal
   - Technical requirements and LGPD compliance plan
   - Timeline: pilot (3 months), expansion (6 months), scale (12 months)

## Outputs

- **Portal Ecosystem Map** with priority ranking and decision-maker paths
- **Integration Pattern Matrix** (portal x pattern recommendation)
- **API Specification Summary** for portal consumption
- **Partnership Model Recommendations** per portal
- **Go-to-Market Playbook** for Tier 1 portals
- **Technical Integration Requirements** with compliance plan
- **Timeline and Milestone Plan** (pilot -> expansion -> scale)

## Acceptance Criteria

- [ ] At least 5 Brazilian portals analyzed with priority ranking
- [ ] Integration patterns defined and recommended per portal
- [ ] API design for portal consumption includes minimum 5 endpoints
- [ ] Partnership model recommended for each Tier 1 portal with rationale
- [ ] Go-to-market approach defined for at least 2 Tier 1 portals
- [ ] LGPD compliance requirements documented for data handling
- [ ] Timeline defined with clear milestones for pilot, expansion, and scale phases

## Quality Gate

- Portal priority ranking must be based on listing volume and technical openness data, not assumptions
- API design must be RESTful, well-documented, and suitable for third-party consumption
- Partnership models must be financially viable (maintain > 50% margin even in revenue share)
- Integration must not create portal lock-in -- DecorAI must remain independent
- LGPD compliance is non-negotiable -- all data handling must comply with Brazilian data protection law
- Go-to-market approach must be actionable (specific teams to contact, not vague "partner with them")
