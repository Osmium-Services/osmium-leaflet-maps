# Leaflet Maps Service

Repo: `Osmium-Services/osmium-leaflet-maps`, service id `leaflet-maps`, category developer. Currently v1.1.4<!--v:leaflet-maps--> (v1.0.0 published 2026-10-07; v1.1.0 added the optional consent gate and the privacy disclosure; v1.1.1 gave the map container a full width; v1.1.2 added the CSP nonce to the inline theme-block scripts).

## What it does

Draws a map of pins from OpenStreetMap tiles with a bundled Leaflet 1.9.4 and MarkerCluster. No API key, no cookies, no admin page.
It is a capability for a theme or another service to use, which is why it sits in Developer next to the Geocoder.

- A `leaflet-maps-assets` theme block loads the CSS and scripts. A theme calls `$template['serviceBlock']('leaflet-maps-assets')`
  once, on a page that shows a map. Pages without a map should not call it.
- A map is any element with `data-osmium-map='{"pins":[{"lat","lng","title","text","url","inactive"}],"height","fullscreen"}'`.
  Build the JSON with `htmlspecialchars(json_encode(...), ENT_QUOTES)`.
- Pins cluster, the map fits its pins, there is a fullscreen button, `inactive` pins show grey. Pin text is inserted as text,
  never HTML (checked with a title containing `<b>`).
- CSP: `img-src https://*.tile.openstreetmap.org`.

## Privacy and consent

- No cookies and nothing stored in the browser (as far as I know), but drawing a map fetches tiles from openstreetmap.org, so the
  visitor's IP address and the page's referrer reach OpenStreetMap. Name OpenStreetMap in the privacy notice. Not legal advice.
  For a UK-only site this is normally a legitimate-interest matter rather than a PECR consent one; some EU authorities read it more strictly.
- Optional per map: `"consent": true` in the pin JSON holds the map back until the visitor accepts cookies (the `osmium_cookie_consent`
  cookie reads `accepted`, or the `osmium:consent` event). Until then the map area shows "This map uses OpenStreetMap. Accept cookies to view it."
  and the page contacts only the site itself. Rejecting keeps the placeholder. On dev and staging there is no banner, so the block sets
  `window.OsmiumLeafletMaps.consentRequired = false` and the map draws at once. Off by default; no dependency on Cookie Consent.
- OpenStreetMap's public tile servers are meant for light use. A busy production site should eventually use a paid or self-hosted tile
  provider (not built; it would be a setting).

## Why it is separate from Shows and the Geocoder

- It draws pins that already have lat/lng. It never geocodes (that is the `geocoder` service) and does not require it.
- **Shows does not require it.** Shows only stores lat/lng, so a theme can pass `Show::listUpcoming()` pins to any renderer. The
  [[Google Maps Service]] (`google-maps`) takes the same pin JSON and can be chosen instead at theme time. The name says the library for that reason.
- It was modelled on the maps in SolarGo2's trade-customer admin page and shows page, but copies none of their logic.

## Public files: `public/` (new core capability)

Until this service no service could ship browser-facing files. Core now copies a service's `public/` folder to
`www/assets/services/<id>/` (gitignored) on install and update, and removes the copy on uninstall (`ServicePublicAssets`, core commit `ccaf4a9`).
Convention only, no manifest key. A failed update republishes the old files. Services without `public/` are unaffected.
Reference those files as `/assets/services/<id>/...`.

## Tested and not tested

- Tested (local install, throwaway static page, real browser): files published, tiles, clustering, inactive pin, popup text escaped, fullscreen both ways, no console errors. v1.1.0 consent gate: live + `consent` waits (only localhost contacted, reject keeps the placeholder, Accept draws with OSM tiles); cookie already `accepted` draws; dev draws at once; live without the option draws as before.
- Not tested: CSP under core's real policy, the theme block in a real theme, a Store install from GitHub. Leaflet's `layers.png` icons are not bundled (no layer control used).
