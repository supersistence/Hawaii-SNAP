#!/usr/bin/env python3
"""
Hawaii SNAP Data Download and Update Script
============================================

This script automates the download and processing of updated SNAP data for Hawaii.

Usage:
    python download_and_update.py --all
    python download_and_update.py --monthly
    python download_and_update.py --retailers
    python download_and_update.py --county

Requirements:
    pip install pandas openpyxl requests

Data Sources:
    1. Statewide Monthly Data: USDA FNS SNAP Data Tables
    2. Historical Retailer Data: USDA FNS Retailer Historical Data
    3. County Bi-Annual Data: USDA FNS SNAP Data Tables
    4. State Application Data: Hawaii DHS
"""

import argparse
import os
import sys
import zipfile
from pathlib import Path
from datetime import datetime
import requests
import pandas as pd

# Configuration
DATA_DIR = Path(__file__).parent.parent / "Data"
BACKUP_DIR = DATA_DIR / "backups"

# Data source URLs
URLS = {
    "monthly": "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
    "retailers": "https://www.fns.usda.gov/snap/retailer/historical-data",
    "county": "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
    "hawaii_dhs": "https://humanservices.hawaii.gov/communications/"
}

# Expected file names
FILES = {
    "monthly": "Statewide Monthly SNAP FY 89-22.csv",
    "retailers": "Statewide SNAP Retailers Historical- FNS.csv",
    "county": "County Bi-Annual SNAP 89-21.csv",
    "applications": "County Weekly Applications 4:2020-3:2022.csv"
}


def backup_existing_data(file_path):
    """Create a timestamped backup of existing data file."""
    if not file_path.exists():
        print(f"No existing file to backup: {file_path}")
        return

    BACKUP_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
    backup_path = BACKUP_DIR / backup_name

    import shutil
    shutil.copy2(file_path, backup_path)
    print(f"✓ Backed up to: {backup_path}")


def download_file(url, destination):
    """Download a file from URL to destination."""
    print(f"Downloading from: {url}")
    print(f"Saving to: {destination}")

    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        destination.parent.mkdir(parents=True, exist_ok=True)

        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"✓ Downloaded: {destination.name} ({destination.stat().st_size / 1024:.1f} KB)")
        return True

    except requests.exceptions.RequestException as e:
        print(f"✗ Download failed: {e}")
        return False


def update_monthly_data():
    """
    Update statewide monthly SNAP data.

    Current: FY89 - January 2022
    Target: FY89 - May 2025
    """
    print("\n" + "="*60)
    print("UPDATING STATEWIDE MONTHLY SNAP DATA")
    print("="*60)

    file_path = DATA_DIR / FILES["monthly"]

    # Backup existing data
    backup_existing_data(file_path)

    # Instructions for manual download
    print("\nMANUAL DOWNLOAD REQUIRED:")
    print("1. Visit: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap")
    print("2. Look for 'National and/or State Level Monthly and/or Annual Data'")
    print("3. Download the ZIP file containing data through May 2025")
    print("4. Extract and locate the Hawaii state data")
    print("5. Save the file to: downloads/snap_monthly_update.xlsx")
    print("\nPress Enter when download is complete, or 'skip' to skip...")

    response = input().strip().lower()
    if response == 'skip':
        print("Skipping monthly data update")
        return

    # Process downloaded file
    download_path = Path("downloads/snap_monthly_update.xlsx")
    if not download_path.exists():
        print(f"✗ File not found: {download_path}")
        print("  Please download the file and try again")
        return

    try:
        # Read existing data
        existing_df = pd.read_csv(file_path)
        existing_df['Date'] = pd.to_datetime(existing_df['Date'])
        print(f"✓ Loaded existing data: {len(existing_df)} records")
        print(f"  Date range: {existing_df['Date'].min()} to {existing_df['Date'].max()}")

        # Read new data (implementation depends on actual file structure)
        print("\n⚠ Reading new data - structure may vary")
        print("  You may need to adjust column mappings")

        new_df = pd.read_excel(download_path)
        print(f"✓ Loaded new data: {len(new_df)} records")

        # Filter for Hawaii
        if 'State' in new_df.columns:
            new_df = new_df[new_df['State'] == 'HI']
            print(f"✓ Filtered for Hawaii: {len(new_df)} records")

        # Standardize column names (adjust as needed)
        column_mapping = {
            # Map new column names to existing column names
            # Example: 'Households Participating': 'Household'
        }
        if column_mapping:
            new_df = new_df.rename(columns=column_mapping)

        # Get only new records (after last existing date)
        last_date = existing_df['Date'].max()
        new_df['Date'] = pd.to_datetime(new_df['Date'])
        new_records = new_df[new_df['Date'] > last_date]

        if len(new_records) == 0:
            print("✓ No new records to add (data is up to date)")
            return

        print(f"✓ Found {len(new_records)} new records")
        print(f"  New date range: {new_records['Date'].min()} to {new_records['Date'].max()}")

        # Merge and save
        updated_df = pd.concat([existing_df, new_records], ignore_index=True)
        updated_df = updated_df.sort_values('Date')

        # Update filename to reflect new date range
        new_filename = f"Statewide Monthly SNAP FY 89-25.csv"
        new_file_path = DATA_DIR / new_filename

        updated_df.to_csv(new_file_path, index=False)
        print(f"✓ Saved updated data: {new_file_path}")
        print(f"  Total records: {len(updated_df)}")
        print(f"  Date range: {updated_df['Date'].min()} to {updated_df['Date'].max()}")

        # Keep old file for reference if different name
        if new_filename != FILES["monthly"]:
            print(f"\n⚠ Note: Created new file with updated name")
            print(f"  Old file still exists: {FILES['monthly']}")
            print(f"  New file: {new_filename}")

    except Exception as e:
        print(f"✗ Error processing data: {e}")
        import traceback
        traceback.print_exc()


def update_retailer_data():
    """
    Update historical SNAP retailer data.

    Current: 1990-2021
    Target: 1990 - December 31, 2024
    """
    print("\n" + "="*60)
    print("UPDATING SNAP RETAILER HISTORICAL DATA")
    print("="*60)

    file_path = DATA_DIR / FILES["retailers"]
    backup_existing_data(file_path)

    print("\nMANUAL DOWNLOAD REQUIRED:")
    print("1. Visit: https://www.fns.usda.gov/snap/retailer/historical-data")
    print("2. Download the zipped CSV file (current as of Dec 31, 2024)")
    print("3. Extract the CSV file")
    print("4. Save to: downloads/snap_retailers_historical.csv")
    print("\nPress Enter when download is complete, or 'skip' to skip...")

    response = input().strip().lower()
    if response == 'skip':
        print("Skipping retailer data update")
        return

    download_path = Path("downloads/snap_retailers_historical.csv")
    if not download_path.exists():
        print(f"✗ File not found: {download_path}")
        return

    try:
        # Read new retailer data
        print("Loading retailer data...")
        df = pd.read_csv(download_path, low_memory=False)
        print(f"✓ Loaded: {len(df)} total records")

        # Filter for Hawaii
        if 'State' in df.columns:
            hi_df = df[df['State'] == 'HI'].copy()
        elif 'store_state' in df.columns:
            hi_df = df[df['store_state'] == 'HI'].copy()
        else:
            print("✗ Cannot find State column")
            print(f"  Available columns: {df.columns.tolist()}")
            return

        print(f"✓ Filtered for Hawaii: {len(hi_df)} records")

        # Clean geolocation data (known issue: ~39% bad coordinates)
        if 'Latitude' in hi_df.columns and 'Longitude' in hi_df.columns:
            # Hawaii coordinates: roughly 18°-23°N, 154°-161°W
            bad_coords = (
                (hi_df['Latitude'] < 18) | (hi_df['Latitude'] > 23) |
                (hi_df['Longitude'] < -161) | (hi_df['Longitude'] > -154)
            )
            print(f"⚠ Found {bad_coords.sum()} records with invalid Hawaii coordinates ({bad_coords.sum()/len(hi_df)*100:.1f}%)")

            # Flag bad coordinates
            hi_df['Valid_Coords'] = ~bad_coords

        # Save updated data
        new_filename = "Statewide SNAP Retailers Historical- FNS 2024.csv"
        new_file_path = DATA_DIR / new_filename

        hi_df.to_csv(new_file_path, index=False)
        print(f"✓ Saved: {new_file_path}")
        print(f"  Total records: {len(hi_df)}")
        if 'Valid_Coords' in hi_df.columns:
            print(f"  Valid coordinates: {hi_df['Valid_Coords'].sum()} ({hi_df['Valid_Coords'].sum()/len(hi_df)*100:.1f}%)")

        # Summary statistics
        if 'Authorization Date' in hi_df.columns or 'auth_date' in hi_df.columns:
            date_col = 'Authorization Date' if 'Authorization Date' in hi_df.columns else 'auth_date'
            hi_df[date_col] = pd.to_datetime(hi_df[date_col], errors='coerce')
            print(f"  Authorization dates: {hi_df[date_col].min()} to {hi_df[date_col].max()}")

        if 'Store Type' in hi_df.columns or 'store_type' in hi_df.columns:
            type_col = 'Store Type' if 'Store Type' in hi_df.columns else 'store_type'
            print(f"\n  Store types:")
            for store_type, count in hi_df[type_col].value_counts().head(10).items():
                print(f"    {store_type}: {count}")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


def update_county_data():
    """
    Update county bi-annual SNAP data.

    Current: FY89 - July 2020 (README claims Jan 2021 but file shows July 2020)
    Target: FY89 - latest available
    """
    print("\n" + "="*60)
    print("UPDATING COUNTY BI-ANNUAL SNAP DATA")
    print("="*60)

    file_path = DATA_DIR / FILES["county"]
    backup_existing_data(file_path)

    # Check current data
    try:
        existing_df = pd.read_csv(file_path)
        existing_df['Date'] = pd.to_datetime(existing_df['Date'])
        print(f"Current data: {existing_df['Date'].min()} to {existing_df['Date'].max()}")
        print(f"Records: {len(existing_df)}")
    except Exception as e:
        print(f"Error reading existing data: {e}")

    print("\nMANUAL DOWNLOAD REQUIRED:")
    print("1. Visit: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap")
    print("2. Look for 'Bi-Annual (January and July) State Project Area/County Level'")
    print("3. Download the data file")
    print("4. Extract and save to: downloads/snap_county_biannual.xlsx")
    print("\nPress Enter when download is complete, or 'skip' to skip...")

    response = input().strip().lower()
    if response == 'skip':
        print("Skipping county data update")
        return

    # Processing would follow similar pattern to monthly data
    print("⚠ County data update not yet fully implemented")
    print("  Please review downloaded file structure and update this function")


def generate_summary_report(output_path=None):
    """Generate a summary report of all datasets."""
    if output_path is None:
        output_path = DATA_DIR.parent / "DATA_STATUS_REPORT.md"

    print("\n" + "="*60)
    print("GENERATING DATA STATUS REPORT")
    print("="*60)

    report = ["# Hawaii SNAP Data Status Report"]
    report.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")

    # Check each dataset
    for key, filename in FILES.items():
        report.append(f"\n## {key.replace('_', ' ').title()}")
        file_path = DATA_DIR / filename

        if not file_path.exists():
            report.append(f"\n⚠️ **Status:** File not found")
            report.append(f"\n- Expected path: `{file_path}`")
            continue

        try:
            df = pd.read_csv(file_path)
            report.append(f"\n✓ **Status:** Found")
            report.append(f"\n- **Records:** {len(df):,}")
            report.append(f"\n- **File size:** {file_path.stat().st_size / 1024:.1f} KB")
            report.append(f"\n- **Last modified:** {datetime.fromtimestamp(file_path.stat().st_mtime).strftime('%Y-%m-%d')}")

            # Date range
            date_columns = [col for col in df.columns if 'date' in col.lower()]
            if date_columns:
                date_col = date_columns[0]
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                report.append(f"\n- **Date range:** {df[date_col].min()} to {df[date_col].max()}")

            # Column info
            report.append(f"\n- **Columns:** {', '.join(df.columns.tolist())}")

        except Exception as e:
            report.append(f"\n⚠️ **Status:** Error reading file")
            report.append(f"\n- Error: {str(e)}")

    report_text = "\n".join(report)

    with open(output_path, 'w') as f:
        f.write(report_text)

    print(f"✓ Report saved: {output_path}")
    print("\n" + report_text)


def main():
    parser = argparse.ArgumentParser(
        description="Download and update Hawaii SNAP data",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('--monthly', action='store_true', help='Update statewide monthly data')
    parser.add_argument('--retailers', action='store_true', help='Update retailer historical data')
    parser.add_argument('--county', action='store_true', help='Update county bi-annual data')
    parser.add_argument('--all', action='store_true', help='Update all datasets')
    parser.add_argument('--report', action='store_true', help='Generate status report only')

    args = parser.parse_args()

    if args.report:
        generate_summary_report()
        return

    if not any([args.monthly, args.retailers, args.county, args.all]):
        parser.print_help()
        print("\n" + "="*60)
        print("QUICK START:")
        print("="*60)
        print("1. Run with --report to see current data status")
        print("2. Run with --all to update all datasets")
        print("3. Follow manual download instructions for each dataset")
        print("\nExample: python download_and_update.py --all")
        return

    # Create necessary directories
    DATA_DIR.mkdir(exist_ok=True)
    BACKUP_DIR.mkdir(exist_ok=True)
    Path("downloads").mkdir(exist_ok=True)

    print("\n" + "="*60)
    print("HAWAII SNAP DATA UPDATE UTILITY")
    print("="*60)
    print(f"Data directory: {DATA_DIR.absolute()}")
    print(f"Backup directory: {BACKUP_DIR.absolute()}\n")

    # Update datasets
    if args.all or args.monthly:
        update_monthly_data()

    if args.all or args.retailers:
        update_retailer_data()

    if args.all or args.county:
        update_county_data()

    # Generate final report
    print("\n" + "="*60)
    generate_summary_report()

    print("\n" + "="*60)
    print("UPDATE COMPLETE")
    print("="*60)
    print("\nNext steps:")
    print("1. Review the DATA_STATUS_REPORT.md file")
    print("2. Update README.md with new date ranges")
    print("3. Update Tableau visualizations")
    print("4. Commit changes to git")


if __name__ == "__main__":
    main()
