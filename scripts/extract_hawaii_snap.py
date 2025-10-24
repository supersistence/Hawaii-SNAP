#!/usr/bin/env python3
"""
Extract Hawaii SNAP monthly data from FY files (FY89-FY25)
Combines with existing data to create updated CSV
"""

import pandas as pd
import glob
import re
from datetime import datetime

def extract_hawaii_from_fy_file(file_path):
    """
    Extract Hawaii SNAP data from a single FY file
    Hawaii data appears AFTER a row labeled "Hawaii"
    """
    try:
        # Try WRO sheet first (Western Region Office contains Hawaii)
        try:
            df = pd.read_excel(file_path, sheet_name='WRO', header=None)
        except:
            # If WRO doesn't exist, try other sheets
            xls = pd.ExcelFile(file_path)
            df = None
            for sheet in xls.sheet_names:
                temp_df = pd.read_excel(file_path, sheet_name=sheet, header=None)
                # Check if Hawaii exists in this sheet
                hawaii_exists = temp_df.apply(lambda row: row.astype(str).str.contains('^Hawaii$', regex=True, case=False, na=False).any(), axis=1).any()
                if hawaii_exists:
                    df = temp_df
                    break

            if df is None:
                return None

        # Find the row with "Hawaii" label
        hawaii_mask = df.apply(lambda row: row.astype(str).str.contains('^Hawaii$', regex=True, case=False, na=False).any(), axis=1)

        if not hawaii_mask.any():
            return None

        hawaii_label_row = hawaii_mask.idxmax()

        # Data starts AFTER the Hawaii label
        # Find where Hawaii data ends (usually at next state name or empty rows)
        data_start = hawaii_label_row + 1

        # Collect Hawaii monthly data
        hawaii_records = []

        for idx in range(data_start, min(data_start + 20, len(df))):
            row = df.iloc[idx]

            # Stop if we hit another state name or empty row
            if pd.isna(row[0]):
                continue

            month_str = str(row[0]).strip()

            # Check if this looks like a month entry
            if re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}', month_str, re.IGNORECASE):
                # Extract data - but column order differs between old and new files!
                # Old files (.xls): Month, HH, Persons, PerHH, PerPerson, Cost
                # New files (.xlsx): Month, HH, Persons, Cost, PerHH, PerPerson
                # Detect which format by checking if col[3] is larger than col[4]
                try:
                    # If col[3] > col[4] significantly, it's likely Cost (new format)
                    # If col[4] > col[3], it's likely PerHH is in col[3] (old format)
                    col3_val = float(row[3]) if pd.notna(row[3]) else 0
                    col4_val = float(row[4]) if pd.notna(row[4]) else 0

                    # New format: Cost is typically in millions, PerHH is hundreds
                    if col3_val > 10000:  # Cost is > $10k, so this is new format
                        record = {
                            'Month': month_str,
                            'Household': row[1],
                            'Persons': row[2],
                            'Cost': row[3],
                            'Per Household': row[4],
                            'Per Person': row[5]
                        }
                    else:  # Old format
                        record = {
                            'Month': month_str,
                            'Household': row[1],
                            'Persons': row[2],
                            'Per Household': row[3],
                            'Per Person': row[4],
                            'Cost': row[5]
                        }
                    hawaii_records.append(record)
                except:
                    pass
            elif re.search(r'^[A-Z][a-z]+$', month_str) and month_str not in ['Hawaii', 'Total']:
                # Hit another state, stop
                break

        return hawaii_records if hawaii_records else None

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def parse_month_to_date(month_str):
    """Convert 'Oct 2023' to '2023-10-01' format"""
    try:
        # Handle various formats
        month_str = month_str.strip()

        # Try parsing "Oct 2023" or "October 2023" format
        for fmt in ['%b %Y', '%B %Y']:
            try:
                date_obj = datetime.strptime(month_str, fmt)
                return date_obj.strftime('%Y-%m-01')
            except:
                continue

        return None
    except:
        return None

def main():
    print("="*80)
    print("Hawaii SNAP Monthly Data Extraction")
    print("="*80)

    data_dir = 'Data/snap-zip-fy69tocurrent-8'

    # Get all FY files (both .xls and .xlsx)
    xls_files = sorted(glob.glob(f'{data_dir}/FY*.xls'))
    xlsx_files = sorted(glob.glob(f'{data_dir}/FY*.xlsx'))

    # Combine and sort (xls are older, xlsx are newer)
    all_files = xls_files + xlsx_files

    print(f"\nFound {len(all_files)} fiscal year files")
    print(f"  From: {all_files[0].split('/')[-1] if all_files else 'None'}")
    print(f"    To: {all_files[-1].split('/')[-1] if all_files else 'None'}\n")

    all_hawaii_records = []

    for file_path in all_files:
        file_name = file_path.split('/')[-1]
        print(f"Processing {file_name}...", end=' ')

        records = extract_hawaii_from_fy_file(file_path)

        if records:
            print(f"✓ Found {len(records)} months")
            all_hawaii_records.extend(records)
        else:
            print("✗ No data found")

    print(f"\n{'='*80}")
    print(f"Total records extracted: {len(all_hawaii_records)}")

    if all_hawaii_records:
        # Convert to DataFrame
        df = pd.DataFrame(all_hawaii_records)

        # Parse dates
        df['Date'] = df['Month'].apply(parse_month_to_date)

        # Remove rows where date parsing failed
        df = df[df['Date'].notna()]

        # Sort by date
        df = df.sort_values('Date')

        # Reorder columns to match existing CSV format
        df = df[['Date', 'Household', 'Persons', 'Per Household', 'Per Person', 'Cost']]

        # Save the extracted data
        output_file = 'Data/hawaii_snap_extracted_fy89-fy25.csv'
        df.to_csv(output_file, index=False)

        print(f"Data saved to: {output_file}")
        print(f"\nDate range: {df['Date'].min()} to {df['Date'].max()}")
        print(f"Total months: {len(df)}")
        print(f"\nSample of extracted data:")
        print(df.head(10))
        print("...")
        print(df.tail(10))

    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()
