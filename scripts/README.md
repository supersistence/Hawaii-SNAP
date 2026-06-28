# Hawaii SNAP Data Processing Scripts

This directory contains Python scripts for downloading, processing, and validating Hawaii SNAP data.

## 🔧 Setup

### Prerequisites
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Required Dependencies
- pandas >= 2.0.0
- numpy >= 1.24.0
- openpyxl >= 3.1.0 (for .xlsx files)
- xlrd >= 2.0.0 (for legacy .xls files, incl. DHS archives)
- requests >= 2.31.0
- `pdftotext` (Poppler CLI) and `curl` — system tools used to extract DHS PDF archives and as an HTTP fallback for hosts whose TLS breaks Python `requests`

### Quick start (automated)
```bash
python scripts/download_and_update.py --all          # pull latest USDA + DHS, merge, rebuild dashboard
python scripts/download_and_update.py --dhs-backfill  # one-time: rebuild DHS history (2009–present)
```
No manual downloads or prompts. Every pull merges forward-only and records provenance to `Data/SOURCES.json`.

## 📜 Production Scripts

### 1. `extract_hawaii_snap.py`
**Purpose**: Library of USDA FNS fiscal-year file parsers. Its functions are
reused by `download_and_update.py` (the canonical updater). Run standalone, it
produces only a **raw scratch dump** for debugging — it does *not* write the
web source file.

> ⚠️ The canonical monthly series is `Data/Statewide Monthly SNAP FY 89-25.csv`,
> maintained by `download_and_update.py` (safe forward-merge + provenance) and
> consumed by `prepare_web_data.py`. Don't treat a standalone extract as
> authoritative — a divergent extract is how the corrupt Feb-2019 row hid.

**Usage**:
```bash
python scripts/extract_hawaii_snap.py        # debug dump only
python scripts/download_and_update.py --monthly   # the real update path
```

**Input**:
- Source: `Data/source/snap-zip-fy69tocurrent-8/` (37 Excel files: FY89-FY25)
- Reads both .xls (older) and .xlsx (newer) formats

**Output**:
- `downloads/hawaii_snap_extracted_raw.csv` - scratch debug dump (gitignored)

**Features**:
- Automatically detects column order differences between old/new files
- Old files (.xls): Month, HH, Persons, PerHH, PerPerson, Cost
- New files (.xlsx): Month, HH, Persons, Cost, PerHH, PerPerson
- Validates data during extraction
- Handles date parsing for multiple formats

**Example Output**:
```
Processing FY24.xlsx... ✓ Found 12 months
Processing FY25.xlsx... ✓ Found 8 months
Total records extracted: 440
Date range: 1988-10-01 to 2025-05-01
```

---

### 2. `prepare_web_data.py`
**Purpose**: Prepare processed data for web visualization dashboard

**Usage**:
```bash
python scripts/prepare_web_data.py
```

**Input**:
- `Data/Statewide Monthly SNAP FY 89-25.csv`
- `Data/hawaii_snap_retailers_2004-2024_valid_coords.csv`

**Output**:
- `web/data/monthly.json` - Monthly participation time series
- `web/data/trends.json` - Trend analysis and statistics
- `web/data/county.json` - County-level breakdowns
- `web/data/metadata.json` - Dataset metadata and update timestamps

**Features**:
- Converts CSV to JSON for web consumption
- Calculates rolling averages and trends
- Generates summary statistics
- Optimizes file sizes for web delivery

---

### 3. `validate_data.py`
**Purpose**: Comprehensive data quality validation and integrity checks

**Usage**:
```bash
python scripts/validate_data.py
```

**Checks Performed**:
- ✓ Missing months detection
- ✓ Duplicate records
- ✓ NULL/NaN values
- ✓ Geographic coordinate validation (Hawaii bounds)
- ✓ Date range continuity
- ✓ Data type consistency
- ✓ Value range validation (e.g., positive numbers for costs)

**Output**:
```
DATA QUALITY VALIDATION REPORT
==============================
Dataset: Statewide Monthly SNAP FY 89-25.csv
Total records: 440
✓ No missing months
✓ No duplicate dates
✓ No NULL values
✓ All values within expected ranges
```

---

### 4. `download_and_update.py`
**Purpose**: Fully automated data download, merge, provenance, and dashboard rebuild

**Usage**:
```bash
python scripts/download_and_update.py --all          # everything
python scripts/download_and_update.py --monthly      # USDA monthly only
python scripts/download_and_update.py --retailers    # USDA retailers only
python scripts/download_and_update.py --dhs          # Hawaii DHS participation + timeliness
python scripts/download_and_update.py --dhs-backfill # one-time DHS history rebuild (2009–present)
python scripts/download_and_update.py --report       # status report only
```

**What it does** (no manual steps):
- Auto-discovers and downloads the current USDA and Hawaii DHS files (scrapes the source pages for the current resource link; `curl` fallback for hosts that break Python TLS)
- Extracts Hawaii records and **merges forward-only** — a regressed/older upstream release can never overwrite newer local data
- **Unions** retailer releases (to keep history beyond USDA's rolling ~20-year window) and DHS monthly pulls (onto the backfilled history)
- Backs up existing files, writes provenance to `Data/SOURCES.json`, and rebuilds `web/data/*.json`

**Note**: USDA's site (Akamai) may rate-limit automated requests; on failure the pull aborts safely (no data change) — retry later or from another network. County bi-annual data has no auto-discoverable file and is skipped with instructions.

---

### 5. `extract_dhs_snap.py`
**Purpose**: Parse Hawaii DHS monthly SNAP releases into tidy CSVs (used by `download_and_update.py`)

**Outputs**:
- `Data/dhs_snap_participation_by_island.csv` — monthly participation by island/branch
- `Data/dhs_snap_application_timeliness.csv` — monthly statewide applications received + on-time rates

**Handles three archive eras**: current `.xlsx` (dated month sheets), legacy `.xls` (`xlrd`), and PDF summaries (`pdftotext`). Maps each State/Federal Fiscal Year's months to calendar dates and normalizes the differing column layouts across years. Archive URL lists for the one-time backfill live in this module (`DHS_PARTICIPATION_ARCHIVE`, `DHS_TIMELINESS_ARCHIVE`).

---

## 🔄 Typical Workflow

> **Preferred:** `python scripts/download_and_update.py --all` does everything below automatically (download → extract → merge → provenance → rebuild dashboard). The manual steps below are a fallback for when you already have source files in hand or USDA is rate-limiting.

### Updating Monthly SNAP Data (manual fallback)

1. **Download source data**:
   - Visit: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
   - Download ZIP file with state-level monthly data
   - Extract to `Data/source/snap-zip-fy69tocurrent-8/`

2. **Extract Hawaii data**:
   ```bash
   python scripts/extract_hawaii_snap.py
   ```

3. **Validate output**:
   ```bash
   python scripts/validate_data.py
   ```

4. **Prepare for web dashboard** (if applicable):
   ```bash
   python scripts/prepare_web_data.py
   ```

### Updating Retailer Data

1. **Download retailer data**:
   - Primary: https://www.fns.usda.gov/snap/retailer-locator/data
   - Fallback: Wayback Machine (see Data/README.md)
   - Save to `Data/source/`

2. **Filter for Hawaii**:
   ```python
   import pandas as pd

   df = pd.read_csv('Data/source/Historical SNAP Retailer...csv',
                    encoding='latin-1', low_memory=False)
   hawaii = df[df['State'] == 'HI']

   # Validate coordinates
   valid = hawaii[
       (hawaii['Latitude'] >= 18.9) &
       (hawaii['Latitude'] <= 22.2) &
       (hawaii['Longitude'] >= -160.2) &
       (hawaii['Longitude'] <= -154.8)
   ]

   valid.to_csv('Data/hawaii_snap_retailers_2004-2024_valid_coords.csv',
                index=False)
   ```

3. **Validate**:
   ```bash
   python scripts/validate_data.py
   ```

## 📊 Data Processing Notes

### Geographic Coordinate Validation
Hawaii coordinate boundaries:
- **Latitude**: 18.9° to 22.2° N
- **Longitude**: -160.2° to -154.8° W

Records outside these bounds are flagged as invalid.

### Date Formats
The scripts handle multiple date formats:
- `MM/DD/YYYY` (e.g., "05/01/2025")
- `YYYY-MM-DD` (e.g., "2025-05-01")
- `Mon YYYY` (e.g., "May 2025")
- `Month YYYY` (e.g., "May 2025")

### Column Order Detection
The `extract_hawaii_snap.py` script automatically detects column order:
- If column 3 value > 10,000 → New format (Cost in col 3)
- Otherwise → Old format (Per Household in col 3)

## 🐛 Troubleshooting

### ModuleNotFoundError
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Install missing package
pip install <package_name>
```

### UnicodeDecodeError when reading CSV
```python
# Use latin-1 or cp1252 encoding
df = pd.read_csv('file.csv', encoding='latin-1')
```

### xlrd not installed (for .xls files)
```bash
pip install xlrd
```

### File not found errors
```bash
# Check current directory
pwd

# Ensure you're in repository root
cd /path/to/Hawaii-SNAP
```

## 📁 Directory Structure

```
scripts/
├── README.md                    # This file
├── extract_hawaii_snap.py       # Extract Hawaii data from FY files
├── prepare_web_data.py          # Prepare data for web visualization
├── validate_data.py             # Data quality validation
├── download_and_update.py       # Automated download workflow
└── archive/                     # Archived/exploratory scripts (gitignored)
    ├── extract_hawaii_data.py
    └── process_snap_monthly.py
```

## 🔗 Related Documentation

- [Data/README.md](../Data/README.md) - Data files documentation
- [DOWNLOAD_INSTRUCTIONS.md](../DOWNLOAD_INSTRUCTIONS.md) - Manual download guide
- [QUICK_START_UPDATE_GUIDE.md](../QUICK_START_UPDATE_GUIDE.md) - Quick update guide
- [DATA_UPDATE_FINDINGS.md](../DATA_UPDATE_FINDINGS.md) - Update history

## ⚙️ Advanced Usage

### Custom Date Range Extraction
```python
from scripts.extract_hawaii_snap import extract_hawaii_from_fy_file

# Extract from specific files
files = ['Data/source/snap-zip-fy69tocurrent-8/FY24.xlsx']
for f in files:
    records = extract_hawaii_from_fy_file(f)
    print(f"Found {len(records)} records")
```

### Batch Validation
```python
from scripts.validate_data import validate_dataset

datasets = [
    'Data/Statewide Monthly SNAP FY 89-25.csv',
    'Data/hawaii_snap_retailers_2004-2024_all.csv'
]

for dataset in datasets:
    validate_dataset(dataset)
```

---

**Last Updated**: June 2026
**Maintainer**: Hawaii SNAP Data Project
**Questions?** Open an issue on GitHub
