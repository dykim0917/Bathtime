# Bathtime Pocket prototype

Open `/prototypes/pocket/index.html` through the existing public web server, or open `index.html` directly in a modern browser. No dependencies or API keys are required. Browser storage behavior can differ for file URLs; use a local web server for persistence testing.

## Implemented

- Responsive personal archive, text search, category filters, region collections and an unclassified inbox.
- Save HTTP(S) links, edit place information, delete saved places and retain changes in localStorage.
- Normalize common YouTube URL forms and reject duplicate links.
- Combine links when the user supplies exactly the same non-empty region and place name.
- Open original links and Google Maps searches.
- A clearly labeled sample flow demonstrates a prepared classification result and place grouping.

## Deliberately simulated

The four starting places and illustrations are demo content. Their sources are Maps searches and a YouTube search, not real imported social posts. The example action uses prepared data; it does not analyze a video. Arbitrary URLs are saved without fetching metadata. Source badges are inferred from the URL host. No social login, native share extension, AI extraction, embedded map, Google Maps list sync, or cloud sync is implemented.

Data uses the isolated `bathtime-pocket-prototype-v1` localStorage key. Existing application data and authentication are untouched. Reloading preserves an empty collection after deleting all items.

## Reference and integration

The requested Cordix C-membership listing was reviewed on 2026-09-21:
https://play.google.com/store/apps/details?hl=ko&id=com.application.travelassi

Its public description documents map-based itineraries, expenses and member benefits. It does not confirm social-video importing. This prototype follows the user's proposed workflow rather than claiming feature parity.

For production, port the approved interaction into the existing React Native app and integrate external-link records alongside existing saved content. Preserve current saved content IDs and user associations. Validate Instagram metadata access and place extraction with actual shared links before promising automatic classification. Implement native share entry points and account-backed persistence separately. The standalone HTML is an interaction prototype, not a drop-in replacement for the shipped app.

## Verification

Playwright checks passed at desktop 1365×980 and mobile 390×844: save and reload, prepared grouping, unsafe scheme rejection, unclassified inbox, edit, search and empty state, YouTube duplicate normalization, region navigation, outbound map URL, deletion, dialog Escape, no horizontal mobile overflow and no browser runtime errors. This does not validate production social integrations or native device behavior.
