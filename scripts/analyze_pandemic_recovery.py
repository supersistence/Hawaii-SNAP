#!/usr/bin/env python3
"""
Post-Pandemic Recovery Analysis for Hawaii SNAP
Analyzes participation and benefit trends from 2019-2025
Shows complete pandemic trajectory: pre-pandemic → peak → recovery
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np

# Load data
df = pd.read_csv('Data/Statewide Monthly SNAP FY 89-25.csv')
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# Define analysis periods
pre_pandemic = df[(df['Date'] >= '2019-01-01') & (df['Date'] < '2020-03-01')]
pandemic_emergency = df[(df['Date'] >= '2020-03-01') & (df['Date'] < '2021-09-01')]
benefit_phaseout = df[(df['Date'] >= '2021-09-01') & (df['Date'] < '2023-01-01')]
post_emergency = df[(df['Date'] >= '2023-01-01') & (df['Date'] <= '2025-05-01')]

# Analysis period (2019-2025)
analysis_df = df[df['Date'] >= '2019-01-01'].copy()

print("="*80)
print("POST-PANDEMIC RECOVERY ANALYSIS: Hawaii SNAP (2019-2025)")
print("="*80)
print()

# === KEY STATISTICS ===
print("KEY STATISTICS BY PERIOD")
print("-"*80)

periods = {
    'Pre-Pandemic (Jan 2019 - Feb 2020)': pre_pandemic,
    'Pandemic Emergency (Mar 2020 - Aug 2021)': pandemic_emergency,
    'Benefit Phase-out (Sep 2021 - Dec 2022)': benefit_phaseout,
    'Post-Emergency (Jan 2023 - May 2025)': post_emergency
}

for period_name, period_data in periods.items():
    if len(period_data) > 0:
        print(f"\n{period_name}")
        print(f"  Avg Households: {period_data['Household'].mean():>10,.0f}")
        print(f"  Avg Persons: {period_data['Persons'].mean():>13,.0f}")
        print(f"  Avg Benefit/HH: ${period_data['Per Household'].mean():>9,.2f}")
        print(f"  Avg Benefit/Person: ${period_data['Per Person'].mean():>6,.2f}")
        print(f"  Avg Monthly Cost: ${period_data['Cost'].mean():>8,.0f}")

# === PEAK ANALYSIS ===
print("\n" + "="*80)
print("PEAK PARTICIPATION")
print("-"*80)

peak_idx = analysis_df['Persons'].idxmax()
peak_date = analysis_df.loc[peak_idx, 'Date']
peak_persons = analysis_df.loc[peak_idx, 'Persons']
peak_households = analysis_df.loc[peak_idx, 'Household']
peak_benefit_hh = analysis_df.loc[peak_idx, 'Per Household']
peak_benefit_person = analysis_df.loc[peak_idx, 'Per Person']

print(f"Peak Date: {peak_date.strftime('%B %Y')}")
print(f"Peak Persons: {peak_persons:,.0f}")
print(f"Peak Households: {peak_households:,.0f}")
print(f"Peak Benefit/HH: ${peak_benefit_hh:,.2f}")
print(f"Peak Benefit/Person: ${peak_benefit_person:,.2f}")

# === CURRENT STATUS (May 2025) ===
print("\n" + "="*80)
print("CURRENT STATUS (May 2025)")
print("-"*80)

latest = analysis_df.iloc[-1]
print(f"Current Persons: {latest['Persons']:,.0f}")
print(f"Current Households: {latest['Household']:,.0f}")
print(f"Current Benefit/HH: ${latest['Per Household']:,.2f}")
print(f"Current Benefit/Person: ${latest['Per Person']:,.2f}")

# === DECLINE FROM PEAK ===
print("\n" + "="*80)
print("DECLINE FROM PEAK TO CURRENT")
print("-"*80)

persons_decline = peak_persons - latest['Persons']
persons_pct_decline = (persons_decline / peak_persons) * 100
households_decline = peak_households - latest['Household']
households_pct_decline = (households_decline / peak_households) * 100

print(f"Persons Decline: {persons_decline:,.0f} ({persons_pct_decline:.1f}%)")
print(f"Households Decline: {households_decline:,.0f} ({households_pct_decline:.1f}%)")

# Compare to pre-pandemic baseline
pre_pandemic_avg_persons = pre_pandemic['Persons'].mean()
pre_pandemic_avg_hh = pre_pandemic['Household'].mean()

persons_above_baseline = latest['Persons'] - pre_pandemic_avg_persons
persons_pct_above = (persons_above_baseline / pre_pandemic_avg_persons) * 100

hh_above_baseline = latest['Household'] - pre_pandemic_avg_hh
hh_pct_above = (hh_above_baseline / pre_pandemic_avg_hh) * 100

print(f"\nCurrent vs Pre-Pandemic Baseline:")
print(f"  Persons: +{persons_above_baseline:,.0f} (+{persons_pct_above:.1f}%)")
print(f"  Households: +{hh_above_baseline:,.0f} (+{hh_pct_above:.1f}%)")

# === BENEFIT ANALYSIS ===
print("\n" + "="*80)
print("BENEFIT LEVEL CHANGES")
print("-"*80)

# Emergency allotments period (peak benefit)
emergency_period = df[(df['Date'] >= '2021-03-01') & (df['Date'] <= '2021-08-01')]
peak_benefit_period_avg = emergency_period['Per Household'].mean()

benefit_decline = latest['Per Household'] - peak_benefit_period_avg
benefit_pct_decline = (benefit_decline / peak_benefit_period_avg) * 100

print(f"Peak Emergency Period Avg Benefit/HH: ${peak_benefit_period_avg:,.2f}")
print(f"Current Benefit/HH: ${latest['Per Household']:,.2f}")
print(f"Decline: ${benefit_decline:,.2f} ({benefit_pct_decline:.1f}%)")

# === VISUALIZATION ===
print("\n" + "="*80)
print("GENERATING VISUALIZATIONS")
print("-"*80)

# Create comprehensive visualization
fig, axes = plt.subplots(3, 1, figsize=(14, 12))
fig.suptitle('Hawaii SNAP Post-Pandemic Recovery Analysis (2019-2025)',
             fontsize=16, fontweight='bold', y=0.995)

# Chart 1: Participation Trends
ax1 = axes[0]
ax1.plot(analysis_df['Date'], analysis_df['Persons'],
         linewidth=2, color='#2E86AB', label='Persons')
ax1.axvline(pd.Timestamp('2020-03-01'), color='red', linestyle='--',
            alpha=0.7, label='Pandemic Start')
ax1.axvline(pd.Timestamp('2021-09-01'), color='orange', linestyle='--',
            alpha=0.7, label='Benefit Phase-out')
ax1.axhline(pre_pandemic_avg_persons, color='gray', linestyle=':',
            alpha=0.7, label='Pre-Pandemic Avg')

# Mark peak
ax1.scatter([peak_date], [peak_persons], color='red', s=100, zorder=5, label='Peak')
ax1.annotate(f'Peak: {peak_persons:,.0f}\n{peak_date.strftime("%b %Y")}',
             xy=(peak_date, peak_persons), xytext=(10, 20),
             textcoords='offset points', fontsize=9,
             bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', alpha=0.7))

ax1.set_ylabel('Persons Participating', fontsize=11, fontweight='bold')
ax1.set_title('SNAP Participation: Pre-Pandemic → Peak → Recovery',
              fontsize=12, fontweight='bold')
ax1.legend(loc='upper left', fontsize=9)
ax1.grid(True, alpha=0.3)
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x/1000)}K'))

# Chart 2: Household Participation
ax2 = axes[1]
ax2.plot(analysis_df['Date'], analysis_df['Household'],
         linewidth=2, color='#A23B72', label='Households')
ax2.axvline(pd.Timestamp('2020-03-01'), color='red', linestyle='--', alpha=0.7)
ax2.axvline(pd.Timestamp('2021-09-01'), color='orange', linestyle='--', alpha=0.7)
ax2.axhline(pre_pandemic_avg_hh, color='gray', linestyle=':', alpha=0.7)

ax2.set_ylabel('Households Participating', fontsize=11, fontweight='bold')
ax2.set_title('Household Participation Trends', fontsize=12, fontweight='bold')
ax2.grid(True, alpha=0.3)
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x/1000)}K'))

# Chart 3: Benefit Levels
ax3 = axes[2]
ax3.plot(analysis_df['Date'], analysis_df['Per Household'],
         linewidth=2, color='#18A558', label='Per Household')
ax3.plot(analysis_df['Date'], analysis_df['Per Person'],
         linewidth=2, color='#F18F01', label='Per Person')
ax3.axvline(pd.Timestamp('2020-03-01'), color='red', linestyle='--', alpha=0.7)
ax3.axvline(pd.Timestamp('2021-09-01'), color='orange', linestyle='--', alpha=0.7)

# Highlight emergency allotment period
emergency_start = pd.Timestamp('2021-03-01')
emergency_end = pd.Timestamp('2021-08-01')
ax3.axvspan(emergency_start, emergency_end, alpha=0.2, color='yellow',
            label='Emergency Allotments Peak')

ax3.set_ylabel('Average Monthly Benefit ($)', fontsize=11, fontweight='bold')
ax3.set_xlabel('Date', fontsize=11, fontweight='bold')
ax3.set_title('Benefit Levels: Emergency Boosts → Phase-out → Stabilization',
              fontsize=12, fontweight='bold')
ax3.legend(loc='upper left', fontsize=9)
ax3.grid(True, alpha=0.3)
ax3.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${int(x)}'))

# Format x-axis for all charts
for ax in axes:
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_minor_locator(mdates.MonthLocator(bymonth=[1,7]))
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')

plt.tight_layout()
plt.savefig('Data/pandemic_recovery_analysis.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: Data/pandemic_recovery_analysis.png")

# === SUMMARY STATISTICS FOR REPORT ===
print("\n" + "="*80)
print("SUMMARY FOR REPORTING")
print("="*80)
print(f"""
KEY FINDINGS:

1. Participation Peak: {peak_date.strftime('%B %Y')} with {peak_persons:,.0f} persons

2. Decline Since Peak:
   - Persons: ↓{persons_decline:,.0f} ({persons_pct_decline:.1f}%)
   - Households: ↓{households_decline:,.0f} ({households_pct_decline:.1f}%)

3. Current vs Pre-Pandemic Baseline:
   - Persons: +{persons_above_baseline:,.0f} (+{persons_pct_above:.1f}%)
   - Households: +{hh_above_baseline:,.0f} (+{hh_pct_above:.1f}%)
   - New baseline: ~{hh_pct_above:.0f}% above pre-pandemic levels

4. Benefit Changes:
   - Emergency peak avg: ${peak_benefit_period_avg:,.2f}/household
   - Current benefit: ${latest['Per Household']:,.2f}/household
   - Decline: ${abs(benefit_decline):,.2f} ({abs(benefit_pct_decline):.1f}%)

5. Stabilization Pattern:
   - Participation has stabilized since early 2023
   - Current level represents "new normal" post-pandemic baseline
   - Higher than pre-pandemic but well below emergency peak
""")

print("="*80)
print("Analysis complete!")
print("="*80)
