# SNAP Data Download Instructions

**Date:** October 23, 2025
**Status:** Unable to download automatically due to network restrictions

## Issue Summary

Automated download attempts from USDA FNS websites are blocked by network restrictions (403 Forbidden errors). The following methods were attempted and failed:

- Direct `wget` downloads
- `curl` with custom user agent
- Alternative CDN URLs (fns-prod.azureedge.us)
- WebFetch tool
- Data.gov catalog access

## Required Datasets

### 1. Statewide Monthly SNAP Data (FY89-FY25)

**Current Data:** FY89 through January 2022
**Target Update:** FY89 through May 2025 (3+ years of new data)

**Source Page:** https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap

**File to Download:** Look for "National and/or State Level Monthly and/or Annual Data" - ZIP file

**Known URL Pattern (may vary):**
- `http://www.fns.usda.gov/sites/default/files/pd/SNAPsummary.xls`
- OR: Look for ZIP file containing monthly state-level data on the source page

**Data Columns Expected:**
- Date (monthly)
- State (filter for Hawaii)
- Households
- Persons
- Average Monthly Benefit Per Household
- Average Monthly Benefit Per Person
- Benefits (total cost)

**File Format:** Excel (.xls or .xlsx) or ZIP containing multiple XLS files

---

### 2. Historical SNAP Retailer Data (current as of Dec 31, 2024)

**Current Data:** 1990-2021
**Target Update:** Through December 31, 2024 (3+ years of new data)

**Source Page:** https://www.fns.usda.gov/snap/retailer/historical-data

**File to Download:** Zipped CSV file with historical retailer data

**Data Columns Expected:**
- Retailer Name
- Store Type
- Street Address
- City
- State (filter for Hawaii: HI)
- ZIP Code
- Latitude
- Longitude
- Authorization Date
- End Date (if deauthorized)

**File Format:** ZIP file containing CSV

**Note:** Previous data had issues with ~39% of Hawaii records (1,614 out of 4,099) having location data outside of the state. Will need to clean/filter for accurate Hawaii locations.

---

## Manual Download Instructions

### Option 1: Direct Browser Download (Recommended)

1. **For Monthly State Data:**
   - Visit: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
   - Scroll to "National and/or State Level Monthly and/or Annual Data"
   - Download the most recent ZIP or Excel file (should cover FY69-FY25 or FY89-FY25)
   - Save to: `/home/user/Hawaii-SNAP/Data/`

2. **For Retailer Data:**
   - Visit: https://www.fns.usda.gov/snap/retailer/historical-data
   - Download the zipped CSV file (current as of December 31, 2024)
   - Save to: `/home/user/Hawaii-SNAP/Data/`

### Option 2: Alternative Data Sources

1. **Data.gov Catalog:**
   - Monthly Data: https://catalog.data.gov/dataset/participation-and-benefits-national-state-monthly-annual-data
   - SNAP Retailer: https://catalog.data.gov/dataset/snap-retail-locator

2. **Dr. Jerry Shannon's GitHub Repository (Retailer Data through 2022):**
   - Repository: https://github.com/jshannon75/snap_retailers
   - Note: Only updated through December 31, 2022 (USDA direct source is more current)

### Option 3: Request Data via Email/Contact

If direct downloads fail, you can contact:
- USDA FNS Customer Service: fns-data@usda.gov
- Request specific datasets by name and date range

---

## Post-Download Processing Steps

### For Monthly State Data:

1. **Extract ZIP file** (if downloaded as ZIP):
   ```bash
   cd /home/user/Hawaii-SNAP/Data
   unzip [downloaded-zip-file].zip
   ```

2. **Filter for Hawaii data:**
   - If multiple XLS files, identify which contains state-level monthly data
   - Filter for Hawaii (HI) records
   - Extract columns: Date, Households, Persons, Per Household, Per Person, Cost
   - Date range: Need data from February 2022 through May 2025

3. **Append to existing dataset:**
   - Current file: `Statewide Monthly SNAP FY 89-22.csv`
   - Append new records (Feb 2022 - May 2025)
   - Create updated file: `Statewide Monthly SNAP FY 89-25.csv`

### For Retailer Historical Data:

1. **Extract ZIP file:**
   ```bash
   cd /home/user/Hawaii-SNAP/Data
   unzip [retailer-historical-data].zip
   ```

2. **Filter for Hawaii:**
   - Filter for State = "HI"
   - Verify location coordinates are within Hawaii bounds:
     - Latitude: approximately 18.9° to 22.2° N
     - Longitude: approximately -160.2° to -154.8° W
   - Remove records with coordinates outside these bounds

3. **Save filtered dataset:**
   - Create: `Statewide SNAP Retailers Historical-FNS-2024.csv`

---

## Data Verification Checklist

### Monthly State Data:
- [ ] File downloaded and extracted
- [ ] Contains Hawaii (HI) state records
- [ ] Date range extends through May 2025
- [ ] Contains all expected columns (Households, Persons, Benefits, etc.)
- [ ] Data format matches existing CSV structure
- [ ] No missing months between Jan 2022 and May 2025

### Retailer Data:
- [ ] File downloaded and extracted
- [ ] Contains Hawaii records (State = HI)
- [ ] Date range extends through December 31, 2024
- [ ] Contains all expected columns (Name, Type, Address, Location, Dates)
- [ ] Hawaii record count: _____ (for documentation)
- [ ] Records with valid Hawaii coordinates: _____ (should be >60%)

---

## Expected Outcomes

### Dataset 1: Monthly SNAP Data

**Existing File:** `Statewide Monthly SNAP FY 89-22.csv`
- Current records: ~388 monthly records (October 1989 - January 2022)
- Format: CSV

**Updated File:** `Statewide Monthly SNAP FY 89-25.csv`
- Expected records: ~428 monthly records (October 1989 - May 2025)
- New records to add: ~40 months (February 2022 - May 2025)
- Format: CSV

### Dataset 2: Retailer Historical Data

**Existing File:** `Statewide SNAP Retailers Historical- FNS.csv`
- Current records: 4,099 total (1,614 with location errors = 39.4%)
- Valid Hawaii records: ~2,485
- Date range: 1990-2021

**Updated File:** `Statewide SNAP Retailers Historical-FNS-2024.csv`
- Expected: 4,000-5,000 total Hawaii records
- Date range: 1990-2024 (through December 31, 2024)
- Format: CSV (filtered and cleaned)

---

## Known Issues & Notes

### Monthly Data:
- Data before FY1989 (October 1988) is only available at national level, not by state
- Some months may have missing or amended data
- Average benefit amounts can fluctuate due to policy changes and cost-of-living adjustments

### Retailer Data:
- **Geolocation Errors:** Previous dataset had 39.4% of records with incorrect locations
- Need to verify coordinates are within Hawaii boundaries
- Some retailers may have multiple authorization periods
- Mobile/temporary retailers may have variable addresses
- Authorization dates indicate when store was approved to accept SNAP
- End dates indicate deauthorization (if applicable)

### Recent Context (for reference):
- **FY 2024 Hawaii SNAP:** ~161,600 people / ~56,690 households (11.2% of population)
- **FY 2025:** Max benefit for family of 4 = $1,723
- **Policy Changes:** One Big Beautiful Bill Act (OBBBA) signed July 4, 2025
- **Work Requirements:** Changes effective November 1, 2025

---

## Alternative Approaches If Download Still Fails

### 1. Use ERS SNAP Data System
- URL: https://www.ers.usda.gov/data-products/supplemental-nutrition-assistance-program-snap-data-system
- Note: This dataset has been discontinued but historical data may still be accessible

### 2. Check State of Hawaii DHS
- URL: https://humanservices.hawaii.gov/communications/
- May have Hawaii-specific SNAP data releases
- Last known release: April 1, 2022

### 3. API Access (if available)
- USDA ERS provides some data APIs: https://www.ers.usda.gov/developer/data-apis
- Register for API key at: https://api.data.gov/signup/
- Check if SNAP data is available via programmatic access

### 4. Archive.org / Wayback Machine
- Search for archived versions of the FNS data pages
- May have access to older file versions

### 5. Request Technical Support
- If Claude is running in a restricted network environment
- Contact system administrator about whitelisting:
  - `*.fns.usda.gov`
  - `fns-prod.azureedge.us`
  - `fns-prod.azureedge.net`
  - `catalog.data.gov`

---

## Next Steps After Successful Download

1. Run data verification and cleaning scripts
2. Update `README.md` with new date ranges
3. Update Tableau visualizations with new data
4. Create analysis of trends from 2022-2025 period
5. Document any policy impacts visible in the data (e.g., OBBBA, work requirements)
6. Update `DATA_UPDATE_FINDINGS.md` with completion status

---

## Questions or Issues?

If you encounter problems downloading or processing the data:
1. Verify the source page URLs are still active
2. Check if USDA has changed their file naming conventions
3. Look for data release notices on the FNS website
4. Contact USDA FNS for assistance with data access

---

**Document prepared by:** Claude Code Assistant
**Last updated:** October 23, 2025
**Status:** Awaiting manual download due to network restrictions
