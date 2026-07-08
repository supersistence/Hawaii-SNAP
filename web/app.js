// Hawaii SNAP Data Visualization App

// Global data storage
let monthlyData = null;
let countyData = null;
let trendsData = null;
let metadata = null;
let dhsData = null;
let retailerData = null;
let foodbankData = null;
let participationData = null;

// Chart instances
const charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    setupNav();
    try {
        await loadData();           // throws only if required (core) data fails
        themeChartDefaults();
        initializeCharts();
        themeCharts();
        annotateEvents();
        populateStats();
        buildIsotypes();
        updateDataCurrency();
        setupScrolly();
        hideLoading();
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to load data. Please refresh the page.');
    }
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
    const sum = (metadata && metadata.summary) || {};
    const end = monthYear(sum.endDate) || 'May 2026';
    const spliceYr = sum.spliceDate ? new Date(sum.spliceDate + 'T12:00:00').getFullYear() : null;
    const gen = monthYear(metadata && metadata.generated);

    const badge = document.getElementById('data-badge');
    if (badge) badge.textContent = spliceYr ? `1989–${end} · USDA + DHS` : `Through ${end}`;

    const foot = document.getElementById('footer-currency');
    if (foot) {
        let t = spliceYr
            ? `Participation series: <strong>USDA federal</strong> (1989–${spliceYr}) + <strong>Hawai‘i DHS</strong> (${spliceYr}–${end})`
            : `Series current through <strong>${end}</strong>`;
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
        const cap = document.getElementById('iso-cap');
        if (cap) {
            const maui = countyData.counties.find(c => c.name === 'MAUI');
            const src = (monthlyData.metadata.spliceDate && monthlyData.metadata.endDate >= monthlyData.metadata.spliceDate) ? 'DHS' : 'USDA FNS';
            cap.innerHTML = `${formatNumber(snap)} of ${formatNumber(totalPop)} residents `
                + `(${src}, ${formatDate(monthlyData.metadata.endDate)} ÷ Hawai‘i State Census, ${countyData.populationYear}). `
                + `The shaded group is essentially the entire population of Maui County`
                + (maui ? ` (${formatNumber(maui.population)})` : '') + '.';
        }
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
            if (ds.skipTheme) return;   // e.g. the faint population context line
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

    const L = monthlyData.labels, P = monthlyData.datasets.persons;
    const at = (d) => P[L.indexOf(d)];
    const peakIn = (a, b) => {
        let mx = -1; L.forEach((d, i) => { if (d >= a && d <= b && P[i] > mx) mx = P[i]; });
        return mx;
    };
    const latest = monthlyData.metadata.latestPersons;
    const baseline = trendsData.periods.preCovidAvg.persons;
    const recPeak = peakIn('2008-01-01', '2014-06-01');
    const octPeak = at('2025-10-01') || peakIn('2025-08-01', '2025-12-01');

    // Six acts walking the participation line. (The "scale" view moved to Overview.)
    const acts = [
        { range: ['1989-01-01', '2008-01-01'], n: '~110K', note: 'stable', noteL: '1989–2008 floor' },
        { range: ['2008-01-01', '2014-06-01'], n: formatNumber(recPeak),
          note: '+' + Math.round((recPeak / at('2008-01-01') - 1) * 100) + '%', noteL: 'recession climb' },
        { range: ['2020-03-01', '2022-06-01'], n: '206,226', note: 'all-time peak', noteL: 'July 2021' },
        { range: ['2023-08-01', '2023-12-01'], n: formatNumber(at('2023-11-01')), note: '+25% Maui', noteL: 'Aug–Nov 2023' },
        { range: ['2025-08-01', monthlyData.metadata.endDate], n: formatNumber(latest),
          note: '−' + Math.abs(Math.round((latest / octPeak - 1) * 100)) + '%', noteL: 'since Oct 2025 peak' },
        { range: null, n: formatNumber(latest),
          note: '+' + Math.round((latest / baseline - 1) * 100) + '%', noteL: 'vs 2019 baseline' },
    ];
    // Keep the Act 6 prose in sync with the computed "vs 2019 baseline" figure.
    const vb = document.getElementById('vs-baseline');
    if (vb) vb.textContent = Math.round((latest / baseline - 1) * 100) + '%';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setAct = (i) => {
        const a = acts[i];
        document.getElementById('ro-persons').textContent = a.n;
        document.getElementById('ro-note').textContent = a.note;
        document.getElementById('ro-note-l').textContent = a.noteL;
        const ch = charts.overview;
        const ann = {};
        if (a.range) ann.band = { type: 'box', xMin: a.range[0], xMax: a.range[1],
            backgroundColor: hexA('#1d6b3f', 0.10), borderWidth: 0 };
        if (i === 2) ann.peak = { type: 'point', xValue: '2021-07-01', yValue: 206226, radius: 4,
            backgroundColor: '#1d6b3f', borderColor: '#fffff8', borderWidth: 1.5 };
        ch.options.plugins.annotation = { annotations: ann };
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
    setAct(reduce ? 5 : 0);
}

// Load data from JSON files
// Fetch JSON with a hard timeout so one stalled request can never hang the
// whole page (the spinner is gated behind this — no timeout = infinite spinner).
async function fetchJSON(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

async function loadData() {
    // Everything in parallel. Core four are required (a rejection here bubbles
    // up and shows the error state); DHS + retailers are optional — their
    // .catch keeps a slow/missing file from blocking the rest of the page.
    const [monthly, county, trends, meta, dhs, retailers, foodbanks, participation] = await Promise.all([
        fetchJSON('data/monthly.json'),
        fetchJSON('data/county.json'),
        fetchJSON('data/trends.json'),
        fetchJSON('data/metadata.json'),
        fetchJSON('data/dhs.json').catch(e => { console.warn('DHS data optional:', e); return null; }),
        fetchJSON('data/retailers.json').catch(e => { console.warn('Retailer data optional:', e); return null; }),
        fetchJSON('data/foodbanks.json').catch(e => { console.warn('Food-bank data optional:', e); return null; }),
        fetchJSON('data/participation.json').catch(e => { console.warn('Participation-rate data optional:', e); return null; }),
    ]);

    monthlyData = monthly;
    countyData = county;
    trendsData = trends;
    metadata = meta;
    if (dhs) dhsData = dhs;
    if (retailers) retailerData = retailers;
    if (foodbanks) foodbankData = foodbanks;
    if (participation) participationData = participation;

    console.log('Data loaded successfully');
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

    // Overview stats — all from the spliced series (USDA pre-2008 + DHS since),
    // so the latest month is current (May 2026) and DHS-sourced. One label.
    const src = (meta.spliceDate && meta.endDate >= meta.spliceDate) ? 'DHS' : 'USDA';
    const dateLabel = `${src} · ${formatDate(meta.endDate)}`;

    document.getElementById('stat-persons').textContent = formatNumber(meta.latestPersons);
    document.getElementById('stat-persons-date').textContent = dateLabel;

    document.getElementById('stat-households').textContent = formatNumber(meta.latestHouseholds);
    document.getElementById('stat-households-date').textContent = dateLabel;

    document.getElementById('stat-benefit').textContent = `$${formatNumber(meta.latestAvgBenefitPerHousehold)}`;
    document.getElementById('stat-benefit-date').textContent = dateLabel;

    document.getElementById('stat-cost').textContent = `$${formatMoney(meta.latestTotalCost)}`;
    document.getElementById('stat-cost-date').textContent = dateLabel;

    // Populate text content
    document.getElementById('avg-persons').textContent = formatNumber(summary.averages.persons);
    document.getElementById('peak-date').textContent = formatDate(summary.peak.persons.date);
    document.getElementById('peak-persons').textContent = formatNumber(summary.peak.persons.value);
    document.getElementById('latest-date').textContent = formatDate(meta.endDate);
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
    createScaleChart();
    createOverviewChart();
    createHouseholdsChart();
    createBenefitChart();
    createCostChart();
    createCovidChart();
    createCountyChart();
    createPAChart();
    createFoodHubsChart();
    if (retailerData) { createRetailerMap(); createRetailerTypeChart(); }
    if (foodbankData) createFoodbankMap();
    // The statewide DHS line is now part of the spliced main charts; the DHS
    // section is gone. Only its unique pieces remain: timeliness (in Recipients)
    // and latest-month-by-county (in Counties).
    if (dhsData) { createDHSTimelinessChart(); populateDHSCounties(); }
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

// Overview "scale" view: participation and population on ONE shared axis,
// so the caseload reads as the ~1-in-9 slice it is. (Moved here from the arc.)
function createScaleChart() {
    const el = document.getElementById('scaleChart');
    if (!el || !monthlyData.datasets.population) return;

    // Residents ELIGIBLE for SNAP, implied per month as caseload ÷ that fiscal
    // year's FNS participation rate — so the band tracks the caseload's shape,
    // the vertical gap is exactly (1 − rate), and the band can never dip below
    // enrollment (at a 100% rate they touch, as in 1998–99). Gaps (FY95–96,
    // FY2021) are real — FNS published no estimate those years.
    let eligibleSeries = null;
    const byFY = new Map((participationData?.years || [])
        .filter(y => y.hawaiiRate)
        .map(y => [y.fiscalYear, y]));
    if (byFY.size) {
        eligibleSeries = monthlyData.labels.map((l, i) => {
            const [yr, mo] = l.split('-').map(Number);
            const fy = byFY.get(mo >= 10 ? yr + 1 : yr);
            const persons = monthlyData.datasets.persons[i];
            return fy && persons ? Math.round(persons / (fy.hawaiiRate / 100)) : null;
        });
    }

    charts.scale = new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Hawai‘i population',
                    data: monthlyData.datasets.population,
                    borderColor: '#b8b3a0', borderWidth: 1.4, borderDash: [4, 3],
                    fill: false, pointRadius: 0, skipTheme: true,
                },
                ...(eligibleSeries ? [{
                    label: 'Eligible for SNAP (implied by FNS annual rate)',
                    data: eligibleSeries,
                    borderColor: '#c47f17', borderWidth: 1.6, borderDash: [7, 4],
                    fill: false, pointRadius: 0, spanGaps: false, skipTheme: true,
                }] : []),
                {
                    label: 'Persons receiving SNAP',
                    data: monthlyData.datasets.persons,
                    borderColor: '#1d6b3f', backgroundColor: 'rgba(29,107,63,0.08)',
                    borderWidth: 2.2, fill: true, pointRadius: 0, skipTheme: true,
                },
                ...(monthlyData.datasets.participationRate ? [{
                    label: 'Share of residents on SNAP',
                    data: monthlyData.datasets.participationRate,
                    borderColor: '#075985', borderWidth: 1.6, fill: false, pointRadius: 0,
                    yAxisID: 'y1', skipTheme: true,
                }] : []),
            ],
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                legend: { ...chartDefaults.plugins.legend, display: true },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: (c) => formatDate(c[0].parsed.x),
                        label: (c) => c.dataset.yAxisID === 'y1'
                            ? c.dataset.label + ': ' + c.parsed.y + '%'
                            : c.dataset.label + ': ' + formatNumber(c.parsed.y),
                        afterLabel: (c) => {
                            if (!c.dataset.label.startsWith('Eligible for SNAP')) return undefined;
                            const d = new Date(c.parsed.x);
                            const fy = byFY.get(d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear());
                            return fy ? `FY${fy.fiscalYear}: ${fy.hawaiiRate}% of eligible enrolled ` +
                                        `(90% CI ${fy.ciLow}–${fy.ciHigh}%; US ${fy.usRate}%)` : undefined;
                        },
                    },
                },
            },
            scales: {
                x: { type: 'time', time: { unit: 'year', displayFormats: { year: 'yyyy' } },
                     ticks: { maxTicksLimit: 8 } },
                y: { beginAtZero: true, max: 1500000,
                     ticks: { callback: (v) => v >= 1e6 ? (v / 1e6) + 'M' : formatNumber(v) } },
                y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false },
                      title: { display: true, text: 'Share of residents' },
                      ticks: { callback: (v) => v + '%' } },
            },
        },
    });
}

function createOverviewChart() {
    const ctx = document.getElementById('overviewChart').getContext('2d');

    // Full 1989–2026 range: the scrollytelling arc walks the whole story.
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
                        label: (c) => formatNumber(c.parsed.y) + ' persons',
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
    const startIndex = 0;  // full spliced series (1989–2026)

    charts.households = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels.slice(startIndex),
            datasets: [
                {
                    label: 'Persons participating',
                    data: monthlyData.datasets.persons.slice(startIndex),
                    borderColor: '#1d6b3f',
                    backgroundColor: 'rgba(29, 107, 63, 0.07)',
                    borderWidth: 2.2, fill: true, pointRadius: 0,
                },
                {
                    label: 'Households participating',
                    data: monthlyData.datasets.households.slice(startIndex),
                    borderColor: '#075985',
                    borderWidth: 1.8, fill: false, pointRadius: 0,
                },
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: { type: 'time', time: { unit: 'year' }, ticks: { maxTicksLimit: 8 } },
                y: {
                    beginAtZero: false,
                    ticks: { callback: (value) => formatNumber(value) }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                legend: { ...chartDefaults.plugins.legend, display: true },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        title: (context) => formatDate(context[0].parsed.x),
                        label: (c) => c.dataset.label + ': ' + formatNumber(c.parsed.y),
                    }
                }
            }
        }
    });
}

// ponytail: createRateChart + createPersonsChart removed — rate now rides the
// Overview scale chart's right axis; persons + households share one chart.

function createBenefitChart() {
    const ctx = document.getElementById('benefitChart').getContext('2d');
    const startIndex = 0;  // full spliced series (1989–2026)

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
    const startIndex = 0;  // full spliced series (1989–2026)

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

// ---- SNAP retailer network: dot map + store-type breakdown -----------
const RETAIL_CAT = {
    grocery:     { label: 'Grocery & supermarket',          color: '#1d6b3f' },
    convenience: { label: 'Convenience store',              color: '#b45309' },
    local:       { label: "Farmers' market / produce",      color: '#0f766e' },
    specialty:   { label: 'Specialty (meat, seafood, etc.)', color: '#9a9a8c' },
};
function retailCat(t) {
    t = String(t).toLowerCase();
    if (t.includes('convenience')) return 'convenience';
    if (t.includes("farmers") || t.includes('fruits') || t.includes('veg')) return 'local';
    if (['grocery', 'super', 'supermarket'].some(k => t.includes(k))) return 'grocery';
    return 'specialty';
}

// Shared hover tooltip for the SVG dot maps (retailers + food banks).
function escAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function attachMapTooltip(mapEl) {
    if (!mapEl) return;
    let tip = mapEl.querySelector('.map-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'map-tip'; mapEl.appendChild(tip); }
    const svg = mapEl.querySelector('svg');
    if (!svg) return;
    const show = (t, e) => {
        const name = t.getAttribute('data-name'); if (!name) { tip.style.display = 'none'; return; }
        const sub = t.getAttribute('data-sub'), addr = t.getAttribute('data-addr');
        tip.innerHTML = `<strong>${name}</strong>` + (sub ? `<span>${sub}</span>` : '') + (addr ? `<span class="addr">${addr}</span>` : '');
        tip.style.display = 'block';
        const r = mapEl.getBoundingClientRect();
        let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
        if (x + tip.offsetWidth > r.width) x = e.clientX - r.left - tip.offsetWidth - 8;
        tip.style.left = Math.max(0, x) + 'px'; tip.style.top = y + 'px';
    };
    svg.addEventListener('mousemove', (e) => {
        if (svg.classList.contains('dragging')) { tip.style.display = 'none'; return; }
        const t = e.target;
        if ((t.tagName === 'circle' || t.tagName === 'path') && t.hasAttribute('data-name')) show(t, e);
        else tip.style.display = 'none';
    });
    svg.addEventListener('mouseleave', () => tip.style.display = 'none');
}

// Pan + zoom for the SVG dot maps — Tufte-minimal chrome: drag to pan,
// wheel / double-click to zoom to the cursor, one hairline ⌂ button (shown
// only while zoomed) to restore. Zoom state persists on the element across
// re-renders (e.g. the food-bank color toggle).
function attachPanZoom(mapEl) {
    const svg = mapEl.querySelector('svg');
    if (!svg) return;
    const a = (svg.getAttribute('viewBox') || '0 0 760 495').split(/\s+/).map(Number);
    const orig = { x: a[0], y: a[1], w: a[2], h: a[3] };
    let vb = mapEl._vb ? { ...mapEl._vb } : { ...orig };

    let home = mapEl.querySelector('.map-home');
    if (!home) {
        home = document.createElement('button');
        home.className = 'map-home'; home.type = 'button';
        home.title = 'Reset view'; home.setAttribute('aria-label', 'Reset map view');
        home.textContent = '⌂';
        mapEl.appendChild(home);
    }
    const clamp = () => {
        if (vb.w >= orig.w) { vb.x = orig.x; vb.y = orig.y; return; }
        vb.x = Math.min(Math.max(vb.x, orig.x), orig.x + orig.w - vb.w);
        vb.y = Math.min(Math.max(vb.y, orig.y), orig.y + orig.h - vb.h);
    };
    const apply = () => {
        svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
        mapEl._vb = { ...vb };
        home.style.display = (vb.w < orig.w - 0.5) ? 'flex' : 'none';
        // Keep dots/stars from ballooning with zoom: grow ~sqrt(zoom), capped.
        const rect = svg.getBoundingClientRect();
        if (rect.width) {
            const z = orig.w / vb.w, pxPerUnit = rect.width / vb.w;
            const dotPx = Math.min(1.7 * Math.pow(z, 0.5), 4.2);      // dot screen radius, capped
            svg.style.setProperty('--dotr', (dotPx / pxPerUnit).toFixed(3) + 'px');
            const starHalf = Math.min(5.2 * Math.pow(z, 0.4), 9) / pxPerUnit; // star half-size (user units)
            const sc = (starHalf / 6).toFixed(3);
            svg.querySelectorAll('path[data-x]').forEach(p => {
                p.setAttribute('transform', `translate(${p.getAttribute('data-x')},${p.getAttribute('data-y')}) scale(${sc})`);
            });
        }
    };
    home.onclick = () => { vb = { ...orig }; apply(); };

    const toSvg = (e) => {
        const r = svg.getBoundingClientRect();
        return { x: vb.x + (e.clientX - r.left) / r.width * vb.w,
                 y: vb.y + (e.clientY - r.top) / r.height * vb.h };
    };
    const zoomAt = (p, factor) => {
        let nw = vb.w * factor, nh = vb.h * factor;
        if (nw > orig.w) { nw = orig.w; nh = orig.h; }
        const minW = orig.w / 12;
        if (nw < minW) { nw = minW; nh = orig.h * (minW / orig.w); }
        vb.x = p.x - (p.x - vb.x) * (nw / vb.w);
        vb.y = p.y - (p.y - vb.y) * (nh / vb.h);
        vb.w = nw; vb.h = nh; clamp(); apply();
    };
    svg.onwheel = (e) => { e.preventDefault(); zoomAt(toSvg(e), e.deltaY < 0 ? 0.82 : 1 / 0.82); };
    svg.ondblclick = (e) => { e.preventDefault(); zoomAt(toSvg(e), 0.6); };

    let dragging = false, last = null, moved = false;
    svg.addEventListener('pointerdown', (e) => {
        dragging = true; moved = false; last = { x: e.clientX, y: e.clientY };
        svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) { moved = true; svg.classList.add('dragging'); }
        const r = svg.getBoundingClientRect();
        vb.x -= dx * vb.w / r.width; vb.y -= dy * vb.h / r.height;
        last = { x: e.clientX, y: e.clientY }; clamp(); apply();
    });
    const end = () => { dragging = false; svg.classList.remove('dragging'); };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    apply();
}

// ---- Food-bank network map (Community section) ----------------------------
// Dots = pantry / distribution partner sites, colored by which of the three
// island food banks operates the network; stars = the food banks themselves.
const FOODBANK_NET = {
    hfb:    { label: 'Hawai‘i Foodbank (O‘ahu · Kaua‘i)', color: '#0f766e' },
    maui:   { label: 'Maui Food Bank (Maui County)',      color: '#b45309' },
    basket: { label: 'The Food Basket (Hawai‘i Island)',  color: '#6243a4' },
};
const FOODBANK_CAT = {
    pantry:  { label: 'Food pantry / groceries',   color: '#b45309' },
    produce: { label: 'Fresh produce distribution', color: '#1d6b3f' },
    meals:   { label: 'Prepared meals / soup kitchen', color: '#6243a4' },
    mobile:  { label: 'Mobile pantry',              color: '#075985' },
};
let foodbankMode = 'net';   // 'net' = by food bank, 'cat' = by program type
function createFoodbankMap() {
    const el = document.getElementById('foodbankMap');
    if (!el || !foodbankData) return;
    const render = () => {
        const m = foodbankData;
        const scheme = foodbankMode === 'net' ? FOODBANK_NET : FOODBANK_CAT;
        const keyOf = s => foodbankMode === 'net' ? s.n : s.c;
        let svg = `<svg viewBox="0 0 ${m.w} ${m.h}" xmlns="http://www.w3.org/2000/svg">`;
        m.paths.forEach(p => { svg += `<path class="sea" d="${p}"/>`; });
        Object.keys(scheme).forEach(k => {
            const col = scheme[k].color;
            m.sites.filter(s => keyOf(s) === k).forEach(s => {
                const sub = `${FOODBANK_CAT[s.c].label} · ${FOODBANK_NET[s.n].label.split(' (')[0]}`;
                svg += `<circle cx="${s.x}" cy="${s.y}" r="2" fill="${col}" fill-opacity="0.72" data-name="${escAttr(s.name)}" data-sub="${escAttr(sub)}" data-addr="${escAttr(s.addr)}"/>`;
            });
        });
        // food banks themselves — star markers on top (colored by network in both modes)
        (m.banks || []).forEach(b => {
            svg += `<path data-x="${b.x}" data-y="${b.y}" transform="translate(${b.x},${b.y})" d="M0,-6 L1.8,-1.9 L6,-1.9 L2.6,1.1 L3.9,5.6 L0,3 L-3.9,5.6 L-2.6,1.1 L-6,-1.9 L-1.8,-1.9 Z" fill="${FOODBANK_NET[b.n].color}" stroke="#141414" stroke-width="0.6" data-name="${escAttr(b.name)}" data-sub="Food bank"/>`;
        });
        svg += '</svg>';
        el.innerHTML = svg;
        attachMapTooltip(el);
        attachPanZoom(el);
        const leg = document.getElementById('foodbankLegend');
        if (leg) leg.innerHTML = Object.keys(scheme).map(k => {
            const n = m.sites.filter(s => keyOf(s) === k).length;
            return `<span class="item"><span class="dot" style="background:${scheme[k].color}"></span>${scheme[k].label} · ${n}</span>`;
        }).join('') + `<span class="item"><span class="dot" style="background:#141414;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"></span>food bank</span>`;
    };
    render();
    const toggle = document.getElementById('foodbankToggle');
    if (toggle && !toggle.dataset.wired) {
        toggle.dataset.wired = '1';
        toggle.querySelectorAll('.mt-btn').forEach(btn => btn.addEventListener('click', () => {
            foodbankMode = btn.dataset.mode;
            toggle.querySelectorAll('.mt-btn').forEach(b => b.classList.toggle('active', b === btn));
            render();
        }));
    }
}

function createRetailerMap() {
    const el = document.getElementById('retailerMap');
    if (!el || !retailerData) return;
    const m = retailerData.map;
    const order = ['grocery', 'convenience', 'specialty', 'local']; // local on top
    let svg = `<svg viewBox="0 0 ${m.w} ${m.h}" xmlns="http://www.w3.org/2000/svg">`;
    m.paths.forEach(p => { svg += `<path class="sea" d="${p}"/>`; });
    order.forEach(c => {
        const col = RETAIL_CAT[c].color;
        m.points.filter(pt => pt.c === c).forEach(pt => {
            svg += `<circle cx="${pt.x}" cy="${pt.y}" r="1.9" fill="${col}" fill-opacity="0.72" data-name="${escAttr(pt.name)}" data-sub="${escAttr(pt.t || RETAIL_CAT[c].label)}"/>`;
        });
    });
    svg += '</svg>';
    el.innerHTML = svg;
    attachMapTooltip(el);
    attachPanZoom(el);
    const leg = document.getElementById('retailerLegend');
    if (leg) leg.innerHTML = order.map(c => {
        const n = m.points.filter(pt => pt.c === c).length;
        return `<span class="item"><span class="dot" style="background:${RETAIL_CAT[c].color}"></span>${RETAIL_CAT[c].label} · ${n}</span>`;
    }).join('');
}

function createRetailerTypeChart() {
    const el = document.getElementById('retailerTypeChart');
    if (!el || !retailerData) return;
    const tc = retailerData.typeCounts.slice(0, 12);
    charts.retailerType = new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
            labels: tc.map(x => x.type),
            datasets: [{
                data: tc.map(x => x.count),
                backgroundColor: tc.map(x => RETAIL_CAT[retailCat(x.type)].color),
                borderRadius: 2, maxBarThickness: 22, skipTheme: true,
            }],
        },
        options: {
            ...chartDefaults,
            indexAxis: 'y',
            plugins: {
                ...chartDefaults.plugins,
                legend: { display: false },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: { label: (c) => formatNumber(c.parsed.x) + ' stores' },
                },
            },
            scales: {
                x: { ticks: { callback: (v) => formatNumber(v) } },
                y: { ticks: { font: { size: 11 }, autoSkip: false } },
            },
        },
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
