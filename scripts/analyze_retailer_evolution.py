#!/usr/bin/env python3
"""
Retailer Network Evolution Analysis for Hawaii SNAP
Analyzes changes in SNAP retailer network from 2020-2024
Focus on pandemic impact on food access infrastructure
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

# Load retailer data
df = pd.read_csv('Data/hawaii_snap_retailers_2004-2024_all.csv', encoding='latin-1', low_memory=False)

# Parse dates
df['Authorization Date'] = pd.to_datetime(df['Authorization Date'], errors='coerce')
df['End Date'] = pd.to_datetime(df['End Date'], errors='coerce')

# Add year columns
df['Auth_Year'] = df['Authorization Date'].dt.year
df['End_Year'] = df['End Date'].dt.year

print("="*80)
print("RETAILER NETWORK EVOLUTION ANALYSIS: Hawaii SNAP (2020-2024)")
print("="*80)
print()

# === FOCUS PERIOD: 2020-2024 ===
focus_period = df[(df['Auth_Year'] >= 2020) & (df['Auth_Year'] <= 2024)]

print("NEW RETAILER AUTHORIZATIONS (2020-2024)")
print("-"*80)

# Authorizations by year
auth_by_year = focus_period.groupby('Auth_Year').size()
print("\nAuthorizations by Year:")
for year, count in auth_by_year.items():
    print(f"  {int(year)}: {count:>3} new retailers")

print(f"\nTotal new authorizations 2020-2024: {len(focus_period)}")

# === STORE TYPE ANALYSIS ===
print("\n" + "="*80)
print("STORE TYPE DISTRIBUTION - NEW AUTHORIZATIONS (2020-2024)")
print("-"*80)

store_types_new = focus_period['Store Type'].value_counts()
print("\nTop 10 Store Types (New Authorizations):")
for i, (store_type, count) in enumerate(store_types_new.head(10).items(), 1):
    pct = (count / len(focus_period)) * 100
    print(f"{i:>2}. {store_type:<40} {count:>3} ({pct:>5.1f}%)")

# === COUNTY DISTRIBUTION ===
print("\n" + "="*80)
print("GEOGRAPHIC DISTRIBUTION - NEW AUTHORIZATIONS (2020-2024)")
print("-"*80)

county_dist = focus_period['County'].value_counts()
print("\nNew Retailers by County:")
for county, count in county_dist.items():
    pct = (count / len(focus_period)) * 100
    print(f"  {county:<15} {count:>3} ({pct:>5.1f}%)")

# === ACTIVE STORES ANALYSIS ===
print("\n" + "="*80)
print("CURRENTLY ACTIVE RETAILERS (as of Dec 2024)")
print("-"*80)

active_stores = df[df['End Date'].isna()]
print(f"\nTotal active retailers: {len(active_stores)}")

# Active by county
active_by_county = active_stores['County'].value_counts()
print("\nActive Retailers by County:")
for county, count in active_by_county.items():
    pct = (count / len(active_stores)) * 100
    print(f"  {county:<15} {count:>3} ({pct:>5.1f}%)")

# Active by store type
active_by_type = active_stores['Store Type'].value_counts()
print("\nTop 10 Active Store Types:")
for i, (store_type, count) in enumerate(active_by_type.head(10).items(), 1):
    pct = (count / len(active_stores)) * 100
    print(f"{i:>2}. {store_type:<40} {count:>3} ({pct:>5.1f}%)")

# === DEAUTHORIZATIONS ===
print("\n" + "="*80)
print("DEAUTHORIZATIONS (2020-2024)")
print("-"*80)

deauth_period = df[(df['End_Year'] >= 2020) & (df['End_Year'] <= 2024)]
print(f"\nTotal deauthorizations 2020-2024: {len(deauth_period)}")

deauth_by_year = deauth_period.groupby('End_Year').size()
print("\nDeauthorizations by Year:")
for year, count in deauth_by_year.items():
    print(f"  {int(year)}: {count:>3} retailers closed")

# === NET CHANGE ===
print("\n" + "="*80)
print("NET CHANGE IN RETAILER NETWORK (2020-2024)")
print("-"*80)

net_change = len(focus_period) - len(deauth_period)
print(f"\nNew Authorizations: {len(focus_period)}")
print(f"Deauthorizations: {len(deauth_period)}")
print(f"Net Change: +{net_change} retailers")

# === STORE TYPE EVOLUTION ===
print("\n" + "="*80)
print("STORE TYPE EVOLUTION - COMPARING PERIODS")
print("-"*80)

# Pre-pandemic active (authorized before 2020, still active)
pre_pandemic_active = active_stores[active_stores['Auth_Year'] < 2020]

# Pandemic-era active (authorized 2020+, still active)
pandemic_era_active = active_stores[active_stores['Auth_Year'] >= 2020]

print(f"\nPre-2020 Authorizations (still active): {len(pre_pandemic_active)}")
print(f"2020-2024 Authorizations (still active): {len(pandemic_era_active)}")

# Compare top store types
print("\nTop 5 Store Types - Pre-2020 Active:")
for i, (store_type, count) in enumerate(pre_pandemic_active['Store Type'].value_counts().head(5).items(), 1):
    pct = (count / len(pre_pandemic_active)) * 100
    print(f"{i}. {store_type:<35} {count:>3} ({pct:>5.1f}%)")

print("\nTop 5 Store Types - 2020-2024 Active:")
for i, (store_type, count) in enumerate(pandemic_era_active['Store Type'].value_counts().head(5).items(), 1):
    pct = (count / len(pandemic_era_active)) * 100
    print(f"{i}. {store_type:<35} {count:>3} ({pct:>5.1f}%)")

# === VISUALIZATIONS ===
print("\n" + "="*80)
print("GENERATING VISUALIZATIONS")
print("-"*80)

fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('Hawaii SNAP Retailer Network Evolution (2020-2024)',
             fontsize=16, fontweight='bold', y=0.995)

# Chart 1: Authorizations by Year
ax1 = axes[0, 0]
years = auth_by_year.index.astype(int)
counts = auth_by_year.values
ax1.bar(years, counts, color='#2E86AB', alpha=0.8, edgecolor='black')
ax1.set_xlabel('Year', fontsize=11, fontweight='bold')
ax1.set_ylabel('New Authorizations', fontsize=11, fontweight='bold')
ax1.set_title('New SNAP Retailer Authorizations by Year', fontsize=12, fontweight='bold')
ax1.grid(True, alpha=0.3, axis='y')
for i, (year, count) in enumerate(zip(years, counts)):
    ax1.text(year, count + 1, str(count), ha='center', va='bottom', fontweight='bold')

# Chart 2: Store Type Distribution (New 2020-2024)
ax2 = axes[0, 1]
top_types = store_types_new.head(8)
ax2.barh(range(len(top_types)), top_types.values, color='#A23B72', alpha=0.8, edgecolor='black')
ax2.set_yticks(range(len(top_types)))
ax2.set_yticklabels([t[:35] for t in top_types.index], fontsize=9)
ax2.set_xlabel('Number of New Retailers', fontsize=11, fontweight='bold')
ax2.set_title('New Retailer Store Types (2020-2024)', fontsize=12, fontweight='bold')
ax2.grid(True, alpha=0.3, axis='x')
ax2.invert_yaxis()

# Chart 3: County Distribution
ax3 = axes[1, 0]
counties = county_dist.index
county_counts = county_dist.values
colors = ['#18A558', '#F18F01', '#2E86AB', '#A23B72']
ax3.bar(counties, county_counts, color=colors[:len(counties)], alpha=0.8, edgecolor='black')
ax3.set_xlabel('County', fontsize=11, fontweight='bold')
ax3.set_ylabel('New Authorizations', fontsize=11, fontweight='bold')
ax3.set_title('New Retailers by County (2020-2024)', fontsize=12, fontweight='bold')
ax3.grid(True, alpha=0.3, axis='y')
for i, (county, count) in enumerate(zip(counties, county_counts)):
    ax3.text(i, count + 2, str(count), ha='center', va='bottom', fontweight='bold')

# Chart 4: Net Change Analysis
ax4 = axes[1, 1]
categories = ['New\nAuthorizations', 'Deauthorizations', 'Net\nChange']
values = [len(focus_period), len(deauth_period), net_change]
colors_net = ['#18A558', '#E63946', '#2E86AB']
bars = ax4.bar(categories, values, color=colors_net, alpha=0.8, edgecolor='black')
ax4.set_ylabel('Number of Retailers', fontsize=11, fontweight='bold')
ax4.set_title('Retailer Network Net Change (2020-2024)', fontsize=12, fontweight='bold')
ax4.grid(True, alpha=0.3, axis='y')
ax4.axhline(0, color='black', linewidth=0.8)
for bar, value in zip(bars, values):
    height = bar.get_height()
    ax4.text(bar.get_x() + bar.get_width()/2., height + 5,
             f'{int(value)}', ha='center', va='bottom', fontweight='bold', fontsize=11)

plt.tight_layout()
plt.savefig('Data/retailer_network_evolution.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: Data/retailer_network_evolution.png")

# === SUMMARY ===
print("\n" + "="*80)
print("SUMMARY FOR REPORTING")
print("="*80)

# Calculate growth rate
growth_rate = (net_change / (len(active_stores) - net_change)) * 100 if (len(active_stores) - net_change) > 0 else 0

print(f"""
KEY FINDINGS:

1. Network Growth (2020-2024):
   - {len(focus_period)} new retailer authorizations
   - {len(deauth_period)} deauthorizations
   - Net gain: +{net_change} retailers ({growth_rate:.1f}% growth)

2. Authorization Trends:
   - 2020: {auth_by_year.get(2020, 0)} authorizations (pandemic year)
   - 2021: {auth_by_year.get(2021, 0)} authorizations
   - 2022: {auth_by_year.get(2022, 0)} authorizations
   - 2023: {auth_by_year.get(2023, 0)} authorizations
   - 2024: {auth_by_year.get(2024, 0)} authorizations (most recent)

3. Store Type Patterns (New 2020-2024):
   - Top type: {store_types_new.index[0]} ({store_types_new.values[0]} stores)
   - 2nd: {store_types_new.index[1]} ({store_types_new.values[1]} stores)
   - 3rd: {store_types_new.index[2]} ({store_types_new.values[2]} stores)

4. Geographic Distribution (New 2020-2024):
   - Honolulu: {county_dist.get('HONOLULU', 0)} ({(county_dist.get('HONOLULU', 0)/len(focus_period)*100):.1f}%)
   - Hawaii: {county_dist.get('HAWAII', 0)} ({(county_dist.get('HAWAII', 0)/len(focus_period)*100):.1f}%)
   - Maui: {county_dist.get('MAUI', 0)} ({(county_dist.get('MAUI', 0)/len(focus_period)*100):.1f}%)
   - Kauai: {county_dist.get('KAUAI', 0)} ({(county_dist.get('KAUAI', 0)/len(focus_period)*100):.1f}%)

5. Current Active Network:
   - Total active retailers: {len(active_stores)}
   - Pre-2020 authorizations still active: {len(pre_pandemic_active)}
   - 2020-2024 authorizations still active: {len(pandemic_era_active)}

6. Pandemic Impact:
   - Sustained growth throughout pandemic period
   - Average ~{len(focus_period)/5:.0f} new authorizations per year
   - Network expanded to meet increased SNAP participation
""")

print("="*80)
print("Analysis complete!")
print("="*80)
