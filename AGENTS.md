# Frontend architecture

- Global visual roles live in `src/index.css` and are exposed through semantic Tailwind tokens; legacy utility names remain compatibility aliases so existing pages retain their functionality.
- Display, UI and data typography use separate semantic font families so bilingual content and numeric tools stay consistent.
- Shared editorial motion primitives live in `src/components/ui/editorial.tsx`; reduced-motion preferences govern all reveals and numeric animation.
- Home retains existing hooks, queries, service destinations and account handlers; presentation changes never replace data or domain behavior.
- Home opens the existing lazily loaded voice conversation rather than introducing a second voice engine, preserving its API and browser-TTS fallback.