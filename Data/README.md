# Hawaii SNAP Data Directory

This directory contains processed Hawaii SNAP (Supplemental Nutrition Assistance Program) data files.

## 📊 Current/Active Data Files

### Monthly Participation Data
- **`Statewide Monthly SNAP FY 89-25.csv`** (24KB)
  - **Use this for**: Monthly SNAP participation analysis
  - **Date range**: October 1988 - May 2025
  - **Records**: 440 monthly observations
  - **Updated**: October 2025
  - **Columns**: Date, Household, Persons, Per Household, Per Person, Cost
  - **Source**: USDA FNS National Data Bank (processed from FY Excel files)

### Retailer Location Data
- **`hawaii_snap_retailers_2004-2024_valid_coords.csv`** (336KB) ⭐ **RECOMMENDED**
  - **Use this for**: Mapping and geographic analysis
  - **Records**: 2,503 retailers with validated Hawaii coordinates
  - **Geographic validation**: 94.8% accuracy within Hawaii bounds
  - **Coordinates**: Latitude (18.9° to 22.2°N), Longitude (-160.2° to -154.8°W)

- **`hawaii_snap_retailers_2004-2024_all.csv`** (349KB)
  - **Use this for**: Complete historical record (includes invalid/missing coordinates)
  - **Records**: 2,641 total Hawaii retailer records
  - **Date range**: 1967 - December 31, 2024
  - **Active stores**: 896 currently authorized

### Supplemental Data
- **`County Bi-Annual SNAP 89-21.csv`** (20KB)
  - County-level bi-annual data (FY1989-FY2021)

- **`County Weekly Applications 4:2020-3:2022.csv`** (108KB)
  - Weekly application data during COVID period

- **`hawaii_snap_extracted_fy89-fy25.csv`** (22KB)
  - Raw extracted data from source Excel files (intermediate processing file)

## 📁 Directory Structure

```
Data/
├── README.md                                    # This file
├── source/                                      # Large source files (gitignored)
│   ├── Historical SNAP Retailer Locator Data 2004-2024.csv (90MB)
│   └── snap-zip-fy69tocurrent-8/               # 37 Excel files (FY89-FY25)
├── archive/                                     # Old/superseded files (gitignored)
│   ├── Statewide Monthly SNAP FY 89-22.csv     # Superseded by FY 89-25
│   ├── Statewide SNAP Retailer Locations 2005-2020.csv
│   └── Statewide SNAP Retailers Historical- FNS.csv
└── [current data files listed above]
```

## 🔄 Data Sources & Download Instructions

### Monthly SNAP Participation Data
**Source**: USDA FNS National Data Bank
**URL**: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap

**How to update**:
1. Download ZIP file containing state-level monthly data (FY89-current)
2. Extract individual FY Excel files
3. Run: `python scripts/extract_hawaii_snap.py`
4. Output: `Data/hawaii_snap_extracted_fy89-fy25.csv`

### Retailer Location Data
**Source**: USDA FNS SNAP Retailer Locator Historical Data
**Primary URL**: https://www.fns.usda.gov/snap/retailer-locator/data
**Wayback Machine URL** (if primary fails):
https://web.archive.org/web/20250908155349/https://www.fns.usda.gov/sites/default/files/resource-files/snap-historical-retailer-locator-data-2004to2024.zip

**Note**: The primary USDA download may have issues. If the ZIP file won't extract, try the Wayback Machine link above.

**File format**: CSV with columns:
- Record ID, Store Name, Store Type, Street Number, Street Name, City, State, Zip Code
- County, Latitude, Longitude, Authorization Date, End Date

## 📈 Data Statistics (as of October 2025)

### Current SNAP Participation (May 2025)
- **Households**: 84,333
- **Individuals**: 163,576
- **Total Monthly Benefits**: $59,178,123
- **Average per Household**: $701.72
- **Average per Person**: $361.78

### Retailer Network (December 2024)
- **Total Historical Records**: 2,641
- **Currently Active**: 896 retailers
- **By County**:
  - Honolulu: 540
  - Hawaii: 168
  - Maui: 124
  - Kauai: 64

### Top Store Types (Active Only)
1. Convenience Store: 381
2. Super Store: 122
3. Combination Grocery/Other: 112
4. Medium Grocery Store: 60
5. Small Grocery Store: 55

## ⚠️ Important Notes

### Geographic Coordinate Quality
- **Valid coordinates**: 94.8% of records have coordinates within Hawaii
- **Invalid/Outside bounds**: 0.9% (24 records)
- **Missing coordinates**: 4.3% (114 records)
- **Use `hawaii_snap_retailers_2004-2024_valid_coords.csv` for mapping**

### Data Updates
- Monthly participation data updated through **May 2025**
- Retailer data current through **December 31, 2024**
- Last updated: **October 23, 2025**

### File Size Notes
Large source files (>10MB) are stored in `Data/source/` and excluded from git.
Download from original sources using instructions above.

## 🛠️ Processing Scripts

See `scripts/` directory:
- `extract_hawaii_snap.py` - Extract Hawaii data from FY Excel files
- `prepare_web_data.py` - Prepare data for web visualization
- `validate_data.py` - Data quality validation

## 📝 Version History

- **v3.0** (Oct 2025): Updated monthly data through May 2025, retailer data through Dec 2024
- **v2.0** (May 2022): Added retailer location data through 2021
- **v1.0** (May 2022): Initial dataset through January 2022

---

**Questions or issues?** Check the main repository README or open an issue on GitHub.
