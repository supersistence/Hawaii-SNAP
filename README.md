# Compiling and Sharing SNAP Data for Hawaii

> **🚀 NEW: Interactive Visualization Dashboard** - [View deployment guide](web/DEPLOY_NOW.md) | Explore Hawaii SNAP data through interactive charts and analysis. Ready to deploy to Netlify in < 1 minute!

> **✅ DATA CURRENT:** USDA statewide monthly through **May 2025**, county through **Jan 2025**, retailers through **2025**, and Hawaii DHS by-island participation + application timeliness through **May 2026**. Updates are fully automated — `python scripts/download_and_update.py --all` pulls the latest USDA *and* DHS files, merges forward-only, records provenance, and rebuilds the dashboard. See [Automated Pipeline & Provenance](#automated-pipeline--provenance).

## Contents
- [Interactive Visualization Dashboard](#interactive-visualization-dashboard-new) 🆕
- [Federal Data](#federal-data)
- [State Data](#state-data)
- [Data Update Tools](#data-update-tools)
- [Recent Analysis](#recent-analysis)
- [Current Data Status](#current-data-status)

---

## Interactive Visualization Dashboard 🆕

**Explore 36 years of Hawaii SNAP data through interactive visualizations!**

### 📊 Features

- **8 Interactive Charts**: Participation trends, benefits, COVID-19 impact, county comparisons
- **Multi-Dimensional Analysis**: Time series, geographic, demographic, economic
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Fast & Accessible**: < 1 second load, WCAG AA compliant
- **Production Ready**: Configured for instant Netlify deployment

### 🚀 Deploy Now

Three ways to deploy:

1. **Drag & Drop** (30 seconds):
   - Visit [netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `web/` folder
   - Done!

2. **GitHub Integration** (auto-updates):
   - Connect repository to Netlify
   - Auto-deploy on every push
   - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

3. **Netlify CLI**:
   ```bash
   netlify deploy --prod
   ```

### 📈 What's Visualized

**Participation Metrics:**
- 163,576 persons served (as of May 2025) — 10.8% of Hawaii residents
- 84,333 households participating
- COVID-19 surge and post-pandemic wind-down captured
- Long-term trends from 1989-2025

**Benefit Analysis:**
- Average ~$702/household (May 2025)
- Peak emergency benefits: $988/month (Aug 2021)
- Total program cost: ~$59M/month (May 2025)
- Three consecutive years of benefit reductions (FY2024-2026)

**Geographic Distribution:**
- 4 counties analyzed (Hawaii, Honolulu, Kauai, Maui)
- Per-capita participation rate (% of residents on SNAP), not just raw volume
- Honolulu leads by volume (58.6% of recipients) but is *lowest* per-capita (9.1%); the Big Island is highest at **19.0%** — more than double
- Public Assistance vs Non-PA breakdown

**Key Insights:**
- Economic early warning indicator
- Policy impact analysis
- Tourism dependency revealed
- Inter-island equity assessment

### 📚 Documentation

- **[Quick Deploy Guide](web/DEPLOY_NOW.md)** - Get started in 30 seconds
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Visualization Summary](VISUALIZATION_SUMMARY.md)** - Technical details and insights
- **[Web README](web/README.md)** - Development and customization

### 🎯 Live Demo

After deployment, your dashboard will include:
- **Overview**: Key statistics and historical trends
- **Trends**: Participation analysis over time
- **Benefits**: Benefit level evolution
- **COVID-19**: Pandemic impact deep-dive
- **Counties**: Geographic comparison
- **Insights**: Policy implications and research directions

**[→ Deploy Your Dashboard Now](web/DEPLOY_NOW.md)**

---

## Federal Data

### Statewide Monthly Data, FY89-FY25
FY69-current data is shared as a .zip file containing numerous .xls/.xlsx files.
The dataset covers *Persons, Households, Benefits, and Average Monthly Benefit per Person & Household*, however from 1969-1988 data are only availably at the national level. 
Thus, Hawaii data for FY89 through May 2025 within these files has been compiled and is now available as:

- Data: Date, Households, Persons, Average Monthly Benefit Per Household, Average Monthly Benefit Per Person, Benefits
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20Monthly%20SNAP%20FY%2089-25.csv)
- [Tableau visualization](https://public.tableau.com/views/SNAP_16192081784540/SNAPData?:language=en-US&publish=yes&:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “National and/or State Level Monthly and/or Annual Data”

### County Level Bi-Annual Data, FY89-Jan25
January and July *Participation and Issuance Data* for FY89 through January 2025.
The January and July data is reported to FNS in May and Dec. respectively.

- Data: County, SNAP All Persons Public Assistance Participation, SNAP All Persons Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA People, SNAP All Households Public Assistance Participation, SNAP All Households Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA Households, SNAP All Total Actual PA & Non-PA Issuance, Date
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Bi-Annual%20SNAP%2089-25.csv)
- County population for per-capita rates: [county_population.csv](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/county_population.csv) (2024 Hawaii State Census)
- [Tableau visualization](https://public.tableau.com/shared/JD56P52PB?:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “Bi-Annual (January and July) State Project Area/County Level Participation and Issuance Data”


### Statewide SNAP Retailers Historical, 2004-2025
USDA FNS provides [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historical-data) as a rolling ~20-year window. Because each annual release drops stores that closed before the window, this repo **unions** successive releases (keyed on Record ID + Authorization Date) to preserve Hawaii history beyond what USDA currently keeps — coverage now spans 2004-2025 (2,686 records; ~95% with valid in-state coordinates).
- Data: Store Name, Store Type, Street Address, Latitude/Longitude, Authorization Date, End Date
- [CSV (valid coords)](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/hawaii_snap_retailers_2004-2025_valid_coords.csv) · [CSV (all)](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/hawaii_snap_retailers_2004-2025_all.csv)
- [Tableau visualization](https://public.tableau.com/shared/YDWF6BSNG?:display_count=n&:origin=viz_share_link)
- Source Data: [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historical-data)


### Statewide SNAP Retailers Time Series, 2005-2020
Dr Jerry Shannon previously compiled and maintained a [National database of SNAP authorized retailers, 2008-2020]((https://github.com/jshannon75/snap_retailers)).
Data for Hawaii was extracted, cleaned to address geolocation errors, and restructured.
- Data: Store Name, Address, Store Type, Geolocation, Year
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20SNAP%20Retailer%20Locations%202005-2020.csv)
- [Tableau visualization](https://public.tableau.com/shared/JCGD9KGHW?:display_count=n&:origin=viz_share_link)
- Source Data: Dr Jerry Shannon's [National database of SNAP authorized retailers, 2008-2020](https://github.com/jshannon75/snap_retailers)


## State Data

Hawaii DHS publishes ongoing monthly SNAP data on its [SNAP page](https://humanservices.hawaii.gov/bessd/snap/), back to ~2009. The pipeline extracts the machine-readable releases into:

### DHS Monthly Participation, by Island (SFY 2009 – May 2026)
Monthly participants, households, and benefits issued for each island/branch (Oahu, Hawaii, Kauai, Maui, Molokai, Lanai, + State), broken out by program (SNAP-only, TANF, GA, SSI, ABD). **More current and more granular than the USDA monthly series** (which is statewide and ends May 2025); latest month: 157,954 participants statewide. **~17 years of history (213 months)** backfilled from the DHS archive — cross-validated against USDA (the July-2021 peak of 206,226 matches USDA's all-time max exactly). Visualized in the dashboard's **DHS State Data** tab.
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/dhs_snap_participation_by_island.csv)
- Source: Hawaii DHS "SNAP Participation Report" (SFY), via `scripts/extract_dhs_snap.py` (.xls + PDF)

### DHS Application Timeliness (FFY 2009 – May 2026)
Monthly statewide applications received + on-time disposition rates. **~14 years (172 months)** backfilled from DHS archives. Partly recovers the discontinued weekly applications series below — monthly statewide instead of weekly by-county. Shown in the dashboard's **DHS State Data** tab. A few months are missing where DHS published only an image scan (FFY2021), no file (FFY2025), or a partial-year summary (FFY2018/2020/2023).
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/dhs_snap_application_timeliness.csv)
- Source: Hawaii DHS "Application Processing Timeliness Report" (FFY), via `scripts/extract_dhs_snap.py`

> **Note:** Both DHS series are backfilled to 2009 (`.xls` via `xlrd`, PDFs via `pdftotext`). A one-time rebuild from the archives is `python scripts/download_and_update.py --dhs-backfill`; routine monthly pulls (`--dhs`) union new months onto this history. A few timeliness months are unavailable at source (FFY2025 unpublished; FFY2018/2020/2021 mid-year partials; FFY2023 August-only).

### County Daily Application Received and Approved Data, 4/26/20-4/1/22
> **⏹️ Discontinued (with partial successor).** This specific COVID-era series was *weekly* and *by county*, tracking applications received **and approved**. It ended at the 4/1/2022 release (later dates 404). The *weekly cadence and by-county "approved" counts* are gone, but ongoing monthly DHS participation and application-timeliness data (above) cover most of the same ground.

- Data: Applications received, applications approved, date, county
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Weekly%20Applications%204:2020-3:2022.csv)
- [Tableau visualization](https://public.tableau.com/shared/QWG47332T?:display_count=n&:origin=viz_share_link)
- Source Data: [Hawaii Department of Human Services](https://humanservices.hawaii.gov/communications/) "SNAP Data by County Received and Approved" ([4/1/22 release](https://humanservices.hawaii.gov/wp-content/uploads/2022/04/SNAP-Data-4.1.22.xlsx))

---

## Data Update Tools

### Quick Start: Update All Data (one command)

```bash
# Pulls latest USDA files, merges forward-only, records provenance,
# and rebuilds the dashboard JSON. No manual downloads.
python scripts/download_and_update.py --all

# Optional: validate
python scripts/validate_data.py --all
```

Then `git push` — Netlify rebuilds and redeploys the dashboard automatically.

### Available Scripts

Located in `scripts/` directory:

1. **`download_and_update.py`** - Automated update utility
   - Auto-discovers and downloads the current USDA monthly + retailer files (no manual step)
   - Extracts Hawaii records; merges **forward-only** so a regressed USDA release can never overwrite newer local data
   - Unions retailer releases to preserve history beyond USDA's rolling ~20-year window
   - Backs up existing files; writes provenance to `Data/SOURCES.json`; rebuilds dashboard JSON
   - Usage: `python download_and_update.py --all` (or `--monthly` / `--retailers`)

2. **`validate_data.py`** - Data quality validation
   - Checks for missing values, invalid dates
   - Validates coordinates for retailer data
   - Identifies data quality issues
   - Usage: `python validate_data.py --all`

### Documentation

- **[DATA_UPDATE_FINDINGS.md](DATA_UPDATE_FINDINGS.md)** - Comprehensive review of available updates
- **[QUICK_START_UPDATE_GUIDE.md](QUICK_START_UPDATE_GUIDE.md)** - Step-by-step update instructions
- **[SNAP_ANALYSIS_2024-2025.md](SNAP_ANALYSIS_2024-2025.md)** - Analysis and context for 2024-2025 period

---

## Recent Analysis

### Hawaii SNAP in 2024-2025

**Key Statistics (FY 2024):**
- **Participants:** ~161,600 individuals (11.2% of Hawaii population)
- **Households:** ~56,690 households (11.5% of all households)
- **National Ranking:** 26th highest participation rate among states and DC
- **County Variation:** Hawaii County has highest rate at 18% of households

**Benefit Trends:**
- **FY 2024:** $1,759/month maximum for family of 4
- **FY 2025:** $1,723/month maximum (↓$36 decrease)
- **FY 2026:** Further decreases expected (~$8/person)

**Recent Policy Changes:**
- One Big Beautiful Bill Act (OBBBA) signed July 4, 2025
- Work requirement changes effective November 1, 2025
- Three consecutive years of benefit reductions (2024-2026)

**Read the full analysis:** [SNAP_ANALYSIS_2024-2025.md](SNAP_ANALYSIS_2024-2025.md)

---

## Current Data Status

| Dataset | Coverage | Source | Status |
|---------|----------|--------|--------|
| **Statewide Monthly** | FY89 – **May 2025** | USDA/FNS | ✅ Current (ahead of USDA's currently-published file, which stops at Mar 2025) |
| **County Bi-Annual** | FY89 – **Jan 2025** | USDA/FNS | ✅ Current |
| **Retailer Historical** | **2004 – 2025** | USDA/FNS | ✅ Current (unioned across releases) |
| **DHS Participation (by island)** | **SFY 2009 → May 2026** | Hawaii DHS | ✅ Current — monthly, island-level, 17-yr history (most current participation data) |
| **DHS Application Timeliness** | **FFY 2009 → May 2026** | Hawaii DHS | ✅ Current — monthly statewide, 14-yr history (some source gaps) |
| **Weekly County Applications** | Apr 2020 – Apr 2022 | Hawaii DHS | ⏹️ Discontinued (weekly/by-county slice; see DHS data above for successor) |

Full provenance for every dataset — publisher, source file/revision, "data as of" date, download date, coverage — is recorded in [`Data/SOURCES.json`](Data/SOURCES.json) and surfaced in the dashboard's `metadata.json`.

### Automated Pipeline & Provenance

This repo updates itself with one command and documents where every number came from:

- **One-command updates** — `python scripts/download_and_update.py --all` auto-discovers and downloads the current USDA files *and* Hawaii DHS releases, extracts Hawaii records, and rebuilds the dashboard. No manual downloads or prompts. (Individual flags: `--monthly`, `--retailers`, `--county`, `--dhs`.)
- **Forward-only merges** — new months/records are appended; a regressed USDA release can never overwrite newer local data. (USDA currently republishes an older monthly file ending Mar 2025, while this repo holds May 2025 — the guard keeps the newer data.)
- **Retailer union** — USDA's retailer file is a rolling ~20-year window that drops long-closed stores. The pipeline unions successive releases so the repo becomes a *longer* historical record than USDA keeps (e.g. Hawaii stores that closed in 2004 are preserved).
- **Provenance manifest** — `Data/SOURCES.json` records the origin of each dataset, so "where did this come from?" is one field, not an investigation.
- **Per-capita normalization** — county SNAP counts are normalized by 2024 Hawaii State Census population (`Data/county_population.csv`) into a `participationRate`, so maps show *need* rather than population density.

### Per-Capita Finding

Raw county counts mostly mirror population — Honolulu holds 58.6% of recipients because 69% of residents live there. Normalized by population, the picture inverts:

| County | % of residents on SNAP |
|--------|-----------------------|
| **Hawaii (Big Island)** | **19.0%** |
| Kauai | 10.8% |
| Maui | 10.2% |
| **Honolulu** | **9.1%** |
| Statewide | 10.8% |

Counts follow population; need does not.

### Known Data Issues

1. **Retailer Geolocation:** ~5% of Hawaii retailer records have coordinates outside Hawaii bounds (18.9°–22.2°N, 154.8°–160.2°W). The pipeline validates and writes a `*_valid_coords.csv` alongside the full file. (Earlier releases had a far higher invalid rate; current data is ~95% valid.)

2. **Application Data discontinued:** The Hawaii DHS weekly applications series ended April 2022 and has no successor (see State Data above).

3. **External Tableau dashboards:** The Tableau links throughout this README still reflect older data and have not been refreshed; the interactive web dashboard (`web/`) uses the current data.

---

## Requirements

### For Data Updates

```bash
pip install pandas openpyxl requests
```

### For Analysis

```bash
pip install pandas numpy matplotlib seaborn jupyter
```

---

## Contributing

Contributions welcome! Areas of particular interest:

1. **Data Updates**
   - Run `download_and_update.py --all` and report issues
   - Watch for a newer USDA monthly revision (currently their published file lags this repo)
   - Refresh the external Tableau dashboards to match the current data

2. **Analysis**
   - Time series analysis of 2022-2025 transition
   - County-level comparative studies
   - Retailer network evolution
   - Policy impact assessment

3. **Visualization**
   - Update Tableau dashboards with new data
   - Create new visualizations for recent trends
   - Interactive maps with corrected retailer locations

4. **Documentation**
   - Improve update procedures
   - Add analysis examples
   - Document data quality issues

---

## Questions or Issues?

- **Data questions:** See [DATA_UPDATE_FINDINGS.md](DATA_UPDATE_FINDINGS.md)
- **Update help:** See [QUICK_START_UPDATE_GUIDE.md](QUICK_START_UPDATE_GUIDE.md)
- **Analysis context:** See [SNAP_ANALYSIS_2024-2025.md](SNAP_ANALYSIS_2024-2025.md)
- **Technical issues:** Open an issue on GitHub

---

## Citation

If you use this data in research or publications, please cite:

```
Hawaii SNAP Data Repository (2025)
https://github.com/supersistence/Hawaii-SNAP
Accessed: [date]
```

And cite the original data sources:
- USDA Food and Nutrition Service SNAP Data Tables
- Hawaii Department of Human Services
- Dr. Jerry Shannon's SNAP Retailers Database (for time series data)

---

## License

Data compiled from public government sources. See individual source links for specific terms of use.

---

**Last Updated:** June 2026
**Repository Status:** Data current (monthly through May 2025, county through Jan 2025, retailers through 2025) | Automated update pipeline + provenance in place
