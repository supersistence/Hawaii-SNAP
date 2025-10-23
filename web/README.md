# Hawaii SNAP Data Visualization Dashboard

An interactive web-based dashboard visualizing Hawaii's Supplemental Nutrition Assistance Program (SNAP) participation, benefits, and trends from 1989-2022.

## Features

### Interactive Visualizations

1. **Overview Dashboard**
   - Current participation statistics
   - Historical trends (1999-2022)
   - Key metrics at a glance

2. **Participation Trends**
   - Household participation over time
   - Individual enrollment patterns
   - Economic cycle correlations

3. **Benefit Analysis**
   - Average benefit levels per household
   - Total program costs
   - Hawaii's higher cost adjustments

4. **COVID-19 Impact**
   - Pandemic period analysis
   - Emergency allotment effects
   - Recovery patterns

5. **County Comparison**
   - Geographic distribution
   - Public Assistance vs Non-PA breakdown
   - Island-specific patterns

6. **Key Insights & Implications**
   - Policy implications
   - Economic impacts
   - Hawaii-specific considerations
   - Research recommendations

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no framework)
- **Charting**: Chart.js 4.x with date adapters
- **Data**: JSON files generated from CSV sources
- **Deployment**: Netlify

## Local Development

### Prerequisites

```bash
# Python 3.9+ with pandas
pip install pandas
```

### Generate Data

```bash
# From repository root
python scripts/prepare_web_data.py
```

This creates JSON files in `web/data/` from the CSV source data.

### Serve Locally

```bash
# Using Python's built-in server
cd web
python -m http.server 8000

# Or use any static file server
# Then open http://localhost:8000
```

## Deployment

### Netlify (Recommended)

1. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Via GitHub Integration:**
   - Connect repository to Netlify
   - Set build command: `python scripts/prepare_web_data.py`
   - Set publish directory: `web`
   - Deploy automatically on push

3. **Manual Drag & Drop:**
   - Generate data: `python scripts/prepare_web_data.py`
   - Drag the `web/` folder to Netlify

### Configuration

See `netlify.toml` in repository root for:
- Build settings
- Python version
- Header configurations
- Caching rules

## File Structure

```
web/
├── index.html          # Main HTML page
├── styles.css          # All CSS styling
├── app.js             # JavaScript application logic
├── data/              # Generated JSON data files
│   ├── monthly.json   # Statewide monthly data
│   ├── county.json    # County-level data
│   ├── trends.json    # COVID-19 and recent trends
│   └── metadata.json  # Data generation metadata
└── README.md          # This file
```

## Data Updates

### Current Data Coverage

- **Statewide Monthly**: October 1988 - January 2022
- **County Bi-Annual**: January 1989 - July 2020
- **Status**: 3-5 years out of date (as of October 2025)

### To Update Data

1. **Download new data** (see [Quick Start Guide](../QUICK_START_UPDATE_GUIDE.md))
2. **Update CSV files** in `Data/` directory
3. **Regenerate JSON**:
   ```bash
   python scripts/prepare_web_data.py
   ```
4. **Redeploy** to Netlify (automatic if using GitHub integration)

Updated data available through May 2025 - see repository documentation.

## Key Metrics Displayed

### Participation
- Total persons receiving benefits
- Households served
- Geographic distribution by county

### Benefits
- Average monthly benefit per household
- Average benefit per person
- Total monthly program costs

### Trends
- Year-over-year changes
- COVID-19 impact analysis
- Long-term participation patterns

### Geographic
- County-level participation
- Public Assistance vs Non-PA breakdown
- Inter-island comparisons

## Browser Compatibility

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Responsive design

## Performance

- **Initial Load**: < 1 second (with CDN)
- **Data Files**: ~200KB total (JSON)
- **Charts**: Hardware accelerated via Canvas
- **Mobile**: Optimized responsive layouts

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible
- Color contrast WCAG AA compliant

## Analytics & Insights

The dashboard provides insights on:

1. **Economic Indicators**: SNAP participation as real-time economic signal
2. **Policy Impact**: Effects of benefit changes and eligibility rules
3. **Geographic Equity**: Urban-rural and inter-island disparities
4. **Crisis Response**: Program capacity during emergencies (COVID-19)
5. **Fiscal Planning**: Budget implications of participation trends

## Known Limitations

1. **Data Currency**: Current data ends January 2022
   - Missing 3+ years of post-pandemic data
   - See repository for update procedures

2. **Geographic Granularity**: County data ends July 2020
   - 5+ year gap in county-level trends
   - May not reflect current patterns

3. **Retailer Data**: Not included in web visualization
   - Available in repository
   - ~39% coordinate accuracy issues

## Contributing

Contributions welcome! Areas of interest:

1. **Data Updates**: Process and integrate 2022-2025 data
2. **New Visualizations**: Additional chart types or analyses
3. **Performance**: Optimization for large datasets
4. **Features**: Interactive filtering, data export, etc.

See main repository for contribution guidelines.

## Data Sources

- **Federal Data**: USDA Food and Nutrition Service (FNS)
  - [SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap)

- **State Data**: Hawaii Department of Human Services
  - [Communications & Data](https://humanservices.hawaii.gov/communications/)

- **Repository**: [GitHub - Hawaii-SNAP](https://github.com/supersistence/Hawaii-SNAP)

## Citation

If using this visualization in research or publications:

```
Hawaii SNAP Data Visualization Dashboard (2025)
https://github.com/supersistence/Hawaii-SNAP
Data sources: USDA FNS, Hawaii DHS
Accessed: [date]
```

## License

Data compiled from public government sources. Visualization code MIT licensed.

## Support

- **Issues**: [GitHub Issues](https://github.com/supersistence/Hawaii-SNAP/issues)
- **Documentation**: See repository README
- **Updates**: Check repository for latest data and features

---

**Last Updated**: October 2025
**Data Currency**: Through January 2022
**Next Update**: Awaiting 2022-2025 data integration
