# Quick Start: Updating Hawaii SNAP Data
**Last Updated:** October 23, 2025

## TL;DR - What You Need to Do

1. **Download 2 files manually** (links below)
2. **Run one Python script**
3. **Check the results**
4. **Update your Tableau dashboards**

Total time: ~30 minutes

---

## Step 1: Download Files Manually

### File 1: Monthly SNAP Data (Priority: HIGH)

**What:** State-level monthly SNAP data for Hawaii through May 2025

**Where to get it:**
1. Go to: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
2. Look for section: "National and/or State Level Monthly and/or Annual Data"
3. Download the ZIP file (covers FY 89 through FY 25)
4. Extract and find the Hawaii data
5. Save to: `downloads/snap_monthly_update.xlsx`

**Why:** Adds 3+ years of new data (Feb 2022 - May 2025)

---

### File 2: Retailer Historical Data (Priority: HIGH)

**What:** All SNAP-authorized retailers (nationwide, you'll filter for Hawaii)

**Where to get it:**
1. Go to: https://www.fns.usda.gov/snap/retailer/historical-data
2. Download the zipped CSV file (current as of December 31, 2024)
3. Extract the CSV
4. Save to: `downloads/snap_retailers_historical.csv`

**Why:** Adds 3+ years of retailer data (2022-2024)

---

## Step 2: Run the Update Script

```bash
# Install dependencies (if needed)
pip install pandas openpyxl

# Create downloads directory
mkdir -p downloads

# Put your downloaded files in downloads/

# Run the update script
cd scripts
python download_and_update.py --all

# Follow the on-screen instructions
```

**What the script does:**
- Backs up your existing data files
- Reads the new data you downloaded
- Filters for Hawaii records only
- Merges with existing data
- Validates data quality
- Saves updated files
- Generates a status report

---

## Step 3: Validate the Results

```bash
# Run validation
python validate_data.py --all

# Check for any warnings or issues
```

**What to look for:**
- ✓ Date ranges updated (should go through 2024/2025)
- ✓ No critical errors
- ⚠ Some warnings are OK (known geolocation issues in retailer data)

---

## Step 4: Update Visualizations

Your Tableau dashboards will need refreshing:

1. **Statewide Monthly SNAP Data Dashboard**
   - URL: https://public.tableau.com/views/SNAP_16192081784540/SNAPData
   - Data source: `Data/Statewide Monthly SNAP FY 89-25.csv` (new filename)
   - Check: Date range now extends through May 2025

2. **County Bi-Annual Dashboard**
   - URL: https://public.tableau.com/shared/JD56P52PB
   - Status: Check if updated data is available

3. **Retailer Historical Dashboard**
   - URL: https://public.tableau.com/shared/YDWF6BSNG
   - Data source: `Data/Statewide SNAP Retailers Historical- FNS 2024.csv`
   - Check: Should now include data through Dec 31, 2024

4. **Retailer Time Series Dashboard**
   - URL: https://public.tableau.com/shared/JCGD9KGHW
   - Status: May need to switch data sources

---

## Alternative: Quick Status Check First

Not ready to update everything? Just want to see what's available?

```bash
# Generate current status report
python scripts/download_and_update.py --report

# This shows:
# - Current data coverage
# - What files you have
# - How out-of-date they are
# - No changes made
```

---

## Troubleshooting

### "Can't download files from USDA"

**Problem:** Network restrictions, firewall, or site temporarily down

**Solution:**
- Try from a different network (home, mobile hotspot)
- Try at a different time
- Contact your IT department to whitelist USDA domains
- Email USDA for data: fns-data@usda.gov

### "Script says file not found"

**Problem:** Downloaded file in wrong location or wrong name

**Solution:**
```bash
# Check what files you have
ls -l downloads/

# Rename if needed
mv downloads/your_file.xlsx downloads/snap_monthly_update.xlsx
```

### "Column names don't match"

**Problem:** USDA changed their file format

**Solution:**
- Open an issue on this repository
- Or manually edit the script's column_mapping section
- See scripts/download_and_update.py line ~150

### "Validation shows errors"

**Problem:** Data quality issues

**Solution:**
- Check the validation report details
- Some warnings are expected (especially geolocation in retailer data)
- Critical errors = stop and investigate
- Warnings = document and proceed (usually)

---

## What If I Can't Update Everything?

**Priority ranking:**

1. **Statewide Monthly Data** - HIGHEST PRIORITY
   - Most used
   - Easiest to update
   - 3+ years of new data available

2. **Retailer Historical Data** - HIGH PRIORITY
   - Significant new data (3+ years)
   - Shows post-pandemic retailer landscape
   - Known geolocation issues to handle

3. **County Bi-Annual Data** - MEDIUM PRIORITY
   - Need to verify if still published
   - 5+ year gap to fill

4. **State Application Data** - MEDIUM PRIORITY
   - Depends on Hawaii DHS releases
   - May require manual outreach

---

## Success Criteria

You're done when:

- [ ] Monthly data covers through May 2025
- [ ] Retailer data covers through Dec 31, 2024
- [ ] Validation passes without critical errors
- [ ] README.md updated with new date ranges
- [ ] Tableau dashboards refreshed
- [ ] Changes committed to git

---

## Getting Help

**Documentation:**
- Full details: `DATA_UPDATE_FINDINGS.md`
- Analysis context: `SNAP_ANALYSIS_2024-2025.md`
- Script usage: `python scripts/download_and_update.py --help`

**Issues:**
- Check existing issues on GitHub
- Open a new issue with details
- Include validation report output

**Questions:**
- What datasets are available? → See `DATA_UPDATE_FINDINGS.md`
- How to run scripts? → See this guide
- What changed in 2024-2025? → See `SNAP_ANALYSIS_2024-2025.md`
- Why the data gap? → Network restrictions, see findings doc

---

## Next Steps After Update

Once you have updated data, you can:

1. **Analyze pandemic transition period (2022-2024)**
   - How did participation change as emergency benefits ended?
   - What happened to average benefits per household?
   - County-level variations?

2. **Study retailer network evolution**
   - Which retailers entered/exited?
   - Store type distribution changes?
   - Geographic coverage patterns?

3. **Assess policy impacts**
   - Benefit reduction effects (2023-2025)
   - OBBBA work requirement changes (Nov 2025)

4. **Update research and visualizations**
   - New insights from 3+ years of data
   - Comparative analysis with national trends
   - Updated forecasting models

---

## Maintenance Going Forward

**Recommended update schedule:**
- **Monthly data:** Quarterly (as new months published)
- **Retailer data:** Annually (typically updated December)
- **County data:** Bi-annually (if still published)
- **Application data:** As released by Hawaii DHS

**Set a calendar reminder:**
- January: Check for updated retailer data (Dec 31 data)
- Quarterly: Check for new monthly SNAP data
- July: Check for bi-annual county data

---

## Estimated Impact

**What this update gives you:**

- **41 new months** of statewide data (Feb 2022 - May 2025)
- **3+ years** of retailer changes (2022-2024)
- **Post-pandemic insights**: Emergency benefit wind-down, economic recovery
- **Policy change context**: Benefit reductions, work requirement evolution
- **Current relevance**: Data less than 6 months old (vs 3+ years old)

**Research value:**
- Natural experiment: pandemic → recovery transition
- Policy impact: benefit reductions 2023-2025
- Economic indicators: application trends, participation rates
- Geographic analysis: county-level disparities

**Time savings:**
- Once updated: Easy to maintain quarterly
- Automated processing: Run one script vs manual work
- Validation built-in: Catch errors early

---

## Questions?

Still confused? Start here:

```bash
# See current status
python scripts/download_and_update.py --report

# Read the findings
cat DATA_UPDATE_FINDINGS.md

# Read the analysis
cat SNAP_ANALYSIS_2024-2025.md
```

Good luck! You're helping create a valuable public resource for understanding Hawaii's food assistance landscape.
