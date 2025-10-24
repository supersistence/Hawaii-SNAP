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

def process_monthly_data():
    """Process statewide monthly data for web charts."""
    print("Processing monthly data...")

    df = pd.read_csv(DATA_DIR / "Statewide Monthly SNAP FY 89-25.csv")
    df['Date'] = pd.to_datetime(df['Date'])

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
            'latestTotalCost': int(df.iloc[-1]['Cost'])
        }
    }

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

    df = pd.read_csv(DATA_DIR / "County Bi-Annual SNAP 89-21.csv")
    df['Date'] = pd.to_datetime(df['Date'])

    # Get latest data for each county
    latest_date = df['Date'].max()
    latest = df[df['Date'] == latest_date].copy()

    data = {
        'asOfDate': latest_date.strftime('%Y-%m-%d'),
        'counties': []
    }

    for _, row in latest.iterrows():
        data['counties'].append({
            'name': row['County'],
            'fips': row['FIPS'],
            'persons': {
                'publicAssistance': int(row['SNAP All Persons Public Assistance Participation']),
                'nonPublicAssistance': int(row['SNAP All Persons Non-Public Assistance Participation']),
                'total': int(row['Calc: SNAP Total PA and Non-PA People'])
            },
            'households': {
                'publicAssistance': int(row['SNAP All Households Public Assistance Participation']),
                'nonPublicAssistance': int(row['SNAP All Households Non-Public Assistance Participation']),
                'total': int(row['Calc: SNAP Total PA and Non-PA Households'])
            },
            'totalIssuance': int(row['SNAP All Total Actual PA & Non-PA Issuance'])
        })

    # Calculate totals
    data['stateTotal'] = {
        'persons': sum(c['persons']['total'] for c in data['counties']),
        'households': sum(c['households']['total'] for c in data['counties']),
        'totalIssuance': sum(c['totalIssuance'] for c in data['counties'])
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

    # Save to JSON files
    with open(WEB_DIR / 'monthly.json', 'w') as f:
        json.dump(monthly_data, f, indent=2)
    print(f"✓ Saved monthly.json")

    with open(WEB_DIR / 'county.json', 'w') as f:
        json.dump(county_data, f, indent=2)
    print(f"✓ Saved county.json")

    with open(WEB_DIR / 'trends.json', 'w') as f:
        json.dump(trends_data, f, indent=2)
    print(f"✓ Saved trends.json")

    # Create a combined metadata file
    metadata = {
        'generated': datetime.now().isoformat(),
        'dataVersion': '2022-01',
        'note': 'Data current through January 2022. Updated data available through May 2025.',
        'sources': {
            'monthly': 'USDA FNS SNAP Data Tables',
            'county': 'USDA FNS Bi-Annual County Data',
            'repository': 'https://github.com/supersistence/Hawaii-SNAP'
        },
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


if __name__ == "__main__":
    main()
