const form = document.getElementById('entry-form');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submit-btn');
const existingWrap = document.getElementById('existing-wrap');

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + (kind || '');
}

function monthInputToDate(value) {
  // <input type="month"> gives "2026-01" -> store as first of month
  return value + '-01';
}

function formatMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function loadExisting() {
  const { data, error } = await supabaseClient
    .from('monthly_data')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    existingWrap.innerHTML = `<p class="empty">Couldn't load existing months: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    existingWrap.innerHTML = `<p class="empty">No months entered yet — add the first one above.</p>`;
    return;
  }

  const rows = data.map(r => `
    <tr>
      <td>${formatMonth(r.month)}</td>
      <td>${r.issuing ?? ''}</td>
      <td>${r.receiving ?? ''}</td>
      <td>${r.factory_loading ?? ''}</td>
      <td>${r.monthly_sales ?? ''}</td>
      <td>${r.net_profit ?? ''}</td>
      <td>${r.total_production ?? ''}</td>
      <td>${r.defective_units ?? ''}</td>
    </tr>
  `).join('');

  existingWrap.innerHTML = `
    <table class="ledger">
      <thead>
        <tr>
          <th>Month</th><th>Issuing</th><th>Receiving</th><th>Factory load</th>
          <th>Sales</th><th>Net profit</th><th>Total prod.</th><th>Defects</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  setStatus('Saving…');

  const payload = {
    month: monthInputToDate(document.getElementById('month').value),
    issuing: parseFloat(document.getElementById('issuing').value),
    receiving: parseFloat(document.getElementById('receiving').value),
    factory_loading: parseFloat(document.getElementById('factory_loading').value),
    monthly_sales: parseFloat(document.getElementById('monthly_sales').value),
    net_profit: parseFloat(document.getElementById('net_profit').value),
    total_production: parseFloat(document.getElementById('total_production').value),
    defective_units: parseFloat(document.getElementById('defective_units').value),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from('monthly_data')
    .upsert(payload, { onConflict: 'month' });

  submitBtn.disabled = false;

  if (error) {
    setStatus('Error: ' + error.message, 'err');
    return;
  }

  setStatus('Saved.', 'ok');
  form.reset();
  loadExisting();
});

loadExisting();