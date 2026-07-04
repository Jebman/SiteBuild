// ── dashboard.js — date‑based logging & chart updates ──

// ── Data storage: each metric maps date (YYYY-MM-DD) to value ──
const metricData = {
  hrv:     {},
  sleep:   {},
  steps:   {},
  battery: {}
};

// ── Default sample data (seeded for demo) ──
function seedDefaultData() {
  const today = new Date();
  const defaults = {
    hrv:     [40,42,44,41,45,43,46,44,47,45,48,46,49,50,48,50,51,49,52,51,52],
    sleep:   [78,82,80,85,83,81,84,86,82,80,79,83,85,82,84,81,83,85,82,84,84],
    steps:   [6200,7800,8100,6400,9200,8600,7200,10100,8400,7600,9800,8200,8900,7400,10200,8600,9100,8200,8800,8100,8432],
    battery: [55,58,52,60,56,48,62,58,54,60,57,52,64,60,56,62,58,55,62,60,62]
  };

  for (const key in defaults) {
    const arr = defaults[key];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - arr.length + 1);
    for (let i = 0; i < arr.length; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      metricData[key][dateStr] = arr[i];
    }
  }
}
seedDefaultData();

// ── Load from localStorage ──
function loadMetricData() {
  const stored = localStorage.getItem('healthMetricDateData');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      for (const key in parsed) {
        if (metricData[key]) {
          // Merge: override existing dates with stored ones
          for (const date in parsed[key]) {
            metricData[key][date] = parsed[key][date];
          }
        }
      }
    } catch(e) { console.warn('Failed to parse stored data'); }
  }
}
loadMetricData();

// ── Save to localStorage ──
function saveMetricData() {
  localStorage.setItem('healthMetricDateData', JSON.stringify(metricData));
}

// ── Helper: get sorted dates and values for a metric ──
function getSortedEntries(key) {
  const obj = metricData[key];
  const dates = Object.keys(obj).sort();
  const values = dates.map(d => obj[d]);
  return { dates, values };
}

// ── Sparklines (use values array) ──
function sparkline(id, color, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  if (data.length === 0) { ctx.clearRect(0,0,W,H); return; }
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// ── Radar charts (unchanged) ──
function radar(id, vals, color) { /* ... same as before ... */ }

// ── Metric area charts ──
function metricChart(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || 400;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  if (data.length === 0) { ctx.clearRect(0,0,W,H); return; }
  const min = Math.min(...data) * 0.9, max = Math.max(...data) * 1.05;
  const range = max - min || 1;
  const pad = 2;
  ctx.clearRect(0, 0, W, H);
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  [0.25, 0.5, 0.75].forEach(f => {
    const y = H - f * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });
  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - ((v - min) / range) * (H - pad * 2) - pad;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(W - pad, H); ctx.lineTo(pad, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // Line
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - ((v - min) / range) * (H - pad * 2) - pad;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// ── Update UI for a metric ──
function updateMetricUI(key) {
  const { dates, values } = getSortedEntries(key);
  if (values.length === 0) return;

  const latestVal = values[values.length - 1];
  const meta = window.__metricConfig[key]; // defined below
  const card = document.querySelector(`.metric-card[data-metric="${key}"]`);
  if (!card) return;

  // Update big number
  const bigEl = card.querySelector(meta.bigSelector);
  if (bigEl) {
    bigEl.textContent = meta.currentDisplay(latestVal);
  }

  // Update 7‑day average (last 7 entries)
  const avgEl = card.querySelector('.avg-display');
  if (avgEl) {
    const last7 = values.slice(-7);
    const avg = last7.reduce((a,b) => a + b, 0) / last7.length;
    avgEl.textContent = Math.round(avg);
  }

  // Update trend (compare last two entries)
  const changeEl = card.querySelector('.metric-change');
  if (changeEl && values.length >= 2) {
    const prev = values[values.length - 2];
    const diff = ((latestVal - prev) / prev * 100);
    const sign = diff >= 0 ? '▲' : '▼';
    const cls = diff >= 0 ? 'up' : 'down';
    const absDiff = Math.abs(diff).toFixed(0);
    changeEl.innerHTML = `<span class="${cls}">${sign} ${absDiff}%</span> <span class="metric-change-label">Last entry</span>`;
  }

  // Redraw chart
  metricChart(meta.chartId, values, meta.color);
  if (meta.sparkId) {
    sparkline(meta.sparkId, meta.color, values);
  }

  // Update the "current value for this date" on the back if the card is open
  const dateInput = document.getElementById(`date-${key}`);
  const currentSpan = document.getElementById(`current-${key}`);
  if (dateInput && currentSpan) {
    const selectedDate = dateInput.value;
    if (selectedDate && metricData[key][selectedDate] !== undefined) {
      currentSpan.textContent = metricData[key][selectedDate];
    } else {
      currentSpan.textContent = '—';
    }
  }
}

// ── Metric configuration ──
window.__metricConfig = {
  hrv:     { name: 'Heart Rate Variability', unit: 'MS', color: '#39d98a', chartId: 'chart1', sparkId: 'sp2', bigSelector: '.metric-big', currentDisplay: (v) => v },
  sleep:   { name: 'Sleep Quality', unit: '/ 100', color: '#4a9eff', chartId: 'chart2', sparkId: 'sp1', bigSelector: '.metric-big', currentDisplay: (v) => v },
  steps:   { name: 'Daily Steps', unit: 'STEPS', color: '#e8621a', chartId: 'chart3', sparkId: 'sp3', bigSelector: '.metric-big', currentDisplay: (v) => (v/1000).toFixed(1) + 'k' },
  battery: { name: 'Body Battery', unit: '/ 100', color: '#a78bfa', chartId: 'chart4', sparkId: null, bigSelector: '.metric-big', currentDisplay: (v) => v }
};

// ── Toast function ──
function showToast(message, metaText) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toastMessage');
  const metaEl = document.getElementById('toastMeta');
  if (!el || !msgEl || !metaEl) return;
  msgEl.innerHTML = message;
  metaEl.textContent = metaText || '';
  el.classList.add('visible');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}

// ── Initial render ──
['hrv', 'sleep', 'steps', 'battery'].forEach(updateMetricUI);

// ── Event Listeners ──
document.addEventListener('DOMContentLoaded', function() {

  // Flip on click of the card front
  document.querySelectorAll('.card-front').forEach(front => {
    front.addEventListener('click', function() {
      const card = this.closest('.metric-card');
      if (card) {
        card.classList.toggle('flipped');
        // Set date input to today and pre‑fill current value
        const key = card.dataset.metric;
        const dateInput = document.getElementById(`date-${key}`);
        const input = document.getElementById(`input-${key}`);
        const currentSpan = document.getElementById(`current-${key}`);
        if (dateInput) {
          const today = new Date().toISOString().split('T')[0];
          dateInput.value = today;
          // Update the current value display
          if (metricData[key] && metricData[key][today] !== undefined) {
            if (currentSpan) currentSpan.textContent = metricData[key][today];
            if (input) input.value = metricData[key][today];
          } else {
            if (currentSpan) currentSpan.textContent = '—';
            if (input) input.value = '';
          }
        }
        // Also update on date change
        if (dateInput) {
          dateInput.addEventListener('change', function() {
            const selected = this.value;
            const key = card.dataset.metric;
            const currentSpan = document.getElementById(`current-${key}`);
            const input = document.getElementById(`input-${key}`);
            if (selected && metricData[key] && metricData[key][selected] !== undefined) {
              if (currentSpan) currentSpan.textContent = metricData[key][selected];
              if (input) input.value = metricData[key][selected];
            } else {
              if (currentSpan) currentSpan.textContent = '—';
              if (input) input.value = '';
            }
          });
        }
      }
    });
  });

  // Close (Cancel) button
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.metric-card');
      if (card) card.classList.remove('flipped');
    });
  });

  // Save button
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const key = this.dataset.save;
      const dateInput = document.getElementById(`date-${key}`);
      const valInput = document.getElementById(`input-${key}`);
      if (!dateInput || !valInput) return;
      const date = dateInput.value;
      const val = parseFloat(valInput.value);
      if (!date) {
        showToast('⚠️ Please select a date', '');
        return;
      }
      if (isNaN(val) || val < 0) {
        showToast('⚠️ Please enter a valid positive number', '');
        return;
      }

      // Store
      metricData[key][date] = val;
      saveMetricData();

      // Update UI
      updateMetricUI(key);

      // Flip back
      const card = this.closest('.metric-card');
      if (card) card.classList.remove('flipped');

      // Toast
      const meta = window.__metricConfig[key];
      const displayVal = meta.currentDisplay(val);
      const shortName = key.charAt(0).toUpperCase() + key.slice(1);
      showToast(`📊 <strong>${shortName}</strong> logged for ${date} → ${displayVal}`, `Total entries: ${Object.keys(metricData[key]).length}`);

      // Clear input
      valInput.value = '';
    });
  });
});

// ── Resize handler ──
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ['hrv', 'sleep', 'steps', 'battery'].forEach(key => {
      const { values } = getSortedEntries(key);
      const meta = window.__metricConfig[key];
      if (values.length > 0) {
        metricChart(meta.chartId, values, meta.color);
      }
    });
  }, 200);
});