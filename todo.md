# TODO

## USDA automated download — rate-limit / bot-block
- **Issue:** `download_and_update.py --monthly` / `--retailers` discovery fails when USDA's site (Akamai) rate-limits this environment. It returns a ~1.3 KB challenge stub to both `curl` and Python `requests`, and a real headless browser (Playwright/Chromium) times out entirely. The block is IP/rate-based at the network layer, not a JS challenge, so browser automation (Puppeteer/Playwright) does **not** get past it.
- **Impact:** Low / transient. The pull aborts regression-safe (no data change), and the repo's USDA data is already current (monthly → May 2025, retailers → 2025). DHS pulls are unaffected.
- **Workarounds / next steps:**
  - Retry later (the block clears after a while) or run from a different IP/network.
  - Run locally on a non-blocked machine: `python scripts/download_and_update.py --monthly --retailers`.
  - Consider adding polite throttling/backoff + a "looks rate-limited" detection (tiny response body) to `discover_file_url` so failures report clearly instead of "no file link found".
  - Note: USDA currently publishes an *older* monthly file than the repo holds (their rollback to a March-2025 revision), so there is likely nothing newer to fetch right now regardless.
