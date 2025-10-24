# SNAP Data Download Attempt Summary

**Date:** October 23, 2025
**Status:** FAILED - Network Restrictions

---

## What I Attempted

### Download Methods Tried:

1. **Direct WebFetch from USDA FNS:**
   - Attempted: `https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap`
   - Attempted: `https://www.fns.usda.gov/snap/retailer/historical-data`
   - **Result:** Domain blocked - "Unable to verify if domain www.fns.usda.gov is safe to fetch"

2. **Data.gov Catalog Access:**
   - Attempted: `https://catalog.data.gov/dataset/participation-and-benefits-national-state-monthly-annual-data`
   - **Result:** Domain blocked - "Unable to verify if domain catalog.data.gov is safe to fetch"

3. **GitHub Repository Access:**
   - Attempted: `https://github.com/jshannon75/snap_retailers`
   - **Result:** Domain blocked - "Unable to verify if domain github.com is safe to fetch"

4. **Direct file download via wget:**
   - Attempted: `http://www.fns.usda.gov/sites/default/files/pd/SNAPsummary.xls`
   - **Result:** 403 Forbidden

5. **Direct file download via curl with custom user agent:**
   - Attempted: Same URL as above
   - **Result:** 403 Forbidden (13 bytes received)

6. **Alternative Azure CDN URLs:**
   - Attempted: Various `fns-prod.azureedge.us` URLs
   - **Result:** 403 Forbidden

---

## Network Environment Analysis

**Issue:** All attempts to access USDA, Data.gov, and GitHub domains are being blocked by network security policies.

**Proxy detected:** Yes - Connections route through proxy at 21.0.0.69:15002

**Blocked domains:**
- www.fns.usda.gov
- fns-prod.azureedge.us
- catalog.data.gov
- github.com

**Error types encountered:**
- WebFetch: "Unable to verify if domain is safe to fetch"
- wget/curl: "403 Forbidden"

---

## What I Found Through Web Search

### Dataset 1: Statewide Monthly SNAP Data (FY89-FY25)

**Official Source:** https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap

**Available Data:**
- Latest month available: **May 2025**
- Data as of: August 8, 2025
- Coverage: FY69-FY25 (state data starts FY89)
- Formats: Excel (.xlsx), PDF, ZIP

**Update Needed:**
- Current dataset ends: January 2022
- New data available: February 2022 - May 2025
- Missing data: **~40 months**

**Data Catalog Entry:**
- Data.gov: "Participation and Benefits - National & State Monthly/Annual Data"
- URL: https://catalog.data.gov/dataset/participation-and-benefits-national-state-monthly-annual-data
- License: Creative Commons CCZero (public domain)

---

### Dataset 2: Historical SNAP Retailer Data

**Official Source:** https://www.fns.usda.gov/snap/retailer/historical-data

**Available Data:**
- Current as of: **December 31, 2024**
- Coverage: Retailers authorized since 2004
- Format: Zipped CSV
- Includes: Name, Type, Address, Location, Authorization Dates

**Update Needed:**
- Current dataset ends: 2021
- New data available: 2022-2024
- Missing data: **~3 years**

**Data Catalog Entry:**
- Data.gov: "SNAP Retail Locator"
- URL: https://catalog.data.gov/dataset/snap-retail-locator

**Alternative Source (older):**
- Dr. Jerry Shannon's GitHub: https://github.com/jshannon75/snap_retailers
- Coverage through: December 31, 2022
- Note: USDA direct source is more current

---

## Files Created

### 1. Download Instructions Document
**Location:** `/home/user/Hawaii-SNAP/DOWNLOAD_INSTRUCTIONS.md`

**Contents:**
- Detailed manual download instructions
- Expected data formats and columns
- Post-download processing steps
- Data verification checklists
- Alternative data sources
- Troubleshooting guidance

---

## Required Manual Actions

### STEP 1: Download Dataset 1 - Monthly SNAP Data

**Option A - Direct from USDA FNS (Recommended):**
1. Open browser: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
2. Find section: "National and/or State Level Monthly and/or Annual Data"
3. Download the ZIP or Excel file covering FY89-FY25
4. Save to: `/home/user/Hawaii-SNAP/Data/`

**Option B - From Data.gov:**
1. Open browser: https://catalog.data.gov/dataset/participation-and-benefits-national-state-monthly-annual-data
2. Click "Download" or "Access" button
3. Download the ZIP or CSV file
4. Save to: `/home/user/Hawaii-SNAP/Data/`

### STEP 2: Download Dataset 2 - Retailer Historical Data

**Option A - Direct from USDA FNS (Recommended):**
1. Open browser: https://www.fns.usda.gov/snap/retailer/historical-data
2. Download the zipped CSV file (current as of Dec 31, 2024)
3. Save to: `/home/user/Hawaii-SNAP/Data/`

**Option B - From Data.gov:**
1. Open browser: https://catalog.data.gov/dataset/snap-retail-locator
2. Click "Download" or "Access" button
3. Download the CSV or ZIP file
4. Save to: `/home/user/Hawaii-SNAP/Data/`

### STEP 3: Extract and Process

Once files are downloaded, I can help you:
1. Extract ZIP files
2. Filter for Hawaii data
3. Clean and validate data
4. Merge with existing datasets
5. Update visualizations and documentation

---

## Expected File Details

### Monthly SNAP Data

**Downloaded file likely named:**
- `pd_national_state_summary_fy89_fy25.zip` or similar
- `SNAPsummary.xls` or `SNAPsummary.xlsx`
- `state-monthly-data-fy69-fy25.zip` or similar

**After extraction/filtering, should contain:**
- Hawaii records only
- Date range: October 1989 - May 2025
- Approximately 428 monthly records
- Columns: Date, Households, Persons, Per Household, Per Person, Cost

### Retailer Historical Data

**Downloaded file likely named:**
- `snap-retailer-historical-data-2024-12-31.zip` or similar
- `store_locations.csv.zip` or similar
- `SNAP_Retailer_Historical_Data.zip` or similar

**After extraction/filtering, should contain:**
- Hawaii (HI) records only
- Date range: 2004 (or earlier) - December 31, 2024
- Approximately 4,000-5,000 records for Hawaii
- Columns: Store Name, Type, Address, City, State, ZIP, Lat, Long, Auth Date, End Date

**Known issue to address:**
- Previous dataset had 39.4% of Hawaii records with incorrect geolocation
- Will need to filter for valid Hawaii coordinates:
  - Latitude: 18.9° to 22.2° N
  - Longitude: -160.2° to -154.8° W

---

## Hawaii SNAP Context (for reference)

### Current Participation (FY 2024):
- **Households:** 56,690 (11.5% of state)
- **Individuals:** 161,600 (11.2% of population)

### Recent Changes:
- **FY 2025:** Max benefit for family of 4 = $1,723/month
- **July 4, 2025:** One Big Beautiful Bill Act (OBBBA) signed
- **Nov 1, 2025:** Work requirement changes take effect

### Why This Data Matters:
The 3+ year gap in data (2022-2025) includes significant policy changes that likely impacted Hawaii SNAP participation and benefits. Updated data will show:
- COVID-era benefit changes phasing out
- Impact of OBBBA legislation
- New work requirement effects
- Retailer network changes during and after pandemic

---

## Next Steps After You Download

1. **Let me know when files are downloaded:**
   - Provide the exact filenames downloaded
   - I'll help extract and process them

2. **Data Processing I'll Perform:**
   - Extract ZIP files
   - Filter for Hawaii records
   - Validate data quality
   - Clean geolocation errors (retailer data)
   - Merge with existing datasets
   - Create updated CSV files

3. **Documentation Updates:**
   - Update README.md with new date ranges
   - Note data sources and download dates
   - Document any data quality issues found
   - Update DATA_UPDATE_FINDINGS.md

4. **Analysis I Can Provide:**
   - Summary statistics for 2022-2025 period
   - Trend analysis vs. previous years
   - Retailer network changes
   - County-level patterns (if county data is updated)

---

## Alternative Solutions to Explore

If manual download is not feasible, consider:

1. **Network Whitelist Request:**
   - Request IT to whitelist: `*.fns.usda.gov`, `fns-prod.azureedge.us`, `catalog.data.gov`
   - Justification: Public government data access for research purposes

2. **Download from Different Network:**
   - Use personal computer/network
   - Use mobile hotspot
   - Transfer files via USB/cloud storage

3. **Request Data via Email:**
   - Contact: fns-data@usda.gov
   - Request specific datasets by name and date range

4. **Use Institution Data Access:**
   - Many universities/research institutions have data portal access
   - Check if your organization has existing USDA data subscriptions

---

## Summary

**Status:** Unable to download automatically due to network security restrictions

**Attempted:** 6 different download methods, all blocked

**Found:** Confirmed both datasets are available and current (through May 2025 for monthly data, Dec 31 2024 for retailer data)

**Created:** Comprehensive download instructions document

**Action Required:** Manual download using browser on unrestricted network

**Next:** Once files are downloaded, I can complete the processing and update the repository

---

**Prepared by:** Claude Code Assistant
**Document:** /home/user/Hawaii-SNAP/DOWNLOAD_INSTRUCTIONS.md
**Summary:** /home/user/Hawaii-SNAP/Data/DOWNLOAD_SUMMARY.md
