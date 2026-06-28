# Hawaii SNAP Data Directory

Processed Hawaii SNAP (Supplemental Nutrition Assistance Program) data files. Every dataset's origin is recorded in **[`SOURCES.json`](SOURCES.json)** (publisher, source file, "data as of" date, coverage), which the pipeline writes automatically and the dashboard surfaces in `web/data/metadata.json`.

## 📊 Current/Active Data Files

### USDA federal data
- **`Statewide Monthly SNAP FY 89-25.csv`** — monthly statewide participation, **Oct 1988 – May 2025** (440 months). Columns: Date, Household, Persons, Per Household, Per Person, Cost. Source: USDA FNS National Data Bank.
- **`County Bi-Annual SNAP 89-25.csv`** — county-level Jan/Jul participation & issuance, **FY1989 – Jan 2025**. Source: USDA FNS.
- **`hawaii_snap_retailers_2004-2025_valid_coords.csv`** ⭐ — SNAP retailers with validated Hawaii coordinates (2,548 records). Use for mapping.
- **`hawaii_snap_retailers_2004-2025_all.csv`** — full retailer record incl. invalid/missing coords (2,686 records), **2004 – 2025**. Unioned across USDA releases to preserve history beyond USDA's rolling ~20-year window.

### Hawaii DHS state data (monthly, more current than USDA)
- **`dhs_snap_participation_by_island.csv`** — monthly participation by island/branch (Oahu, Hawaii, Kauai, Maui, Molokai, Lanai, + State) with program breakdown, **SFY 2009 – May 2026** (213 months, backfilled). Columns: Date, Island, Participants, Households, BenefitsIssued, ParticipantsSNAPOnly.
- **`dhs_snap_application_timeliness.csv`** — monthly statewide applications received + on-time processing rates, **FFY 2009 – May 2026** (180 months; some source-side gaps, see `SOURCES.json`).

### Supplemental / reference
- **`county_population.csv`** — 2024 Hawaii State Census county populations; used to compute per-capita `participationRate`.
- **`County Weekly Applications 4:2020-3:2022.csv`** — COVID-era weekly applications by county (Apr 2020 – Apr 2022). **Discontinued**; partly succeeded by the DHS participation/timeliness data above.
- **`hawaii_snap_extracted_fy89-fy25.csv`** — intermediate raw extract from the USDA FY Excel files.
- **`SOURCES.json`** — provenance manifest for every dataset.

## 🔄 Updating the data

Updates are automated — no manual downloads:

```bash
python scripts/download_and_update.py --all        # USDA monthly/retailer + DHS, forward-only
python scripts/download_and_update.py --dhs-backfill   # one-time: rebuild DHS history from archives
```

The pipeline auto-discovers the current source files, extracts Hawaii records, merges **forward-only** (a regressed upstream release can never overwrite newer local data), records provenance to `SOURCES.json`, and rebuilds the dashboard JSON. See the main [README](../README.md#automated-pipeline--provenance) and [scripts/README.md](../scripts/README.md).

> **Note:** USDA's site (Akamai) may rate-limit automated requests; if discovery fails, retry later or from another network. County bi-annual has no auto-discoverable file and is updated manually.

## 📁 Directory structure

```
Data/
├── README.md / SOURCES.json
├── Statewide Monthly SNAP FY 89-25.csv
├── County Bi-Annual SNAP 89-25.csv
├── hawaii_snap_retailers_2004-2025_{all,valid_coords}.csv
├── dhs_snap_participation_by_island.csv
├── dhs_snap_application_timeliness.csv
├── county_population.csv
├── County Weekly Applications 4:2020-3:2022.csv
├── source/      # large source files (gitignored)
└── backups/     # timestamped pre-update backups (gitignored)
```

## 📈 Latest figures

- **USDA statewide (May 2025):** 163,576 persons · 84,333 households · $59.2M/mo · $701.72/household.
- **DHS statewide (May 2026):** 157,954 participants · 78,458 households (a year more current than USDA).
- **Per-capita (latest):** Hawaii County 18–19% of residents on SNAP (highest) vs Honolulu ~9% (lowest); statewide ~11%.

## 📝 Version history

- **v4.0** (Jun 2026): Integrated Hawaii DHS by-island participation + application timeliness (2009–2026); retailer union to 2025; per-capita layer; provenance manifest; automated pipeline.
- **v3.0** (Oct 2025): Monthly through May 2025, retailer through Dec 2024.
- **v1.0–2.0** (2022): Initial dataset + retailer data.

---

**Questions?** See the main [README](../README.md) or open an issue.
