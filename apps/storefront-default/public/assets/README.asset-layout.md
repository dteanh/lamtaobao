# Proposed asset layout for homepage recreation batch

Use this when the correct candidate batch arrives.

## Paths
- `public/assets/header/`
  - `logo.*`
  - `nav-icons/`
  - `candidates/`
- `public/assets/hero/`
  - `hero-main.*`
  - `hero-overlay.*`
  - `hero-badges/`
  - `candidates/`
- `public/assets/travel/`
  - `deal-01.*`
  - `deal-02.*`
  - `deal-03.*`
  - `deal-04.*`
  - `candidates/`
- `public/assets/ticket/`
  - `rank-01.*`
  - `rank-02.*`
  - `rank-03.*`
  - `rank-04.*`
  - `icons/`
  - `candidates/`
- `public/assets/footer/`
  - `payments/`
  - `social/`
  - `promo.*`
  - `candidates/`

## Suggested mapping file once target app exists
- `src/data/home.ts`
  - `hero.image`
  - `hero.overlayImage`
  - `travelDeals[].image`
  - `ticketRanking[].image`
  - `footer.promoImage`
  - mark uncertain slots as `TODO:` comments in data mapping, not hidden in component code.
