# AgriShokti visual redesign — first review

## All-service verification
- [x] Audit all 40 non-auth registered routes in an authenticated session: no page crashes or desktop overflow; diagnosis correctly redirects without an input image.
- [x] Exercise land/price conversion, diesel and NPK arithmetic, storage create → reload → delete, live weather and failure state, chat, market AI, irrigation, measured-zone VRF, yield and both image scanners. Live functions returned 200; arithmetic does not certify agronomic recommendations.
- [x] Correct fabricated pest counts/default weather, fake soil measurements, buyer telephone placeholders, personal machine records/current diesel price, synthetic frontend VRF zones and mismatched summaries; replace crop-independent calendar prescriptions with duration-based monitoring reminders. Repeat affected flows and mobile overflow checks.
- [ ] Real-device microphone/camera capture/native installation: requires physical device and permission interaction; upload paths and live scanner responses were tested.
- [ ] Provider acquisition and agronomic validation: NASA/OpenET/Crop-CASMA coverage, irrigation model, NPK rates, yield confidence and visual disease diagnosis require provider data and qualified validation. No claim of certified recommendations.
- [ ] Privileged admin actions and public posting/commerce mutations: need a designated authorized test account and approved disposable records; no real public offers/posts/prices were modified.

## Formal interactive refresh
- [x] Make Home more formal and visually substantial while preserving existing services and real data.
- [x] Add shared reduced-motion-safe page and control interactions; correct service pagination (6 regression tests pass with archive tests).
- [x] Audit inactive actions and simulated results: remove random NASA/OpenET/Crop-CASMA fallback measurements, fabricated satellite insights and submission links; derive pending calendar dates from saved tasks; require supplied rainfall for yield estimates.
- [x] Verify authenticated Home, voice opening, pagination and 29 service routes; no page errors/overflow at tested sizes. Calendar create → task update → reload → delete verified; missing owner UPDATE policy corrected.
- [ ] Verify real microphone/camera/native installation and all provider-dependent outputs. Blocked on actual device interaction and available provider acquisitions; page navigation alone does not certify these flows.

## Current corrections
- [x] Prevent pest district/zoom and legend/scale overlap; wrap shared service tabs and isolate map layers.
- [x] Keep AgroMonitoring; remove selectable Sentinel-2; date-filtered MODIS/Landsat archive browsing 2000–2026 with fetched-tile caching and unavailable-image feedback.
- [x] Restore laptop splash and global night-mode controls.
- [x] Verify splash, pest controls, themes and satellite dates/cache on mobile/desktop; 11 additional service routes checked for overflow/crashes.

- [x] Establish editorial light/dark tokens, bilingual typography, accessible shared controls and reduced-motion support.
- [x] Redesign Home with prominent voice entry, live weather/market data, editorial services, preserved swipe and account/install flows.
- [x] Verify Home on mobile/desktop and check navigation, theme, notifications, installation and voice entry (install event simulated; native installation and live voice/audio not claimed).

Scope: first Home-page review requested by the user. Other pages receive global tokens only; their individual redesigns and full-site Lighthouse audit are subsequent stages. No backend, API, route or data changes.
- [x] Portals: farmer / merchant / trader + admin panel (approvals, price publishing)
- [x] Apply shared Home theme, safe navigation space and wrapping service tabs globally.

Deferred scope: individual editorial redesign of every service and full-site Lighthouse audit are not claimed by these corrections. Interactive globe omitted to keep startup lightweight. Native Android package was not rebuilt.
