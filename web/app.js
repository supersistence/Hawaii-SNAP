// Hawaii SNAP Data Visualization App

// Global data storage
let monthlyData = null;
let countyData = null;
let trendsData = null;
let metadata = null;
let dhsData = null;

// Chart instances
const charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    setupNav();
    await loadData();
    hideLoading();
    themeChartDefaults();
    initializeCharts();
    themeCharts();
    annotateEvents();
    populateStats();
    buildIsotypes();
    updateDataCurrency();
    setupScrolly();
    setupDisruptionsScrolly();
});

// Data-currency labels, source-attributed so the two series read as
// intentional (federal = historical backbone, DHS = most current) and never
// go stale: everything is derived from the loaded JSON, not hardcoded.
function updateDataCurrency() {
    const monthYear = (d) => {
        if (!d) return null;
        const iso = d.length === 10 ? d + 'T12:00:00' : d;  // avoid TZ slip on date-only
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };
    const fed = monthYear(metadata && metadata.summary && metadata.summary.endDate) || 'May 2025';
    const dhs = monthYear(dhsData && dhsData.asOfDate);
    const gen = monthYear(metadata && metadata.generated);

    const badge = document.getElementById('data-badge');
    if (badge) badge.textContent = dhs
        ? `USDA federal → ${fed} · DHS state → ${dhs}`
        : `Current through ${fed}`;

    const foot = document.getElementById('footer-currency');
    if (foot) {
        let t = `Federal (USDA) series current through <strong>${fed}</strong>`;
        if (dhs) t += ` · state (DHS) series through <strong>${dhs}</strong>`;
        if (gen) t += `. Page data regenerated ${gen}.`;
        foot.innerHTML = t;
    }
}

// ---- Event markers: label WHY each chart turns ------------------------
// Restrained, Tufte-style reference lines. Each chart only carries the
// events that explain ITS inflections (≤3 each), labels alternate top/bottom
// to avoid collisions in the tightly-spaced 2019–2023 stretch.
const EVENTS = [
    { date: '2008-09-01', label: 'Great Recession',      charts: ['households', 'persons'] },
    { date: '2019-02-01', label: '2019 shutdown',        charts: ['benefit', 'cost'] },
    { date: '2020-03-01', label: 'COVID-19',             charts: ['households', 'persons', 'dhs'] },
    { date: '2021-08-01', label: 'Emergency allotments', charts: ['benefit', 'cost', 'households', 'persons', 'dhs'] },
    { date: '2023-03-01', label: 'Allotments end',       charts: ['benefit', 'cost', 'dhs'] },
];

function annotateEvents() {
    const accent = { households: '#075985', persons: '#075985',
                     benefit: '#b45309', cost: '#b45309', dhs: '#6243a4' };
    const seen = {};
    EVENTS.forEach(ev => ev.charts.forEach(key => {
        const ch = charts[key];
        if (!ch) return;
        const i = seen[key] = (seen[key] || 0) + 1;
        // Mutate the source config, not the resolved ch.options proxy: assigning
        // a fresh plugins.annotation onto resolved options recurses in Chart's
        // option merge. The config is re-resolved cleanly on update().
        const plugins = ch.config.options.plugins;
        const plug = plugins.annotation || (plugins.annotation = { annotations: {} });
        plug.annotations = plug.annotations || {};
        plug.annotations['ev_' + ev.date] = {
            type: 'line', xMin: ev.date, xMax: ev.date,
            borderColor: hexA(accent[key] || '#86867a', 0.5),
            borderWidth: 1, borderDash: [3, 3],
            label: {
                display: true, content: ev.label,
                position: i % 2 ? 'start' : 'end',
                backgroundColor: 'rgba(255,255,248,0.92)',
                color: '#54544c', font: { size: 9, weight: '500' },
                padding: 3, borderRadius: 2,
            },
        };
    }));
    Object.values(charts).forEach(c => c.update('none'));
}

// ---- Disruptions: DHS participation 2008–2026 + Act scrollytelling ----
function createDisruptionsChart() {
    const el = document.getElementById('disruptionsChart');
    if (!el || !dhsData) return;
    const s = dhsData.statewideMonthly;
    charts.disruptions = new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
            labels: s.dates,
            datasets: [{
                label: 'Participants', data: s.participants,
                borderColor: '#1d6b3f', backgroundColor: 'rgba(29,107,63,0.06)',
                borderWidth: 2.2, fill: true, pointRadius: 0,
            }],
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false },
                annotation: { annotations: {} },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: (c) => formatDate(c[0].parsed.x),
                        label: (c) => formatNumber(c.parsed.y) + ' participants',
                    },
                },
            },
            scales: {
                x: { type: 'time', time: { unit: 'year', displayFormats: { year: 'yyyy' } },
                     ticks: { maxTicksLimit: 8 } },
                y: { beginAtZero: false, ticks: { callback: (v) => formatNumber(v) } },
            },
        },
    });
}

function setupDisruptionsScrolly() {
    const sc = document.getElementById('disruptions-scrolly');
    if (!sc || !charts.disruptions || !dhsData) return;
    const s = dhsData.statewideMonthly;
    const at = (d) => { const i = s.dates.indexOf(d); return i >= 0 ? s.participants[i] : null; };
    const peakIn = (a, b) => {
        let mx = -1, md = a;
        s.dates.forEach((d, i) => { if (d >= a && d <= b && s.participants[i] > mx) { mx = s.participants[i]; md = d; } });
        return { v: mx, d: md };
    };
    const pct = (a, b) => (((b / a) - 1) * 100).toFixed(1).replace(/\.0$/, '');
    const rec = peakIn('2008-07-01', '2014-06-01');
    const covid = peakIn('2020-03-01', '2022-06-01');
    const shutPeak = peakIn('2025-08-01', '2025-12-01');
    const latest = { v: s.participants[s.participants.length - 1], d: s.dates[s.dates.length - 1] };

    const acts = [
        { range: ['2008-07-01', '2014-06-01'], n: formatNumber(rec.v),   note: '+' + pct(at('2008-07-01'), rec.v) + '%', noteL: '2008–13 climb' },
        { range: ['2020-03-01', '2022-06-01'], n: formatNumber(covid.v), note: 'all-time peak',                          noteL: formatDate(covid.d) },
        { range: ['2025-08-01', latest.d],     n: formatNumber(latest.v),note: pct(shutPeak.v, latest.v) + '%',          noteL: 'since Oct 2025 peak' },
    ];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setAct = (i) => {
        const a = acts[i];
        document.getElementById('dro-persons').textContent = a.n;
        document.getElementById('dro-note').textContent = a.note;
        document.getElementById('dro-note-l').textContent = a.noteL;
        charts.disruptions.config.options.plugins.annotation = { annotations: {
            band: { type: 'box', xMin: a.range[0], xMax: a.range[1],
                    backgroundColor: hexA('#b3201f', 0.08), borderWidth: 0 },
        }};
        charts.disruptions.update('none');
    };

    document.querySelectorAll('#disruptions-scrolly .step').forEach(step => {
        if (reduce) { step.classList.add('is-active'); return; }
        new IntersectionObserver((es) => es.forEach(e => {
            if (e.isIntersecting) {
                document.querySelectorAll('#disruptions-scrolly .step')
                    .forEach(x => x.classList.remove('is-active'));
                e.target.classList.add('is-active');
                setAct(+e.target.dataset.step);
            }
        }), { rootMargin: '-45% 0px -45% 0px' }).observe(step);
    });
    setAct(reduce ? 2 : 0);
}

// ---- Isotype pictographs (human-scale, data-driven) -------------------
const PERSON_PATH = 'M12 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm-5 20v-7c0-2.2 2.2-4 5-4s5 1.8 5 4v7h-3v-1h-4v1z';
function personSVG(fill) {
    return `<svg viewBox="0 0 24 24"><path d="${PERSON_PATH}" fill="${fill}"/></svg>`;
}

function buildIsotypes() {
    // --- Overview: "1 in N" prevalence headline above the island map.
    const shareEl = document.getElementById('iso-share');
    if (shareEl && countyData) {
        const totalPop = countyData.counties.reduce((s, c) => s + (c.population || 0), 0);
        const snap = monthlyData.metadata.latestPersons;
        shareEl.textContent = `1 in ${Math.round(totalPop / snap)}`;
    }

    // --- Counties: highest- vs lowest-rate county, 100-figure classrooms
    const clA = document.getElementById('cl-a');
    if (clA && countyData) {
        const ranked = [...countyData.counties].filter(c => c.participationRate != null)
            .sort((a, b) => b.participationRate - a.participationRate);
        const hi = ranked[0], lo = ranked[ranked.length - 1];
        const grid = (id, labId, county, accent) => {
            const pct = Math.round(county.participationRate);
            let h = '';
            for (let i = 0; i < 100; i++) h += personSVG(i < pct ? accent : '#e0dfd2');
            document.getElementById(id).innerHTML = h;
            document.getElementById(labId).innerHTML =
                `${county.name === 'HAWAII' ? 'Hawai‘i Island' : county.name.charAt(0) + county.name.slice(1).toLowerCase()} · <b>${county.participationRate}%</b> — about 1 in ${Math.round(100 / county.participationRate)}`;
        };
        grid('cl-a', 'cl-a-lab', hi, '#075985');
        grid('cl-b', 'cl-b-lab', lo, '#075985');
    }

    // --- Benefits: $ per person per meal
    const mealEl = document.getElementById('meal-amt');
    if (mealEl) {
        const cost = monthlyData.metadata.latestTotalCost;
        const people = monthlyData.metadata.latestPersons;
        const perMeal = cost / people / 30 / 3;
        const txt = '$' + perMeal.toFixed(2);
        mealEl.textContent = txt;
        document.getElementById('meal-amt-h').textContent = '$' + perMeal.toFixed(2);
    }
}

// Sticky jump-nav: highlight the link for whichever section is in view.
// All sections are visible at once (single-page scroll), so this is a
// scroll-spy, not a tab switcher. Smooth scrolling is handled in CSS.
function setupNav() {
    const links = [...document.querySelectorAll('.tab-button')];
    const byId = new Map(links.map(a => [a.getAttribute('href')?.slice(1), a]));
    const sections = document.querySelectorAll('.tab-content');

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                byId.get(e.target.id)?.classList.add('active');
            }
        });
    }, { rootMargin: '-25% 0px -65% 0px' });

    sections.forEach(s => obs.observe(s));
}

// ---- Brand chart theming ----------------------------------------------
// Tufte-informed: thin lines, faint gridlines, no chart junk. Series use a
// restrained brand palette (taro green leads every primary series).
const SERIES = ['#1d6b3f', '#b45309', '#075985', '#6243a4', '#b3201f'];
function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function themeChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#54544c';
    Chart.defaults.borderColor = '#f1efe4';
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hoverRadius = 4;
    Chart.defaults.elements.line.tension = 0.25;
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.boxHeight = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;
}

// Re-color every instantiated chart from the brand palette and strip junk.
function themeCharts() {
    Object.values(charts).forEach(ch => {
        const isBar = ch.config.type === 'bar';
        ch.data.datasets.forEach((ds, i) => {
            const c = SERIES[i % SERIES.length];
            if (ds.type === 'line' || (!isBar)) {
                ds.borderColor = c;
                ds.backgroundColor = hexA(c, ds.fill === false ? 0 : 0.06);
                ds.borderWidth = ds.type === 'line' ? 2.4 : 1.8;
                ds.pointRadius = 0;
                ds.pointHoverRadius = 4;
                ds.tension = 0.25;
            } else {
                ds.backgroundColor = hexA(c, 0.85);
                ds.borderColor = c;
                ds.borderWidth = 0;
                ds.borderRadius = 2;
                ds.categoryPercentage = 0.7;
                ds.maxBarThickness = 46;
            }
        });
        const o = ch.options;
        Object.values(o.scales || {}).forEach(sc => {
            sc.grid = { ...(sc.grid || {}), drawTicks: false, color: '#f1efe4',
                        lineWidth: 1, drawBorder: false };
            sc.border = { ...(sc.border || {}), display: false };
            sc.ticks = { ...(sc.ticks || {}), color: '#86867a', padding: 8 };
            if (sc.title) { sc.title.color = '#86867a';
                sc.title.font = { size: 11, weight: '600' }; }
        });
        // x gridlines off for line charts (keep horizontal reference only)
        if (!isBar && o.scales && o.scales.x) o.scales.x.grid.display = false;
        if (o.plugins && o.plugins.title) o.plugins.title.display = false;
        ch.update('none');
    });
}

// ---- Scrollytelling driver for the Overview hero ----------------------
function setupScrolly() {
    const scrolly = document.getElementById('overview-scrolly');
    if (!scrolly || !charts.overview) return;

    const latest = monthlyData.metadata.latestPersons;
    const acts = [
        { range: ['1989-01-01', '2008-01-01'], n: '~110K',  note: 'stable',  noteL: '1989–2008 floor' },
        { range: ['2008-01-01', '2014-06-01'], n: '188K',   note: '+70%',    noteL: 'recession climb'   },
        { range: ['2020-03-01', '2021-12-01'], n: '206,226',note: 'peak',    noteL: 'July 2021'         },
        { range: ['2022-01-01', '2025-05-01'], n: formatNumber(latest), note: '+13%', noteL: 'vs. 2019 baseline' },
    ];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setAct = (i) => {
        const a = acts[i];
        document.getElementById('ro-persons').textContent = a.n;
        document.getElementById('ro-note').textContent = a.note;
        document.getElementById('ro-note-l').textContent = a.noteL;
        const ch = charts.overview;
        ch.options.plugins.annotation = { annotations: {
            band: { type: 'box', xMin: a.range[0], xMax: a.range[1],
                    backgroundColor: hexA('#1d6b3f', 0.10), borderWidth: 0 },
        }};
        if (i === 2) ch.options.plugins.annotation.annotations.peak = {
            type: 'point', xValue: '2021-07-01', yValue: 206226, radius: 4,
            backgroundColor: '#1d6b3f', borderColor: '#fffff8', borderWidth: 1.5 };
        ch.update('none');
    };

    document.querySelectorAll('#overview-scrolly .step').forEach(step => {
        if (reduce) { step.classList.add('is-active'); return; }
        new IntersectionObserver((entries) => entries.forEach(e => {
            if (e.isIntersecting) {
                document.querySelectorAll('#overview-scrolly .step')
                    .forEach(s => s.classList.remove('is-active'));
                e.target.classList.add('is-active');
                setAct(+e.target.dataset.step);
            }
        }), { rootMargin: '-45% 0px -45% 0px' }).observe(step);
    });
    setAct(reduce ? 3 : 0);
}

// Load data from JSON files
async function loadData() {
    try {
        const [monthlyRes, countyRes, trendsRes, metadataRes] = await Promise.all([
            fetch('data/monthly.json'),
            fetch('data/county.json'),
            fetch('data/trends.json'),
            fetch('data/metadata.json')
        ]);

        monthlyData = await monthlyRes.json();
        countyData = await countyRes.json();
        trendsData = await trendsRes.json();
        metadata = await metadataRes.json();

        // DHS data is optional (separate source); don't fail the page if absent.
        try {
            const dhsRes = await fetch('data/dhs.json');
            if (dhsRes.ok) dhsData = await dhsRes.json();
        } catch (e) {
            console.warn('DHS data not available:', e);
        }

        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').innerHTML = `
        <div style="color: var(--danger-color); padding: 2rem;">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Populate statistics
function populateStats() {
    const { metadata: meta, summary, yearOverYear } = monthlyData;

    // Overview stats — caseload counts lead with the most-current series (DHS,
    // through May 2026); benefit/cost stay on USDA (DHS doesn't publish them).
    // Each card's date sub-label names its source so the mix is explicit.
    const dhsCur = (dhsData && dhsData.statewideMonthly) ? {
        persons: dhsData.statewideMonthly.participants[dhsData.statewideMonthly.participants.length - 1],
        households: dhsData.statewideMonthly.households[dhsData.statewideMonthly.households.length - 1],
        date: dhsData.asOfDate || dhsData.statewideMonthly.dates[dhsData.statewideMonthly.dates.length - 1],
    } : null;
    const cur = dhsCur || { persons: meta.latestPersons, households: meta.latestHouseholds, date: meta.endDate };
    const curSrc = dhsCur ? 'DHS' : 'USDA';

    document.getElementById('stat-persons').textContent = formatNumber(cur.persons);
    document.getElementById('stat-persons-date').textContent = `${curSrc} · ${formatDate(cur.date)}`;

    document.getElementById('stat-households').textContent = formatNumber(cur.households);
    document.getElementById('stat-households-date').textContent = `${curSrc} · ${formatDate(cur.date)}`;

    document.getElementById('stat-benefit').textContent = `$${formatNumber(meta.latestAvgBenefitPerHousehold)}`;
    document.getElementById('stat-benefit-date').textContent = `USDA · ${formatDate(meta.endDate)}`;

    document.getElementById('stat-cost').textContent = `$${formatMoney(meta.latestTotalCost)}`;
    document.getElementById('stat-cost-date').textContent = `USDA · ${formatDate(meta.endDate)}`;

    // Populate text content
    document.getElementById('avg-persons').textContent = formatNumber(summary.averages.persons);
    document.getElementById('peak-date').textContent = formatDate(summary.peak.persons.date);
    document.getElementById('peak-persons').textContent = formatNumber(summary.peak.persons.value);
    document.getElementById('latest-persons').textContent = formatNumber(meta.latestPersons);
    document.getElementById('latest-households').textContent = formatNumber(meta.latestHouseholds);

    // Year over year
    const yoyChange = yearOverYear.persons.percentChange;
    const yoyText = yoyChange >= 0 ? `+${yoyChange}%` : `${yoyChange}%`;
    document.getElementById('yoy-change').textContent = yoyText;

    // COVID stats
    document.getElementById('pre-covid-households').textContent = formatNumber(trendsData.periods.preCovidAvg.households);
    document.getElementById('peak-covid-households').textContent = formatNumber(trendsData.periods.covidPeak.households);
    document.getElementById('peak-covid-date').textContent = formatDate(trendsData.periods.covidPeak.date);
    document.getElementById('covid-increase').textContent = '+' + formatNumber(trendsData.covidImpact.peakIncrease.households);
    document.getElementById('covid-increase-pct').textContent = trendsData.covidImpact.peakIncrease.householdsPercent;

    // Populate county details
    populateCountyDetails();
}

function populateCountyDetails() {
    const container = document.getElementById('county-details');
    container.innerHTML = '';

    // Sort by per-capita participation (highest SNAP burden first) rather than
    // raw volume — otherwise Honolulu always leads simply because it's biggest.
    const counties = [...countyData.counties].sort(
        (a, b) => (b.participationRate || 0) - (a.participationRate || 0));

    counties.forEach(county => {
        const card = document.createElement('div');
        card.className = 'county-card';
        const rate = county.participationRate;
        card.innerHTML = `
            <h4>${county.name} County</h4>
            <div class="county-stat" style="font-weight:600">
                <span class="county-stat-label">% of Residents on SNAP</span>
                <span class="county-stat-value">${rate != null ? rate + '%' : '—'}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Total Persons</span>
                <span class="county-stat-value">${formatNumber(county.persons.total)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Population (${countyData.populationYear})</span>
                <span class="county-stat-value">${formatNumber(county.population)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Total Households</span>
                <span class="county-stat-value">${formatNumber(county.households.total)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Public Assistance</span>
                <span class="county-stat-value">${formatNumber(county.persons.publicAssistance)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Non-PA</span>
                <span class="county-stat-value">${formatNumber(county.persons.nonPublicAssistance)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Total Benefits</span>
                <span class="county-stat-value">$${formatMoney(county.totalIssuance)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize all charts
function initializeCharts() {
    createOverviewChart();
    createHouseholdsChart();
    createPersonsChart();
    createBenefitChart();
    createCostChart();
    createCovidChart();
    createCountyChart();
    createPAChart();
    createFoodHubsChart();
    if (dhsData) { createDHSChart(); createDHSTimelinessChart(); createDisruptionsChart(); populateDHSCounties(); }
}

// DHS application timeliness: applications received (bars) + % timely (line)
function createDHSTimelinessChart() {
    const el = document.getElementById('dhsTimelinessChart');
    if (!el || !dhsData.timeliness) return;
    const t = dhsData.timeliness;
    charts.dhsTimeliness = new Chart(el, {
        data: {
            labels: t.dates,
            datasets: [
                { type: 'line', label: '% Processed On Time', data: t.percentTimely,
                  yAxisID: 'y1', borderColor: '#16a34a', pointRadius: 0, borderWidth: 2, spanGaps: false },
                { type: 'bar', label: 'Applications Received', data: t.applicationsReceived,
                  yAxisID: 'y', backgroundColor: 'rgba(37,99,235,0.35)' },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { ticks: { maxTicksLimit: 12 } },
                y: { position: 'left', title: { display: true, text: 'Applications Received' },
                     ticks: { callback: v => formatNumber(v) } },
                y1: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false },
                      title: { display: true, text: '% On Time' } },
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// DHS state-data view: monthly statewide participation (2008-present) + per-island
function createDHSChart() {
    const el = document.getElementById('dhsChart');
    if (!el) return;
    const s = dhsData.statewideMonthly;
    charts.dhs = new Chart(el, {
        type: 'line',
        data: {
            labels: s.dates,
            datasets: [
                { label: 'Participants', data: s.participants, borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.1)', fill: true, pointRadius: 0, borderWidth: 2 },
                { label: 'Households', data: s.households, borderColor: '#16a34a',
                  backgroundColor: 'rgba(22,163,74,0.08)', fill: true, pointRadius: 0, borderWidth: 2 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            scales: { x: { ticks: { maxTicksLimit: 12 } },
                      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } } },
            plugins: { legend: { position: 'top' },
                       title: { display: true,
                                text: 'Hawaii DHS — Monthly SNAP Participation, Statewide (SFY 2009–present)' } }
        }
    });
}

function populateDHSCounties() {
    const c = document.getElementById('dhs-counties');
    if (!c) return;
    c.innerHTML = '';
    dhsData.latestByCounty.forEach(county => {
        const card = document.createElement('div');
        card.className = 'county-card';
        card.innerHTML = `
            <h4>${county.county} County</h4>
            <div class="county-stat" style="font-weight:600">
                <span class="county-stat-label">% of Residents on SNAP</span>
                <span class="county-stat-value">${county.participationRate != null ? county.participationRate + '%' : '—'}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Participants</span>
                <span class="county-stat-value">${formatNumber(county.participants)}</span>
            </div>
            <div class="county-stat">
                <span class="county-stat-label">Households</span>
                <span class="county-stat-value">${formatNumber(county.households)}</span>
            </div>`;
        c.appendChild(card);
    });
}

// Chart configurations
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
        }
    }
};

function createOverviewChart() {
    const ctx = document.getElementById('overviewChart').getContext('2d');

    // Full 1989–2025 range: the scrollytelling hero walks the whole story.
    charts.overview = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Persons receiving SNAP',
                    data: monthlyData.datasets.persons,
                    borderColor: '#1d6b3f',
                    backgroundColor: 'rgba(29, 107, 63, 0.06)',
                    borderWidth: 2.2,
                    fill: true,
                    yAxisID: 'y',
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false },
                annotation: { annotations: {} },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: (context) => formatDate(context[0].parsed.x),
                        label: (context) => formatNumber(context.parsed.y) + ' persons',
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'year', displayFormats: { year: 'yyyy' } },
                    ticks: { maxTicksLimit: 8 },
                },
                y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => formatNumber(value) }
                }
            }
        }
    });
}

function createHouseholdsChart() {
    const ctx = document.getElementById('householdsChart').getContext('2d');
    const startIndex = monthlyData.labels.findIndex(date => date >= '1999-01-01');

    charts.households = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels.slice(startIndex),
            datasets: [{
                label: 'Households Participating',
                data: monthlyData.datasets.households.slice(startIndex),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Households'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            return 'Households: ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createPersonsChart() {
    const ctx = document.getElementById('personsChart').getContext('2d');
    const startIndex = monthlyData.labels.findIndex(date => date >= '1999-01-01');

    charts.persons = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels.slice(startIndex),
            datasets: [{
                label: 'Persons Participating',
                data: monthlyData.datasets.persons.slice(startIndex),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Persons'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            return 'Persons: ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createBenefitChart() {
    const ctx = document.getElementById('benefitChart').getContext('2d');
    const startIndex = monthlyData.labels.findIndex(date => date >= '1999-01-01');

    charts.benefit = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels.slice(startIndex),
            datasets: [{
                label: 'Average Monthly Benefit per Household',
                data: monthlyData.datasets.avgBenefitPerHousehold.slice(startIndex),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Average Benefit ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            return 'Avg Benefit: $' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createCostChart() {
    const ctx = document.getElementById('costChart').getContext('2d');
    const startIndex = monthlyData.labels.findIndex(date => date >= '1999-01-01');

    charts.cost = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels.slice(startIndex),
            datasets: [{
                label: 'Total Monthly Cost',
                data: monthlyData.datasets.totalCost.slice(startIndex),
                borderColor: '#d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Total Cost ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatMoney(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            return 'Total Cost: $' + formatMoney(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createCovidChart() {
    const ctx = document.getElementById('covidChart').getContext('2d');

    charts.covid = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendsData.recentData.labels,
            datasets: [
                {
                    label: 'Households',
                    data: trendsData.recentData.households,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Avg Benefit/Household',
                    data: trendsData.recentData.avgBenefitPerHousehold,
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Households'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Avg Benefit ($)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                annotation: {
                    annotations: {
                        covidStart: {
                            type: 'line',
                            xMin: '2020-03-01',
                            xMax: '2020-03-01',
                            borderColor: 'rgba(220, 38, 38, 0.5)',
                            borderWidth: 2,
                            label: {
                                content: 'COVID-19',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Households: ' + formatNumber(context.parsed.y);
                            } else {
                                return 'Avg Benefit: $' + formatNumber(context.parsed.y);
                            }
                        }
                    }
                }
            }
        }
    });
}

function createCountyChart() {
    const ctx = document.getElementById('countyChart').getContext('2d');

    const countyNames = countyData.counties.map(c => c.name);
    const countyPersons = countyData.counties.map(c => c.persons.total);
    const countyHouseholds = countyData.counties.map(c => c.households.total);

    charts.county = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countyNames,
            datasets: [
                {
                    label: 'Persons',
                    data: countyPersons,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 1
                },
                {
                    label: 'Households',
                    data: countyHouseholds,
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function createPAChart() {
    const ctx = document.getElementById('paChart').getContext('2d');

    const countyNames = countyData.counties.map(c => c.name);
    const paPersons = countyData.counties.map(c => c.persons.publicAssistance);
    const nonPaPersons = countyData.counties.map(c => c.persons.nonPublicAssistance);

    charts.pa = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countyNames,
            datasets: [
                {
                    label: 'Public Assistance',
                    data: paPersons,
                    backgroundColor: 'rgba(5, 150, 105, 0.7)',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Non-Public Assistance',
                    data: nonPaPersons,
                    backgroundColor: 'rgba(217, 119, 6, 0.7)',
                    borderColor: '#d97706',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Persons'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Utility functions
function formatNumber(num) {
    if (num === null || num === undefined) return '--';
    return Math.round(num).toLocaleString('en-US');
}

function formatMoney(amount) {
    if (amount === null || amount === undefined) return '--';
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    }
    return formatNumber(amount);
}

function formatDate(dateString) {
    if (!dateString) return '--';
    // Parse date-only strings (YYYY-MM-DD) at local noon so the UTC-midnight
    // value doesn't slip to the previous month in Hawai‘i time (UTC-10).
    const s = (typeof dateString === 'string' && dateString.length === 10)
        ? dateString + 'T12:00:00' : dateString;
    const date = new Date(s);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: undefined
    });
}

function createFoodHubsChart() {
    const ctx = document.getElementById('foodHubsChart');
    if (!ctx) return; // Chart container doesn't exist yet

    // Food hubs data from Fardkhales, Lincoln, and Heaivilin (forthcoming)
    const foodHubsData = {
        labels: ['2021', '2022', '2023', '2024'],
        snapBenefits: [136000, 723000, 931000, 1117000],
        doubleBucks: [109000, 261000, 358000, 479000],
        totalImpact: [245000, 984000, 1289000, 1596000]
    };

    charts.foodHubs = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: foodHubsData.labels,
            datasets: [
                {
                    label: 'SNAP Benefits',
                    data: foodHubsData.snapBenefits,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 1
                },
                {
                    label: 'Double Bucks',
                    data: foodHubsData.doubleBucks,
                    backgroundColor: 'rgba(5, 150, 105, 0.7)',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Total Impact',
                    data: foodHubsData.totalImpact,
                    backgroundColor: 'rgba(217, 119, 6, 0.7)',
                    borderColor: '#d97706',
                    borderWidth: 1,
                    type: 'line',
                    fill: false,
                    borderWidth: 3
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Food Hubs SNAP & Double Bucks Sales Growth (2021-2024)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}
