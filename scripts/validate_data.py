#!/usr/bin/env python3
"""
Hawaii SNAP Data Validation Script
===================================

Validates data quality and identifies issues in SNAP datasets.

Usage:
    python validate_data.py --all
    python validate_data.py --file "Data/Statewide Monthly SNAP FY 89-22.csv"
"""

import argparse
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "Data"


class DataValidator:
    """Validates SNAP data quality."""

    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.df = None
        self.issues = []
        self.warnings = []
        self.info = []

    def load_data(self):
        """Load CSV data."""
        try:
            self.df = pd.read_csv(self.file_path)
            self.info.append(f"✓ Loaded {len(self.df):,} records from {self.file_path.name}")
            return True
        except Exception as e:
            self.issues.append(f"✗ Failed to load file: {e}")
            return False

    def validate_columns(self, expected_columns=None):
        """Validate expected columns exist."""
        if expected_columns:
            missing = set(expected_columns) - set(self.df.columns)
            if missing:
                self.issues.append(f"✗ Missing columns: {missing}")
            else:
                self.info.append(f"✓ All expected columns present")

        # Check for completely empty columns
        empty_cols = [col for col in self.df.columns if self.df[col].isna().all()]
        if empty_cols:
            self.warnings.append(f"⚠ Empty columns: {empty_cols}")

    def validate_dates(self, date_column='Date'):
        """Validate date column."""
        if date_column not in self.df.columns:
            self.issues.append(f"✗ Date column '{date_column}' not found")
            return

        try:
            self.df[date_column] = pd.to_datetime(self.df[date_column], errors='coerce')
            invalid_dates = self.df[date_column].isna().sum()

            if invalid_dates > 0:
                self.warnings.append(f"⚠ {invalid_dates} invalid dates")
            else:
                self.info.append(f"✓ All dates valid")

            # Date range
            min_date = self.df[date_column].min()
            max_date = self.df[date_column].max()
            self.info.append(f"  Date range: {min_date} to {max_date}")

            # Check for gaps
            self.df_sorted = self.df.sort_values(date_column)
            date_diffs = self.df_sorted[date_column].diff()

            # For monthly data, expect ~30 day gaps
            large_gaps = date_diffs[date_diffs > pd.Timedelta(days=60)]
            if len(large_gaps) > 0:
                self.warnings.append(f"⚠ Found {len(large_gaps)} gaps > 60 days")

            # Check for duplicates
            dups = self.df[date_column].duplicated().sum()
            if dups > 0:
                self.warnings.append(f"⚠ {dups} duplicate dates")

        except Exception as e:
            self.issues.append(f"✗ Date validation error: {e}")

    def validate_numeric_columns(self, numeric_columns=None):
        """Validate numeric data columns."""
        if numeric_columns is None:
            # Auto-detect numeric columns
            numeric_columns = self.df.select_dtypes(include=[np.number]).columns.tolist()

        for col in numeric_columns:
            if col not in self.df.columns:
                continue

            # Check for negative values (generally invalid for counts/amounts)
            negatives = (self.df[col] < 0).sum()
            if negatives > 0:
                self.warnings.append(f"⚠ {col}: {negatives} negative values")

            # Check for zeros (might be valid or might indicate missing data)
            zeros = (self.df[col] == 0).sum()
            if zeros > len(self.df) * 0.1:  # More than 10% zeros
                self.warnings.append(f"⚠ {col}: {zeros} zero values ({zeros/len(self.df)*100:.1f}%)")

            # Check for NaN
            nans = self.df[col].isna().sum()
            if nans > 0:
                self.warnings.append(f"⚠ {col}: {nans} missing values ({nans/len(self.df)*100:.1f}%)")

            # Basic statistics
            if not self.df[col].isna().all():
                self.info.append(f"  {col}: min={self.df[col].min():,.0f}, max={self.df[col].max():,.0f}, mean={self.df[col].mean():,.0f}")

    def validate_coordinates(self, lat_col='Latitude', lon_col='Longitude', state='HI'):
        """Validate geographic coordinates."""
        if lat_col not in self.df.columns or lon_col not in self.df.columns:
            return

        # Hawaii coordinate bounds: 18°-23°N, 154°-161°W
        if state == 'HI':
            valid_lat = (self.df[lat_col] >= 18) & (self.df[lat_col] <= 23)
            valid_lon = (self.df[lon_col] >= -161) & (self.df[lon_col] <= -154)
            valid_coords = valid_lat & valid_lon

            invalid_count = (~valid_coords).sum()
            missing_count = (self.df[lat_col].isna() | self.df[lon_col].isna()).sum()

            if invalid_count > 0:
                self.warnings.append(f"⚠ {invalid_count} records with invalid Hawaii coordinates ({invalid_count/len(self.df)*100:.1f}%)")

            if missing_count > 0:
                self.warnings.append(f"⚠ {missing_count} records with missing coordinates ({missing_count/len(self.df)*100:.1f}%)")

            valid_count = valid_coords.sum()
            self.info.append(f"  Valid coordinates: {valid_count} ({valid_count/len(self.df)*100:.1f}%)")

    def validate_referential_integrity(self):
        """Validate relationships between columns."""
        # Check if calculated fields match (if they exist)
        # Example: Total = PA + Non-PA

        if 'Calc: SNAP Total PA and Non-PA People' in self.df.columns:
            if 'SNAP All Persons Public Assistance Participation' in self.df.columns and \
               'SNAP All Persons Non-Public Assistance Participation' in self.df.columns:

                calculated = (self.df['SNAP All Persons Public Assistance Participation'] +
                            self.df['SNAP All Persons Non-Public Assistance Participation'])
                stated = self.df['Calc: SNAP Total PA and Non-PA People']

                mismatches = (calculated != stated).sum()
                if mismatches > 0:
                    self.warnings.append(f"⚠ {mismatches} records where calculated total != stated total")
                else:
                    self.info.append(f"✓ Calculated totals match stated totals")

    def check_data_currency(self, date_column='Date'):
        """Check how current the data is."""
        if date_column not in self.df.columns:
            return

        try:
            latest_date = pd.to_datetime(self.df[date_column]).max()
            days_old = (datetime.now() - latest_date).days

            if days_old > 365:
                years_old = days_old / 365
                self.warnings.append(f"⚠ Data is {years_old:.1f} years out of date (latest: {latest_date.date()})")
            elif days_old > 90:
                self.warnings.append(f"⚠ Data is {days_old} days out of date (latest: {latest_date.date()})")
            else:
                self.info.append(f"✓ Data is current (latest: {latest_date.date()})")

        except Exception as e:
            self.warnings.append(f"⚠ Could not check data currency: {e}")

    def generate_report(self):
        """Generate validation report."""
        report = []
        report.append("=" * 70)
        report.append(f"VALIDATION REPORT: {self.file_path.name}")
        report.append("=" * 70)
        report.append("")

        # Summary
        total_issues = len(self.issues)
        total_warnings = len(self.warnings)

        if total_issues == 0 and total_warnings == 0:
            report.append("✓ DATA QUALITY: EXCELLENT")
        elif total_issues == 0:
            report.append(f"⚠ DATA QUALITY: GOOD ({total_warnings} warnings)")
        else:
            report.append(f"✗ DATA QUALITY: ISSUES FOUND ({total_issues} issues, {total_warnings} warnings)")

        report.append("")

        # Issues (critical)
        if self.issues:
            report.append("CRITICAL ISSUES:")
            report.append("-" * 70)
            for issue in self.issues:
                report.append(issue)
            report.append("")

        # Warnings
        if self.warnings:
            report.append("WARNINGS:")
            report.append("-" * 70)
            for warning in self.warnings:
                report.append(warning)
            report.append("")

        # Info
        if self.info:
            report.append("INFORMATION:")
            report.append("-" * 70)
            for info in self.info:
                report.append(info)
            report.append("")

        report.append("=" * 70)

        return "\n".join(report)


def validate_monthly_data(file_path):
    """Validate statewide monthly SNAP data."""
    validator = DataValidator(file_path)

    if not validator.load_data():
        return validator.generate_report()

    expected_columns = ['Date', 'Household', 'Persons', 'Per Household', 'Per Person', 'Cost']
    validator.validate_columns(expected_columns)
    validator.validate_dates('Date')
    validator.validate_numeric_columns(['Household', 'Persons', 'Per Household', 'Per Person', 'Cost'])
    validator.check_data_currency('Date')

    return validator.generate_report()


def validate_retailer_data(file_path):
    """Validate SNAP retailer historical data."""
    validator = DataValidator(file_path)

    if not validator.load_data():
        return validator.generate_report()

    validator.validate_columns()
    validator.validate_coordinates()
    validator.check_data_currency()

    # Check for store type distribution
    if 'Store Type' in validator.df.columns:
        type_counts = validator.df['Store Type'].value_counts()
        validator.info.append("\n  Store types:")
        for store_type, count in type_counts.head(10).items():
            validator.info.append(f"    {store_type}: {count:,}")

    return validator.generate_report()


def validate_county_data(file_path):
    """Validate county bi-annual SNAP data."""
    validator = DataValidator(file_path)

    if not validator.load_data():
        return validator.generate_report()

    validator.validate_columns()
    validator.validate_dates('Date')
    validator.validate_numeric_columns()
    validator.validate_referential_integrity()
    validator.check_data_currency('Date')

    # Check county coverage
    if 'County' in validator.df.columns:
        counties = validator.df['County'].unique()
        validator.info.append(f"\n  Counties: {', '.join(sorted(counties))}")
        if len(counties) != 4:
            validator.warnings.append(f"⚠ Expected 4 Hawaii counties, found {len(counties)}")

    return validator.generate_report()


def main():
    parser = argparse.ArgumentParser(description="Validate Hawaii SNAP data quality")
    parser.add_argument('--all', action='store_true', help='Validate all datasets')
    parser.add_argument('--file', type=str, help='Validate specific file')
    parser.add_argument('--output', type=str, help='Save report to file')

    args = parser.parse_args()

    reports = []

    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"✗ File not found: {file_path}")
            return

        # Determine validation type based on filename
        if 'Monthly' in file_path.name:
            report = validate_monthly_data(file_path)
        elif 'Retailer' in file_path.name:
            report = validate_retailer_data(file_path)
        elif 'County' in file_path.name:
            report = validate_county_data(file_path)
        else:
            # Generic validation
            validator = DataValidator(file_path)
            if validator.load_data():
                validator.validate_columns()
                validator.validate_dates()
                validator.validate_numeric_columns()
                report = validator.generate_report()
            else:
                report = validator.generate_report()

        reports.append(report)

    elif args.all:
        # Validate all known datasets
        datasets = [
            ("Statewide Monthly SNAP FY 89-22.csv", validate_monthly_data),
            ("Statewide SNAP Retailers Historical- FNS.csv", validate_retailer_data),
            ("County Bi-Annual SNAP 89-21.csv", validate_county_data),
        ]

        for filename, validate_func in datasets:
            file_path = DATA_DIR / filename
            if file_path.exists():
                report = validate_func(file_path)
                reports.append(report)
            else:
                reports.append(f"\n✗ File not found: {filename}\n")

    else:
        parser.print_help()
        return

    # Print all reports
    full_report = "\n\n".join(reports)
    print(full_report)

    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            f.write(full_report)
        print(f"\n✓ Report saved to: {args.output}")


if __name__ == "__main__":
    main()
