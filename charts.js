const COLORS = {
  indigo: '#2d3b6b',
  red: '#b7472a',
  gold: '#c99a3a',
  charcoal: '#1f2320',
};

function formatMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function chartCardHTML(id, title) {
  return `
    <div class="chart-card">
      <div class="chart-head">
        <h2>${title}</h2>
        <button class="ghost" data-canvas="${id}">Download PNG</button>
      </div>
      <canvas id="${id}" height="110"></canvas>
    </div>
  `;
}

function baseOptions(extra) {
  return Object.assign({
    responsive: true,
    plugins: {
      legend: { display: true, labels: { font: { family: 'Inter' } } },
    },
    scales: {
      x: { ticks: { font: { family: 'IBM Plex Mono', size: 11 } } },
      y: { beginAtZero: true, ticks: { font: { family: 'IBM Plex Mono', size: 11 } } },
    },
  }, extra || {});
}

async function main() {
  const wrap = document.getElementById('charts-wrap');

  const { data, error } = await supabaseClient
    .from('monthly_data')
    .select('*')
    .order('month', { ascending: true });

  if (error) {
    wrap.innerHTML = `<p class="empty">Couldn't load data: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    wrap.innerHTML = `<p class="empty">No months entered yet. Go to <a href="index.html">Add data</a> first.</p>`;
    return;
  }

  const labels = data.map(r => formatMonth(r.month));

  wrap.innerHTML = [
    chartCardHTML('chart-issuing-receiving', 'Monthly issuing & receiving'),
    chartCardHTML('chart-factory-loading', 'Factory loading'),
    chartCardHTML('chart-sales', 'Monthly sales'),
    chartCardHTML('chart-profit', 'Net profit'),
    chartCardHTML('chart-defects', 'Production defects (total vs. defective)'),
  ].join('');

  new Chart(document.getElementById('chart-issuing-receiving'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Issuing', data: data.map(r => r.issuing), backgroundColor: COLORS.indigo },
        { label: 'Receiving', data: data.map(r => r.receiving), backgroundColor: COLORS.gold },
      ],
    },
    options: baseOptions(),
  });

  new Chart(document.getElementById('chart-factory-loading'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Factory loading', data: data.map(r => r.factory_loading), backgroundColor: COLORS.indigo }],
    },
    options: baseOptions(),
  });

  new Chart(document.getElementById('chart-sales'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Monthly sales', data: data.map(r => r.monthly_sales), backgroundColor: COLORS.gold }],
    },
    options: baseOptions(),
  });

  new Chart(document.getElementById('chart-profit'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Net profit', data: data.map(r => r.net_profit), backgroundColor: COLORS.red }],
    },
    options: baseOptions(),
  });

  new Chart(document.getElementById('chart-defects'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Good units',
          data: data.map(r => (r.total_production ?? 0) - (r.defective_units ?? 0)),
          backgroundColor: COLORS.indigo,
        },
        {
          label: 'Defective units',
          data: data.map(r => r.defective_units),
          backgroundColor: COLORS.red,
        },
      ],
    },
    // Stacked so each bar's full height = total production, with the
    // defective portion shown as the red segment within it.
    options: baseOptions({
      scales: {
        x: { stacked: true, ticks: { font: { family: 'IBM Plex Mono', size: 11 } } },
        y: { stacked: true, beginAtZero: true, ticks: { font: { family: 'IBM Plex Mono', size: 11 } } },
      },
    }),
  });

  // Wire up PNG downloads once all charts exist
  document.querySelectorAll('button[data-canvas]').forEach(btn => {
    btn.addEventListener('click', () => {
      const canvasId = btn.getAttribute('data-canvas');
      const chart = Chart.getChart(canvasId);
      if (!chart) return;
      const url = chart.toBase64Image('image/png', 1);
      const a = document.createElement('a');
      a.href = url;
      a.download = canvasId + '.png';
      a.click();
    });
  });
}

main();