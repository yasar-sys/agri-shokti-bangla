# Frontend architecture

- Global visual roles live in `src/index.css` and are exposed through semantic Tailwind tokens; legacy utility names remain compatibility aliases so existing pages retain their functionality.
- Display, UI and data typography use separate semantic font families so bilingual content and numeric tools stay consistent.
- Shared editorial motion primitives live in `src/components/ui/editorial.tsx`; reduced-motion preferences govern all reveals and numeric animation.
- Home retains existing hooks, queries, service destinations and account handlers; presentation changes never replace data or domain behavior.
- Home opens the existing lazily loaded voice conversation through a body portal rather than introducing a second voice engine; this preserves its API/fallback and prevents page-motion stacking contexts from covering the microphone.
- Role portals: `account_types` holds farmer/merchant/trader with status guarded by a DB trigger; merchant/trader prices reach `market_prices` only through the admin-only `review_price_submission` function so the public price list stays admin-controlled.

- Archive imagery uses a date-filtered MODIS/Landsat grid layer with URL-keyed local tile caching, separate from pure archive policy helpers; this keeps time selection real and independently testable.
- Service map widgets isolate their stacking contexts and keep shared navigation outside map layers; this prevents map controls from covering app navigation.
- Service route arrivals use a keyed CSS animation wrapper without transforms after completion; this provides shared reduced-motion-safe transitions without trapping fixed map or voice controls.
- Service swipe pagination uses a pure tested helper and the actual service count; this keeps every service reachable as the catalogue changes.
- Missing NASA/OpenET/Crop-CASMA responses must produce unavailable states, never generated measurements; real providers remain the source of agricultural results.
- Pest report counts and dominant pests use a pure tested summary of submitted reports, separate from weather-derived risk estimates, to prevent fabricated observations.
