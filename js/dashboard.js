// ── Sparklines ──
// Draws a small line chart inside a canvas element
function sparkline(id, color, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
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

// Sleep quality trend
sparkline('sp1', '#4a9eff', [82,79,85,88,83,80,84,86,84,82,79,81,84,82,84]);
// HRV / recovery
sparkline('sp2', '#39d98a', [44,47,46,50,48,51,49,52,51,50,53,51,52,54,52]);
// Activity / steps
sparkline('sp3', '#e8621a', [7200,8100,6800,9200,8400,7600,9800,8200,8900,7400,10200,8600,9100,8000,8432]);
// Nutrition calories
sparkline('sp4', '#a78bfa', [2200,1980,2350,2100,2280,1920,2400,2150,2080,2310,2190,2020,2280,2100,2140]);
// Stress score (lower = better)
sparkline('sp5', '#39d98a', [35,42,30,28,45,38,25,32,28,35,30,26,28,30,28]);
// Cardiovascular / HR
sparkline('sp6', '#4a9eff', [58,57,59,56,58,55,57,56,55,57,56,55,56,57,56]);


// ── Radar charts ──
// Draws a hexagonal radar/spider chart inside a canvas element
function radar(id, vals, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 30, cy = 30, r = 24;
  ctx.clearRect(0, 0, 60, 60);

  // Concentric ring guides
  [0.3, 0.55, 0.8, 1].forEach(f => {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Axis lines
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }

  // Filled data shape
  ctx.fillStyle = color + '33';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const a = (i / vals.length) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * r * v;
    const py = cy + Math.sin(a) * r * v;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Readiness radar: sleep, recovery, activity, nutrition, stress, cardio
radar('radar',  [0.84, 0.73, 0.70, 0.65, 0.72, 0.80], '#e8621a');
// Overall health composite
radar('radar2', [0.84, 0.73, 0.80, 0.75, 0.82, 0.80], '#39d98a');


// ── Metric area charts ──
// Draws a filled area chart inside a canvas element
function metricChart(id, data, color) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || 400;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const min = Math.min(...data) * 0.9, max = Math.max(...data) * 1.05;
  const range = max - min || 1;
  const pad = 2;

  ctx.clearRect(0, 0, W, H);

  // Horizontal grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  [0.25, 0.5, 0.75].forEach(f => {
    const y = H - f * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });

  // Gradient fill under the line
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

  // Line on top of fill
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

// Data for each metric card
const hrvData   = [40,42,44,41,45,43,46,44,47,45,48,46,49,50,48,50,51,49,52,51,52];
const sleepData = [78,82,80,85,83,81,84,86,82,80,79,83,85,82,84,81,83,85,82,84,84];
const stepsData = [6200,7800,8100,6400,9200,8600,7200,10100,8400,7600,9800,8200,8900,7400,10200,8600,9100,8200,8800,8100,8432];
const battData  = [55,58,52,60,56,48,62,58,54,60,57,52,64,60,56,62,58,55,62,60,62];

// Small delay lets the page finish laying out so canvas widths are correct
setTimeout(() => {
  metricChart('chart1', hrvData,   '#39d98a');
  metricChart('chart2', sleepData, '#4a9eff');
  metricChart('chart3', stepsData, '#e8621a');
  metricChart('chart4', battData,  '#a78bfa');
}, 100);

// Redraw on window resize so charts stay full width
window.addEventListener('resize', () => {
  metricChart('chart1', hrvData,   '#39d98a');
  metricChart('chart2', sleepData, '#4a9eff');
  metricChart('chart3', stepsData, '#e8621a');
  metricChart('chart4', battData,  '#a78bfa');
});
