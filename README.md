# Compiling and Sharing SNAP Data for Hawaii

> **⚠️ DATA UPDATE AVAILABLE:** As of October 2025, updated data is available for all datasets (3-5 years of new data). See [Quick Start Guide](QUICK_START_UPDATE_GUIDE.md) or [Detailed Findings](DATA_UPDATE_FINDINGS.md) for how to update.

## Contents
- [Federal Data](#federal-data)
- [State Data](#state-data)
- [Data Update Tools](#data-update-tools)
- [Recent Analysis](#recent-analysis)
- [Current Data Status](#current-data-status)

---

## Federal Data

### Statewide Monthly Data, FY89-FY22
FY69-FY22 data is shared as a .zip file containing numerous .xls files. 
The dataset covers *Persons, Households, Benefits, and Average Monthly Benefit per Person & Household*, however from 1969-1988 data are only availably at the national level. 
Thus, Hawaii data for FY89-FY22 within these files has been compiled and is now available as:

- Data: Date, Households, Persons, Average Monthly Benefit Per Household, Average Monthly Benefit Per Person, Benefits
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20Monthly%20SNAP%20FY%2089-22.csv)
- [Tableau visualization](https://public.tableau.com/views/SNAP_16192081784540/SNAPData?:language=en-US&publish=yes&:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “National and/or State Level Monthly and/or Annual Data”

### County Level Bi-Annual Data, FY89-Jan21
January and July *Participation and Issuance Data* for FY89 through January 2021.
The January and July data is reported to FNS in May and Dec. respectively.

- Data: County, SNAP All Persons Public Assistance Participation, SNAP All Persons Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA People, SNAP All Households Public Assistance Participation, SNAP All Households Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA Households, SNAP All Total Actual PA & Non-PA Issuance, Date
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Bi-Annual%20SNAP%2089-21.csv)
- [Tableau visualization](https://public.tableau.com/shared/JD56P52PB?:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “Bi-Annual (January and July) State Project Area/County Level Participation and Issuance Data”


### Statewide SNAP Retailers Time Window, 1990-2021
As of late 2021, USDA FNS provides [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historicaldata). However, of the 4099 data points for Hawaii 1614 have location data outside of the state. 
- Data: Store Name, Store Type, Street Address, Latitude/Longitude, Authorization Date, End Date
- [CSV](
https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20SNAP%20Retailers%20Historical-%20FNS.csv)
- [Tableau visualization](https://public.tableau.com/shared/YDWF6BSNG?:display_count=n&:origin=viz_share_link)
- Source Data: [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historicaldata)


### Statewide SNAP Retailers Time Series, 2005-2020
Dr Jerry Shannon previously compiled and maintained a [National database of SNAP authorized retailers, 2008-2020]((https://github.com/jshannon75/snap_retailers)).
Data for Hawaii was extracted, cleaned to address geolocation errors, and restructured.
- Data: Store Name, Address, Store Type, Geolocation, Year
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20SNAP%20Retailer%20Locations%202005-2020.csv)
- [Tableau visualization](https://public.tableau.com/shared/JCGD9KGHW?:display_count=n&:origin=viz_share_link)
- Source Data: Dr Jerry Shannon's [National database of SNAP authorized retailers, 2008-2020](https://github.com/jshannon75/snap_retailers)


## State Data

### County Daily Application Received and Approved Data, 4/26/20-4/1/22
- Data: Applications received, applications approved, date, county
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Weekly%20Applications%204:2020-3:2022.csv)
- [Tableau visualization](https://public.tableau.com/shared/QWG47332T?:display_count=n&:origin=viz_share_link)
- Source Data: [Hawaii Department of Human Services](https://humanservices.hawaii.gov/communications/) "SNAP Data by County Received and Approved" ([4/1/22 release](https://humanservices.hawaii.gov/wp-content/uploads/2022/04/SNAP-Data-4.1.22.xlsx))

---

## Data Update Tools

### Quick Start: Update All Data (30 minutes)

**New automated tools available to update all datasets with 3-5 years of new data!**

```bash
# 1. Download files manually (see Quick Start Guide)
# 2. Run the update script
python scripts/download_and_update.py --all

# 3. Validate results
python scripts/validate_data.py --all
```

**📖 Full instructions:** [QUICK_START_UPDATE_GUIDE.md](QUICK_START_UPDATE_GUIDE.md)

### Available Scripts

Located in `scripts/` directory:

1. **`download_and_update.py`** - Main update utility
   - Downloads and processes new data
   - Backs up existing files
   - Merges new records with existing datasets
   - Generates status reports
   - Usage: `python download_and_update.py --help`

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

| Dataset | Current Coverage | **Updated Available** | Gap |
|---------|-----------------|---------------------|-----|
| **Statewide Monthly** | FY89 - Jan 2022 | **→ May 2025** | 3+ years |
| **County Bi-Annual** | FY89 - July 2020 | **→ TBD** | 5+ years |
| **Retailer Historical** | 1990 - 2021 | **→ Dec 31, 2024** | 3+ years |
| **Retailer Time Series** | 2005 - 2020 | **→ 2022/2024** | 2-4 years |
| **Application Data** | Apr 2020 - July 2021 | **→ TBD** | 4+ years |

### What's New in Updated Data

**Statewide Monthly (Feb 2022 - May 2025):**
- Post-pandemic transition period
- Emergency benefit wind-down
- Effect of three consecutive benefit reductions
- ~41 months of new data

**SNAP Retailers (2022 - Dec 2024):**
- Post-pandemic retailer network changes
- Store openings/closings during recovery
- Updated geolocation data
- 3+ years of retailer evolution

**Critical Period Covered:**
The 2022-2025 period includes major transitions:
- End of COVID emergency benefits
- Economic recovery and labor market changes
- Benefit reductions (2023-2025)
- Policy reforms (OBBBA)

### Known Data Issues

1. **Retailer Geolocation:** ~39% of Hawaii retailer records have invalid coordinates
   - Coordinates outside Hawaii bounds (18°-23°N, 154°-161°W)
   - Validation script identifies and flags these
   - Affects mapping accuracy

2. **README Discrepancy:** County bi-annual data
   - README states "through January 2021"
   - Actual file ends July 2020
   - 5+ year update needed

3. **Data Currency:** All datasets are 3-5 years out of date (as of Oct 2025)
   - Update tools now available
   - See Quick Start Guide for instructions

### Update Priority Recommendations

**CRITICAL (High Impact, Easy Update):**
1. ✅ Statewide Monthly Data → May 2025
2. ✅ SNAP Retailer Historical → Dec 31, 2024

**IMPORTANT (Verify Availability):**
3. ⚠️ County Bi-Annual → Check if still published
4. ⚠️ Application Data → Check Hawaii DHS releases

**OPTIONAL (Consider Source):**
5. 🔄 Retailer Time Series → Shannon (2022) or direct FNS (2024)

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
   - Run update scripts and report issues
   - Verify county-level data availability
   - Check Hawaii DHS for new application data releases

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

**Last Updated:** October 23, 2025
**Repository Status:** Tools ready for data integration | Updated data available through May 2025
