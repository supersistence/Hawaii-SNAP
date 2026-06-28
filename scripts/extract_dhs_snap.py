#!/usr/bin/env python3
"""
Extract Hawaii DHS SNAP data (monthly, by island/branch) into tidy CSVs.

Two ongoing DHS series, published on https://humanservices.hawaii.gov/bessd/snap/:
  - Participation Summary (SFY) -> participants/households/benefits by island
  - Application Timeliness (FFY) -> applications received + on-time disposition rates

These are richer than the USDA monthly series (island-level, program breakdown)
and more current. This module parses the machine-readable .xls/.xlsx releases.
PDF-era releases (roughly SFY/FFY 2016-2024) are not handled here.

Usage:
    python scripts/extract_dhs_snap.py PARTICIPATION.xlsx TIMELINESS.xlsx
"""

import re
import sys
from pathlib import Path

import openpyxl
import pandas as pd

MONTHS = {m: i for i, m in enumerate(
    ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
     'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], start=1)}
MONTH_NAMES = {'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5,
               'JUNE': 6, 'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9,
               'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12}
ISLANDS = {'Oahu Branch', 'Hawaii Branch', 'Kauai Branch', 'Maui Island',
           'Molokai Island', 'Lanai Island', 'Maui Branch', 'STATE'}
# Section 1 table titles -> output metric name
PART_TABLES = {
    'Number of Participants Receiving SNAP Benefits': 'Participants',
    'Number of Households Receiving SNAP Benefits': 'Households',
    'SNAP Benefits Issued': 'BenefitsIssued',
}


def _sheet_date(sheet_name):
    """'JUL 2025' -> '2025-07-01' (else None)."""
    m = re.match(r'([A-Za-z]{3})\s+(\d{4})', sheet_name.strip())
    if m and m.group(1).upper() in MONTHS:
        return f"{m.group(2)}-{MONTHS[m.group(1).upper()]:02d}-01"
    return None


def extract_participation(path):
    """Tidy monthly by-island participation records from a Participation .xlsx."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    out = []
    for sheet in wb.sheetnames:
        date = _sheet_date(sheet)
        if not date:
            continue  # Title Page / Summary
        rows = list(wb[sheet].iter_rows(values_only=True))
        # collect each island's value per metric
        by_island = {}
        metric = None
        for r in rows:
            c0 = (str(r[0]).strip() if r and r[0] is not None else '')
            # Sections 2/3 repeat the island rows with a different 7-column
            # layout (no TOTAL); stop so they don't clobber Section 1 values.
            if c0.startswith('Section 2'):
                break
            matched = next((v for k, v in PART_TABLES.items() if c0.startswith(k)), None)
            if matched:
                metric = matched
                continue
            if metric and c0 in ISLANDS:
                total = r[7] if len(r) > 7 else None        # TOTAL column
                snap_only = r[6] if len(r) > 6 else None     # SNAP ONLY column
                rec = by_island.setdefault(c0, {})
                rec[metric] = total
                if metric == 'Participants':
                    rec['ParticipantsSNAPOnly'] = snap_only
        # a fully-zero STATE row means the month isn't reported yet
        state = by_island.get('STATE', {})
        if not state or not state.get('Participants'):
            continue
        for island, vals in by_island.items():
            out.append({
                'Date': date, 'Island': island,
                'Participants': vals.get('Participants'),
                'Households': vals.get('Households'),
                'BenefitsIssued': vals.get('BenefitsIssued'),
                'ParticipantsSNAPOnly': vals.get('ParticipantsSNAPOnly'),
            })
    return out


def extract_timeliness(path):
    """Tidy monthly statewide application-timeliness records from a Timeliness file."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    out = []
    for sheet in wb.sheetnames:
        m = re.search(r'FFY\s*(\d{4})', sheet)
        if not m:
            continue
        ffy = int(m.group(1))
        in_table1 = False
        for r in wb[sheet].iter_rows(values_only=True):
            c0 = (str(r[0]).strip() if r and r[0] is not None else '')
            if c0.startswith('Table 1'):
                in_table1 = True
                continue
            if c0.startswith('Table 2'):
                in_table1 = False
                continue
            if not in_table1:
                continue
            mon = MONTH_NAMES.get(c0.upper())
            if not mon:
                continue
            received = r[1] if len(r) > 1 else None
            if not received:  # unreported future month
                continue
            # FFY N runs Oct (N-1) .. Sep (N)
            year = ffy - 1 if mon >= 10 else ffy
            out.append({
                'Date': f"{year}-{mon:02d}-01",
                'ApplicationsReceived': received,
                'TotalDispositions': r[2] if len(r) > 2 else None,
                'TimelyDispositions': r[3] if len(r) > 3 else None,
                'PercentTimely': r[4] if len(r) > 4 else None,
            })
    return out


def main():
    if len(sys.argv) < 3:
        print("Usage: extract_dhs_snap.py PARTICIPATION.xlsx TIMELINESS.xlsx")
        sys.exit(1)
    data_dir = Path(__file__).parent.parent / "Data"

    part = pd.DataFrame(extract_participation(sys.argv[1])).sort_values(['Date', 'Island'])
    part_path = data_dir / "dhs_snap_participation_by_island.csv"
    part.to_csv(part_path, index=False)
    print(f"✓ {part_path.name}: {len(part)} rows, "
          f"{part['Date'].min()}..{part['Date'].max()}")

    tl = pd.DataFrame(extract_timeliness(sys.argv[2])).sort_values('Date')
    tl_path = data_dir / "dhs_snap_application_timeliness.csv"
    tl.to_csv(tl_path, index=False)
    print(f"✓ {tl_path.name}: {len(tl)} rows, {tl['Date'].min()}..{tl['Date'].max()}")


if __name__ == "__main__":
    main()
