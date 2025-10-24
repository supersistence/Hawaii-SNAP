// Hawaii SNAP Data Visualization App

// Global data storage
let monthlyData = null;
let countyData = null;
let trendsData = null;
let metadata = null;

// Chart instances
const charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    setupTabs();
    await loadData();
    hideLoading();
    initializeCharts();
    populateStats();
});

// Tab navigation
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                }
            });
        });
    });
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

    // Overview stats
    document.getElementById('stat-persons').textContent = formatNumber(meta.latestPersons);
    document.getElementById('stat-persons-date').textContent = `as of ${formatDate(meta.endDate)}`;

    document.getElementById('stat-households').textContent = formatNumber(meta.latestHouseholds);
    document.getElementById('stat-households-date').textContent = `as of ${formatDate(meta.endDate)}`;

    document.getElementById('stat-benefit').textContent = `$${formatNumber(meta.latestAvgBenefitPerHousehold)}`;
    document.getElementById('stat-benefit-date').textContent = `per month`;

    document.getElementById('stat-cost').textContent = `$${formatMoney(meta.latestTotalCost)}`;
    document.getElementById('stat-cost-date').textContent = `total benefits`;

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

    countyData.counties.forEach(county => {
        const card = document.createElement('div');
        card.className = 'county-card';
        card.innerHTML = `
            <h4>${county.name} County</h4>
            <div class="county-stat">
                <span class="county-stat-label">Total Persons</span>
                <span class="county-stat-value">${formatNumber(county.persons.total)}</span>
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

    // Filter data to start from 1999
    const startIndex = monthlyData.labels.findIndex(date => date >= '1999-01-01');
    const labels = monthlyData.labels.slice(startIndex);
    const households = monthlyData.datasets.households.slice(startIndex);
    const persons = monthlyData.datasets.persons.slice(startIndex);

    charts.overview = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Persons',
                    data: persons,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Households',
                    data: households,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    yAxisID: 'y',
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy'
                        }
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
                        title: function(context) {
                            return formatDate(context[0].parsed.x);
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y);
                        }
                    }
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: undefined
    });
}
