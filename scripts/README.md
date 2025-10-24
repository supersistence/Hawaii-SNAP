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
- xlrd (for .xls files)
- requests >= 2.31.0

## 📜 Production Scripts

### 1. `extract_hawaii_snap.py`
**Purpose**: Extract Hawaii SNAP monthly participation data from USDA FNS fiscal year Excel files

**Usage**:
```bash
python scripts/extract_hawaii_snap.py
```

**Input**:
- Source: `Data/source/snap-zip-fy69tocurrent-8/` (37 Excel files: FY89-FY25)
- Reads both .xls (older) and .xlsx (newer) formats

**Output**:
- `Data/hawaii_snap_extracted_fy89-fy25.csv` - Raw extracted Hawaii data

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
**Purpose**: Automated data download and update workflow

**Usage**:
```bash
python scripts/download_and_update.py
```

**Features**:
- Downloads latest SNAP data from USDA FNS
- Handles both monthly participation and retailer data
- Validates downloads before processing
- Updates existing datasets with new data
- Creates backup before updating

**Note**: Due to network restrictions, manual download may be required. See [DOWNLOAD_INSTRUCTIONS.md](../DOWNLOAD_INSTRUCTIONS.md) for details.

---

## 🔄 Typical Workflow

### Updating Monthly SNAP Data

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

**Last Updated**: October 23, 2025
**Maintainer**: Hawaii SNAP Data Project
**Questions?** Open an issue on GitHub
