# Hawaiʻi Food Bank & Pantry Partner Sites (2026)

`hawaii_foodbank_pantry_sites_2026.csv` — distribution / pantry partner sites for
Hawaiʻi's three island food banks, used by the Community section map on the
dashboard (`web/data/foodbanks.json`, projected with `hawaii_islands_proj.json`).

## Sources (live locators, pulled 2026)
- **Hawaiʻi Foodbank** (Oʻahu + Kauaʻi) — Google My Maps "Oʻahu Food Assistance
  Finder" and "Kauaʻi Food Assistance Map" (KML export).
- **Maui Food Bank** (Maui County incl. Molokaʻi/Lānaʻi) — Google My Map on
  mauifoodbank.org/food-distribution-sites.
- **The Food Basket** (Hawaiʻi Island) — MetaLocator locator (Itemid 15159) JSON feed.

## Geocoding
Provider coordinates used where present (The Food Basket, most Kauaʻi). Address-only
sites geocoded via the US Census batch geocoder, with OpenStreetMap Nominatim as
fallback. Bounding-box validated to the main Hawaiian Islands.

## Coverage
243 of ~267 fixed sites mapped (~91%). Omitted: mobile distributions, "various
school locations," and on-base military sites without a fixed public address.
