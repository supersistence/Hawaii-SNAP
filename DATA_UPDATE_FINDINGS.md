# Hawaii SNAP Data Update Findings
**Review Date:** October 23, 2025

## Executive Summary
This repository contains Hawaii SNAP data that is **3-4 years out of date**. Significant updated data is available from multiple sources, representing approximately 3+ years of new data across all datasets.

---

## Detailed Findings by Dataset

### 1. Statewide Monthly Data (PRIORITY UPDATE)
**Current Status:**
- File: `Statewide Monthly SNAP FY 89-22.csv`
- Current date range: FY89 - **January 2022**
- Last data point: 2022-01-01

**Available Update:**
- **New data through: May 2025** (3+ years of new data)
- Source: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap)
- Data includes: Persons, Households, Benefits, Average Monthly Benefit per Person & Household
- Format: Available in Excel (.xlsx), PDF, and ZIP archives

**Impact:** HIGH - This is the most current federal dataset and should be straightforward to update

---

### 2. County Bi-Annual Data (PRIORITY UPDATE)
**Current Status:**
- File: `County Bi-Annual SNAP 89-21.csv`
- README claims: FY89 through January 2021
- **Actual last date in CSV: July 2020** (5+ years out of date)
- Includes: Participation and Issuance Data by County (January and July snapshots)

**Available Update:**
- Need to verify if FNS still publishes bi-annual county-level data
- Source: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) - "Bi-Annual (January and July) State Project Area/County Level Participation and Issuance Data"
- **Action needed:** Check if this dataset continues through 2025

**Impact:** HIGH - Provides important county-level granularity for Hawaii's islands

---

### 3. SNAP Retailer Historical Data (MAJOR UPDATE AVAILABLE)
**Current Status:**
- File: `Statewide SNAP Retailers Historical- FNS.csv`
- Current date range: 1990-2021
- Note: 1,614 out of 4,099 data points have location data outside Hawaii

**Available Update:**
- **New data through: December 31, 2024** (3+ years of new data)
- Source: [USDA FNS Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historical-data)
- Data includes: Store Name, Store Type, Address, Location, Authorization Date, End Date
- Format: Zipped CSV file
- Additional resources: FY 2023 and FY 2024 retailer dashboards available

**Impact:** HIGH - Significant update available with 3+ years of new retailer data

---

### 4. SNAP Retailer Time Series (Dr. Shannon Database)
**Current Status:**
- File: `Statewide SNAP Retailer Locations 2005-2020.csv`
- Current date range: 2005-2020
- Derived from Dr. Jerry Shannon's national database

**Available Update:**
- Dr. Shannon's database updated through **December 31, 2022**
- Last update: July 20, 2023
- Repository: [github.com/jshannon75/snap_retailers](https://github.com/jshannon75/snap_retailers)
- Note: USDA's own historical data (Dec 31, 2024) is now MORE current than Shannon's processed dataset

**Options:**
1. Update from Shannon's database (2021-2022 data)
2. Switch to using USDA FNS historical data directly (through 2024)
3. Maintain both datasets for different purposes

**Impact:** MEDIUM - 2-4 years of new data available depending on source chosen

---

### 5. County Application Data (STATE SOURCE)
**Current Status:**
- File: `County Weekly Applications 4:2020-3:2022.csv`
- Current date range: April 26, 2020 - April 1, 2022
- Last entry in CSV: July 24, 2021 (actual data ends earlier than filename suggests)
- Data: Applications received and approved by county

**Available Update:**
- Source: [Hawaii Department of Human Services](https://humanservices.hawaii.gov/communications/)
- **Status:** Unable to verify web source due to network restrictions
- Last known release linked in README: April 1, 2022

**Action Needed:**
- Check Hawaii DHS website for newer SNAP application data releases
- They may have published 2023, 2024, and 2025 data

**Impact:** MEDIUM - Important state-level granular data for tracking application trends

---

## Additional Context: Recent Hawaii SNAP Statistics

### FY 2024 Participation (for reference)
- **Households:** ~56,690 (11.5% of state households)
- **Individuals:** ~161,600 (11.2% of state population)
- **Current estimate:** 84,869 households / 165,659 people

### Benefit Levels
- **FY 2024:** Max allotment for family of 4 = $1,759
- **FY 2025:** Max allotment for family of 4 = $1,723
- **FY 2026:** Further reduction expected (effective Oct 1, 2025)

### Policy Changes
- One Big Beautiful Bill Act (OBBBA) signed July 4, 2025
- Work requirement changes effective November 1, 2025

---

## Recommended Action Plan

### Immediate Priorities (High Impact)
1. **Update Statewide Monthly Data** (FY89-FY22 → FY89-FY25)
   - Download from USDA FNS
   - Add January 2022 - May 2025 data
   - Update README and visualizations

2. **Update SNAP Retailer Historical Data** (1990-2021 → 1990-2024)
   - Download from USDA FNS Historical Data
   - Clean Hawaii data (address geolocation errors)
   - Update README and visualizations

3. **Verify & Update County Bi-Annual Data** (FY89-Jul2020 → FY89-latest)
   - Check if FNS still publishes this dataset
   - Add July 2020 - latest available
   - Fix README discrepancy (claims Jan 2021, actually July 2020)

### Secondary Priorities (Medium Impact)
4. **Update/Replace Retailer Time Series** (2005-2020 → 2005-2024)
   - Decide: Shannon database vs. direct USDA source
   - Extract and clean Hawaii data
   - Update README and visualizations

5. **Check Hawaii DHS for Application Data** (2020-2022 → 2020-2025)
   - Visit humanservices.hawaii.gov
   - Download any available SNAP application data releases
   - Update dataset and README

### Documentation Updates
6. **Update README.md**
   - Correct date ranges for all datasets
   - Update source links if needed
   - Note data currency and last update dates
   - Add this findings document to repository

7. **Update Tableau Visualizations**
   - Refresh all dashboards with new data
   - Update date ranges in titles/descriptions

---

## Data Source URLs (for reference)

| Dataset | Source URL | Status |
|---------|-----------|--------|
| Monthly State Data | https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap | Active, through May 2025 |
| Bi-Annual County Data | https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap | Verify if still published |
| Historical Retailer Data | https://www.fns.usda.gov/snap/retailer/historical-data | Active, through Dec 31, 2024 |
| Shannon Retailer Database | https://github.com/jshannon75/snap_retailers | Active, through Dec 31, 2022 |
| Hawaii DHS SNAP Data | https://humanservices.hawaii.gov/communications/ | Verify current releases |
| SNAP Retailer Dashboards | https://www.fns.usda.gov/snap/retailer/data | FY 2023, FY 2024 available |

---

## Notes

- All federal SNAP data sources appear to be actively maintained
- The gap of 3+ years represents a significant data currency issue
- Hawaii-specific benefit levels and participation rates show interesting trends worth analyzing with updated data
- Repository would benefit from automated update checks or regular update schedule
- Consider documenting data update procedures for future maintenance

---

## Questions for Repository Maintainer

1. Would you like assistance downloading and processing the updated datasets?
2. Do you have access to Tableau to update the visualizations?
3. Should we prioritize certain datasets over others?
4. Would you like to set up a regular data update schedule?
5. Are there any new data sources or metrics you'd like to track?
