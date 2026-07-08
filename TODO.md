# TODO

## USDA automated download — rate-limit / bot-block
- **Issue:** `download_and_update.py --monthly` / `--retailers` discovery fails when USDA's site (Akamai) rate-limits this environment. It returns a ~1.3 KB challenge stub to both `curl` and Python `requests`, and a real headless browser (Playwright/Chromium) times out entirely. The block is IP/rate-based at the network layer, not a JS challenge, so browser automation (Puppeteer/Playwright) does **not** get past it.
- **Impact:** Low / transient. The pull aborts regression-safe (no data change), and the repo's USDA data is already current (monthly → May 2025, retailers → 2025). DHS pulls are unaffected.
- **Workarounds / next steps:**
  - Retry later (the block clears after a while) or run from a different IP/network.
  - Run locally on a non-blocked machine: `python scripts/download_and_update.py --monthly --retailers`.
  - Consider adding polite throttling/backoff + a "looks rate-limited" detection (tiny response body) to `discover_file_url` so failures report clearly instead of "no file link found".
  - Note: USDA currently publishes an *older* monthly file than the repo holds (their rollback to a March-2025 revision), so there is likely nothing newer to fetch right now regardless.

## Move hosting from Netlify → Cloudflare Pages (continuous deploy)
Currently on **Netlify** (site `hi-snap` → snap.supersistence.org, auto-deploy from `main`). Move to **Cloudflare Pages** continuous deploy.

- **Chosen path:** native CF Pages Git integration (matches the growkoa / hawaiifoodatlas setup on the same CF account, `cd4227e8…`).
- **Facts already checked:**
  - `supersistence.org` DNS is already on Cloudflare (NS `gail`/`woz.ns.cloudflare.com`), so the custom domain is a click — CF auto-creates the record.
  - `snap.supersistence.org` currently CNAMEs to `hi-snap.netlify.app`; that record must be replaced when the Pages custom domain is added.
- **Steps (dashboard):** Workers & Pages → Create → Pages → Connect to Git → `supersistence/Hawaii-SNAP`
  - Production branch: `main`
  - Build command: `pip install -r requirements-build.txt && python scripts/prepare_web_data.py` (or **no build** — `web/` already contains committed JSON; the local pipeline regenerates it)
  - Output directory: `web`
  - Env: `PYTHON_VERSION = 3.11`
  - Then: add custom domain `snap.supersistence.org` → decommission Netlify (turn off auto-deploy or delete `hi-snap`) → delete `netlify.toml`.
- **Prep already done in repo:** `web/_headers` and `web/_redirects` translate `netlify.toml`'s headers/redirects (valid on both platforms).
- **Bigger picture / open question:** the data will *eventually be served by the hawaiifoodatlas project*. So decide whether snap.supersistence.org is a permanent Pages home or a way-station until hawaiifoodatlas absorbs the data. If hawaiifoodatlas (different origin) will fetch these JSON files, add CORS (`Access-Control-Allow-Origin`) to `/data/*.json` in `web/_headers`, or move the data to R2 / into the hawaiifoodatlas repo. Keeping the JSON build reproducible (from CSVs) keeps the data portable either way.
