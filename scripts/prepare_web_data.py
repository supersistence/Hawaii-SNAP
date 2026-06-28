#!/usr/bin/env python3
"""
Convert Hawaii SNAP CSV data to JSON for web visualization
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "Data"
WEB_DIR = Path(__file__).parent.parent / "web" / "data"

def _dhs_statewide_monthly():
    """DHS statewide monthly rows shaped like the USDA CSV (Household, Persons,
    Per Household, Per Person, Cost). Uses the pre-aggregated 'STATE' rows so
    there's no island double-counting; Cost = BenefitsIssued."""
    path = DATA_DIR / "dhs_snap_participation_by_island.csv"
    if not path.exists():
        return None
    s = pd.read_csv(path)
    s = s[s['Island'] == 'STATE'].copy()
    if s.empty:
        return None
    s['Date'] = pd.to_datetime(s['Date'])
    out = pd.DataFrame({
        'Date': s['Date'],
        'Household': s['Households'].astype(int),
        'Persons': s['Participants'].astype(int),
        'Cost': s['BenefitsIssued'].astype(int),
    })
    out['Per Household'] = (out['Cost'] / out['Household']).round(2)
    out['Per Person'] = (out['Cost'] / out['Persons']).round(2)
    return out.sort_values('Date')


def process_monthly_data():
    """Process the statewide monthly series for web charts.

    SPLICED series: USDA federal for the long history (1989–2008), then Hawai‘i
    DHS state data from 2008 onward. States report SNAP figures TO USDA, so the
    two are the same data — 92% of overlapping months are byte-identical — but
    DHS is ~a year more current (through May 2026) and is the original source.
    Splicing gives one continuous line that's both complete AND current; we
    prefer DHS wherever the two overlap."""
    print("Processing monthly data (USDA pre-2008 + DHS 2008–present)...")

    usda = pd.read_csv(DATA_DIR / "Statewide Monthly SNAP FY 89-25.csv")
    usda['Date'] = pd.to_datetime(usda['Date'])
    dhs = _dhs_statewide_monthly()
    if dhs is not None and len(dhs):
        splice_date = dhs['Date'].min()
        df = pd.concat([usda[usda['Date'] < splice_date], dhs], ignore_index=True)
        splice_iso = splice_date.strftime('%Y-%m-%d')
    else:
        df = usda
        splice_iso = None

    # Sort by date
    df = df.sort_values('Date')

    # Convert to format for Chart.js
    data = {
        'labels': df['Date'].dt.strftime('%Y-%m-%d').tolist(),
        'datasets': {
            'households': df['Household'].tolist(),
            'persons': df['Persons'].tolist(),
            'avgBenefitPerHousehold': df['Per Household'].tolist(),
            'avgBenefitPerPerson': df['Per Person'].tolist(),
            'totalCost': df['Cost'].tolist()
        },
        'metadata': {
            'startDate': df['Date'].min().strftime('%Y-%m-%d'),
            'endDate': df['Date'].max().strftime('%Y-%m-%d'),
            'totalMonths': len(df),
            'latestHouseholds': int(df.iloc[-1]['Household']),
            'latestPersons': int(df.iloc[-1]['Persons']),
            'latestAvgBenefitPerHousehold': float(df.iloc[-1]['Per Household']),
            'latestAvgBenefitPerPerson': float(df.iloc[-1]['Per Person']),
            'latestTotalCost': int(df.iloc[-1]['Cost']),
            'spliceDate': splice_iso,
            'source': ('USDA FNS (pre-2008) + Hawai‘i DHS (2008–present)'
                       if splice_iso else 'USDA FNS')
        }
    }

    # Participation as a share of Hawai‘i's resident population. Annual Census
    # population (FRED HIPOP) is linearly interpolated to each month; the rate
    # = persons / population. If enrollment merely tracked population growth
    # this line would be flat — it isn't, which is the point.
    pop = pd.read_csv(DATA_DIR / "hawaii_population_annual.csv")
    by_year = dict(zip(pop['Year'].astype(int), pop['Population'].astype(int)))
    years = sorted(by_year)

    def pop_at(ts):
        y = ts.year + (ts.month - 1) / 12.0
        lo = int(y)
        p0 = by_year.get(lo, by_year[years[0] if lo < years[0] else years[-1]])
        p1 = by_year.get(lo + 1, p0)
        return p0 + (p1 - p0) * (y - lo)

    populations = [pop_at(d) for d in df['Date']]
    data['datasets']['population'] = [int(round(p)) for p in populations]
    data['datasets']['participationRate'] = [round(pers / p * 100, 2)
                                             for pers, p in zip(df['Persons'], populations)]
    data['metadata']['latestParticipationRate'] = data['datasets']['participationRate'][-1]

    # Calculate summary statistics
    data['summary'] = {
        'peak': {
            'households': {
                'value': int(df['Household'].max()),
                'date': df.loc[df['Household'].idxmax(), 'Date'].strftime('%Y-%m-%d')
            },
            'persons': {
                'value': int(df['Persons'].max()),
                'date': df.loc[df['Persons'].idxmax(), 'Date'].strftime('%Y-%m-%d')
            },
            'avgBenefitPerHousehold': {
                'value': float(df['Per Household'].max()),
                'date': df.loc[df['Per Household'].idxmax(), 'Date'].strftime('%Y-%m-%d')
            },
            'totalCost': {
                'value': int(df['Cost'].max()),
                'date': df.loc[df['Cost'].idxmax(), 'Date'].strftime('%Y-%m-%d')
            }
        },
        'averages': {
            'households': int(df['Household'].mean()),
            'persons': int(df['Persons'].mean()),
            'avgBenefitPerHousehold': round(df['Per Household'].mean(), 2),
            'avgBenefitPerPerson': round(df['Per Person'].mean(), 2),
            'totalCost': int(df['Cost'].mean())
        }
    }

    # Calculate year-over-year changes
    latest = df.iloc[-1]
    year_ago_idx = max(0, len(df) - 13)  # 12 months ago
    year_ago = df.iloc[year_ago_idx]

    data['yearOverYear'] = {
        'households': {
            'current': int(latest['Household']),
            'yearAgo': int(year_ago['Household']),
            'change': int(latest['Household'] - year_ago['Household']),
            'percentChange': round((latest['Household'] - year_ago['Household']) / year_ago['Household'] * 100, 2)
        },
        'persons': {
            'current': int(latest['Persons']),
            'yearAgo': int(year_ago['Persons']),
            'change': int(latest['Persons'] - year_ago['Persons']),
            'percentChange': round((latest['Persons'] - year_ago['Persons']) / year_ago['Persons'] * 100, 2)
        }
    }

    return data


def process_county_data():
    """Process county bi-annual data for geographic comparisons."""
    print("Processing county data...")

    df = pd.read_csv(DATA_DIR / "County Bi-Annual SNAP 89-25.csv")
    df['Date'] = pd.to_datetime(df['Date'])

    # County population (for per-capita normalization). Without this, county
    # maps just restyle the population map — Honolulu dominates by volume while
    # actual SNAP burden (% of residents) is highest on the Big Island.
    pop_df = pd.read_csv(DATA_DIR / "county_population.csv")
    pop = dict(zip(pop_df['County'], pop_df['Population']))
    pop_year = int(pop_df['Year'].iloc[0])

    # Get latest data for each county
    latest_date = df['Date'].max()
    latest = df[df['Date'] == latest_date].copy()

    data = {
        'asOfDate': latest_date.strftime('%Y-%m-%d'),
        'populationYear': pop_year,
        'counties': []
    }

    for _, row in latest.iterrows():
        persons_total = int(row['Calc: SNAP Total PA and Non-PA People'])
        population = pop.get(row['County'])
        # Share of residents receiving SNAP — the per-capita measure that
        # reveals divergence from raw population.
        rate = round(persons_total / population * 100, 1) if population else None
        data['counties'].append({
            'name': row['County'],
            'fips': row['FIPS'],
            'population': population,
            'participationRate': rate,
            'persons': {
                'publicAssistance': int(row['SNAP All Persons Public Assistance Participation']),
                'nonPublicAssistance': int(row['SNAP All Persons Non-Public Assistance Participation']),
                'total': persons_total
            },
            'households': {
                'publicAssistance': int(row['SNAP All Households Public Assistance Participation']),
                'nonPublicAssistance': int(row['SNAP All Households Non-Public Assistance Participation']),
                'total': int(row['Calc: SNAP Total PA and Non-PA Households'])
            },
            'totalIssuance': int(row['SNAP All Total Actual PA & Non-PA Issuance'])
        })

    # Calculate totals
    state_persons = sum(c['persons']['total'] for c in data['counties'])
    state_pop = sum(v for v in pop.values())
    data['stateTotal'] = {
        'persons': state_persons,
        'households': sum(c['households']['total'] for c in data['counties']),
        'totalIssuance': sum(c['totalIssuance'] for c in data['counties']),
        'population': state_pop,
        'participationRate': round(state_persons / state_pop * 100, 1) if state_pop else None
    }

    # Calculate county time series
    counties_over_time = {}
    for county in latest['County'].unique():
        county_df = df[df['County'] == county].sort_values('Date')
        counties_over_time[county] = {
            'dates': county_df['Date'].dt.strftime('%Y-%m-%d').tolist(),
            'persons': county_df['Calc: SNAP Total PA and Non-PA People'].tolist(),
            'households': county_df['Calc: SNAP Total PA and Non-PA Households'].tolist()
        }

    data['timeSeries'] = counties_over_time

    return data


def process_recent_trends():
    """Extract recent trends and COVID impact."""
    print("Processing recent trends...")

    df = pd.read_csv(DATA_DIR / "Statewide Monthly SNAP FY 89-25.csv")
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')

    # Focus on 2019-2022 for COVID impact
    recent = df[df['Date'] >= '2019-01-01'].copy()

    # Identify key periods
    pre_covid = recent[recent['Date'] < '2020-03-01']
    covid_start = recent[(recent['Date'] >= '2020-03-01') & (recent['Date'] < '2021-01-01')]
    covid_peak = recent[(recent['Date'] >= '2021-01-01') & (recent['Date'] < '2021-09-01')]
    post_covid = recent[recent['Date'] >= '2021-09-01']

    data = {
        'periods': {
            'preCovidAvg': {
                'households': int(pre_covid['Household'].mean()),
                'persons': int(pre_covid['Persons'].mean()),
                'avgBenefitPerHousehold': round(pre_covid['Per Household'].mean(), 2)
            },
            'covidPeak': {
                'households': int(covid_peak['Household'].max()),
                'persons': int(covid_peak['Persons'].max()),
                'avgBenefitPerHousehold': round(covid_peak['Per Household'].max(), 2),
                'date': covid_peak.loc[covid_peak['Household'].idxmax(), 'Date'].strftime('%Y-%m-%d')
            },
            'latest': {
                'households': int(recent.iloc[-1]['Household']),
                'persons': int(recent.iloc[-1]['Persons']),
                'avgBenefitPerHousehold': round(recent.iloc[-1]['Per Household'], 2),
                'date': recent.iloc[-1]['Date'].strftime('%Y-%m-%d')
            }
        },
        'covidImpact': {
            'peakIncrease': {
                'households': int(covid_peak['Household'].max() - pre_covid['Household'].mean()),
                'householdsPercent': round((covid_peak['Household'].max() - pre_covid['Household'].mean()) / pre_covid['Household'].mean() * 100, 2),
                'persons': int(covid_peak['Persons'].max() - pre_covid['Persons'].mean()),
                'personsPercent': round((covid_peak['Persons'].max() - pre_covid['Persons'].mean()) / pre_covid['Persons'].mean() * 100, 2)
            }
        },
        'recentData': {
            'labels': recent['Date'].dt.strftime('%Y-%m-%d').tolist(),
            'households': recent['Household'].tolist(),
            'persons': recent['Persons'].tolist(),
            'avgBenefitPerHousehold': recent['Per Household'].tolist()
        }
    }

    return data


def process_dhs_data():
    """Process Hawaii DHS by-island monthly participation for the dashboard.

    DHS data is monthly, island-level, and more current than the USDA series
    (through May 2026). Kept as a separate, clearly-labeled view rather than
    spliced into the USDA series (different source/methodology)."""
    path = DATA_DIR / "dhs_snap_participation_by_island.csv"
    if not path.exists():
        return None
    print("Processing DHS participation data...")
    df = pd.read_csv(path)
    df = df.sort_values('Date')

    state = df[df['Island'] == 'STATE']
    # Map DHS island/branch -> census county for per-capita (sub-islands roll up
    # into Maui County via 'Maui Branch').
    county_for = {'Oahu Branch': 'HONOLULU', 'Hawaii Branch': 'HAWAII',
                  'Kauai Branch': 'KAUAI', 'Maui Branch': 'MAUI'}
    pop = dict(zip(*[pd.read_csv(DATA_DIR / "county_population.csv")[c]
                     for c in ('County', 'Population')]))

    latest = df[df['Date'] == df['Date'].max()]
    islands = []
    for _, r in latest[latest['Island'].isin(county_for)].iterrows():
        county = county_for[r['Island']]
        p = pop.get(county)
        islands.append({
            'island': r['Island'], 'county': county.title(),
            'participants': int(r['Participants']),
            'households': int(r['Households']),
            'participationRate': round(int(r['Participants']) / p * 100, 1) if p else None,
        })

    result = {
        'source': 'Hawaii DHS (Department of Human Services)',
        'granularity': 'monthly, by island/branch',
        'asOfDate': str(df['Date'].max()),
        'statewideMonthly': {
            'dates': state['Date'].tolist(),
            'participants': [int(x) for x in state['Participants']],
            'households': [int(x) for x in state['Households']],
        },
        'latestByCounty': sorted(islands, key=lambda x: -(x['participationRate'] or 0)),
    }

    # Application timeliness (monthly statewide): applications received + % timely.
    tl_path = DATA_DIR / "dhs_snap_application_timeliness.csv"
    if tl_path.exists():
        tl = pd.read_csv(tl_path).sort_values('Date')
        result['timeliness'] = {
            'dates': tl['Date'].tolist(),
            'applicationsReceived': [int(x) for x in tl['ApplicationsReceived']],
            'percentTimely': [round(float(x) * 100, 1) for x in tl['PercentTimely']],
        }
    return result


def process_retailers():
    """Active SNAP retailers → store-type counts + a dot map. Points are
    projected with the saved island params (hawaii_islands_proj.json) so the
    map aligns with the same projection used elsewhere, without re-fetching the
    county GeoJSON."""
    proj_path = DATA_DIR / "hawaii_islands_proj.json"
    csv_path = DATA_DIR / "hawaii_snap_retailers_2004-2025_valid_coords.csv"
    if not proj_path.exists() or not csv_path.exists():
        return None
    print("Processing retailer network...")
    pr = json.loads(proj_path.read_text())
    LON0, LAT1, kx, minx, miny, scale = (pr['LON0'], pr['LAT1'], pr['kx'],
                                         pr['minx'], pr['miny'], pr['scale'])

    def cat(t):
        t = str(t).lower()
        if 'convenience' in t: return 'convenience'
        if 'farmers' in t or 'fruits' in t or 'veg' in t: return 'local'
        if any(k in t for k in ('grocery', 'super', 'supermarket')): return 'grocery'
        return 'specialty'

    df = pd.read_csv(csv_path)
    active = df[df['End Date'].isna() | (df['End Date'].astype(str).str.strip() == '')]
    points = []
    for _, r in active.iterrows():
        try:
            lon, lat = float(r['Longitude']), float(r['Latitude'])
        except (ValueError, TypeError):
            continue
        if not (LON0 <= lon <= -154.5 and 18.7 <= lat <= LAT1):
            continue
        x = ((lon - LON0) * kx - minx) * scale
        y = ((LAT1 - lat) - miny) * scale
        points.append({'x': round(x, 1), 'y': round(y, 1), 'c': cat(r['Store Type'])})
    types = active['Store Type'].value_counts()
    byco = active['County'].astype(str).str.title().value_counts()
    return {
        'asOf': '2025', 'activeCount': int(len(active)),
        'byCounty': [{'county': c, 'count': int(n)} for c, n in byco.items()],
        'typeCounts': [{'type': t, 'count': int(n)} for t, n in types.items()],
        'map': {'w': pr['w'], 'h': pr['h'], 'paths': pr['paths'], 'points': points},
    }


def main():
    """Generate all JSON data files for web visualization."""

    # Create output directory
    WEB_DIR.mkdir(parents=True, exist_ok=True)

    print("Generating JSON data for web visualization...")
    print(f"Output directory: {WEB_DIR}")

    # Process each dataset
    monthly_data = process_monthly_data()
    county_data = process_county_data()
    trends_data = process_recent_trends()
    dhs_data = process_dhs_data()
    retailer_data = process_retailers()

    # Save to JSON files
    with open(WEB_DIR / 'monthly.json', 'w') as f:
        json.dump(monthly_data, f, indent=2)
    print(f"✓ Saved monthly.json")

    if dhs_data:
        with open(WEB_DIR / 'dhs.json', 'w') as f:
            json.dump(dhs_data, f, indent=2)
        print(f"✓ Saved dhs.json")

    if retailer_data:
        with open(WEB_DIR / 'retailers.json', 'w') as f:
            json.dump(retailer_data, f)
        print(f"✓ Saved retailers.json")

    with open(WEB_DIR / 'county.json', 'w') as f:
        json.dump(county_data, f, indent=2)
    print(f"✓ Saved county.json")

    with open(WEB_DIR / 'trends.json', 'w') as f:
        json.dump(trends_data, f, indent=2)
    print(f"✓ Saved trends.json")

    # Create a combined metadata file
    # Derive version/note from the actual data so they never go stale.
    monthly_end = monthly_data['metadata']['endDate']  # e.g. '2025-05-01'
    data_version = monthly_end[:7]  # 'YYYY-MM'
    monthly_end_label = datetime.strptime(monthly_end, '%Y-%m-%d').strftime('%B %Y')
    county_end = county_data.get('asOfDate')
    if county_end:
        county_end_label = datetime.strptime(county_end, '%Y-%m-%d').strftime('%B %Y')
        note = (f'Monthly statewide data current through {monthly_end_label}. '
                f'County bi-annual data current through {county_end_label}.')
    else:
        note = f'Monthly statewide data current through {monthly_end_label}.'
    # Pull full provenance from the committed manifest so the dashboard's
    # metadata records exactly where each dataset came from (publisher,
    # source file/revision, "data as of" date, when it was downloaded).
    sources_path = DATA_DIR / 'SOURCES.json'
    try:
        provenance = json.loads(sources_path.read_text())
        provenance.pop('_comment', None)
    except (FileNotFoundError, ValueError):
        provenance = {}

    metadata = {
        'generated': datetime.now().isoformat(),
        'dataVersion': data_version,
        'note': note,
        'repository': 'https://github.com/supersistence/Hawaii-SNAP',
        'provenance': provenance,
        'summary': monthly_data['metadata']
    }

    with open(WEB_DIR / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✓ Saved metadata.json")

    print("\n" + "="*60)
    print("JSON data generation complete!")
    print("="*60)
    print(f"\nFiles created in: {WEB_DIR}")
    print("\nKey statistics:")
    print(f"  Latest participation: {monthly_data['metadata']['latestPersons']:,} persons")
    print(f"  Latest households: {monthly_data['metadata']['latestHouseholds']:,}")
    print(f"  Date range: {monthly_data['metadata']['startDate']} to {monthly_data['metadata']['endDate']}")
    print(f"  Total counties: {len(county_data['counties'])}")

    run_validation_gate()


def run_validation_gate():
    """Run data validation as an automatic gate after every regeneration.

    Previously validate_data.py was a separate manual step, so the corrupt
    Feb-2019 row was never flagged. Running it here means every refresh of the
    web JSON surfaces outliers/anomalies in the source CSVs. Non-fatal by
    design (warnings, not a hard stop) so a known artifact doesn't block a
    legitimate update — but it's now impossible to regenerate silently.
    """
    try:
        from validate_data import validate_monthly_data, validate_county_data
    except ImportError:
        print("\n(validate_data.py not importable — skipping validation gate)")
        return
    print("\n" + "=" * 60)
    print("VALIDATION GATE")
    print("=" * 60)
    for label, fn, path in [
        ("Monthly", validate_monthly_data, DATA_DIR / "Statewide Monthly SNAP FY 89-25.csv"),
        ("County",  validate_county_data,  DATA_DIR / "County Bi-Annual SNAP 89-25.csv"),
    ]:
        report = fn(str(path))
        flagged = [ln for ln in report.splitlines()
                   if "outlier" in ln.lower() or "level shift" in ln.lower()]
        if flagged:
            print(f"\n⚠ {label}: {len(flagged)} time-series anomalies — review:")
            for ln in flagged:
                print(f"   {ln.strip()}")
        else:
            print(f"✓ {label}: no time-series anomalies")


if __name__ == "__main__":
    main()
