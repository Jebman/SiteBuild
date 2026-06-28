
/* -------------------------------------------------
   6a. WORKOUT DATA
   The source of truth for each day's exercises.
   Edit these objects to change your actual routine.
   muscleLoad values are 0.0 (inactive) to 1.0 (max).
------------------------------------------------- */
const DAYS = {
  push: {
    label:'PUSH DAY', color:'#e8621a',
    duration:'55 min', split:'PPL',
    muscles:['Chest','Shoulders','Triceps'],
    exercises:[
      { name:'Barbell Bench Press', muscle:'Chest',                  sets:4, reps:'8',  weight:'80kg',  done:2 },
      { name:'Incline DB Press',    muscle:'Chest (upper)',           sets:3, reps:'10', weight:'28kg',  done:1 },
      { name:'Cable Fly',           muscle:'Chest (isolation)',       sets:3, reps:'12', weight:'15kg',  done:0 },
      { name:'Overhead Press',      muscle:'Shoulders',               sets:4, reps:'8',  weight:'50kg',  done:0 },
      { name:'Lateral Raise',       muscle:'Shoulders (side delt)',   sets:3, reps:'15', weight:'10kg',  done:0 },
      { name:'Tricep Pushdown',     muscle:'Triceps',                 sets:3, reps:'12', weight:'25kg',  done:0 },
      { name:'Overhead Tricep Ext', muscle:'Triceps (long head)',     sets:3, reps:'12', weight:'20kg',  done:0 },
    ],
    muscleLoad:{ chest:1.0, shoulders:0.7, triceps:0.85, biceps:0.0, back:0.0,
                 lats:0.0, quads:0.0, hamstrings:0.0, glutes:0.0, calves:0.0, core:0.15, forearms:0.2 }
  },
  pull: {
    label:'PULL DAY', color:'#39d98a',
    duration:'50 min', split:'PPL',
    muscles:['Back','Biceps','Rear Delt'],
    exercises:[
      { name:'Deadlift',          muscle:'Back / Hamstrings',       sets:4, reps:'5',  weight:'120kg', done:0 },
      { name:'Barbell Row',       muscle:'Back (mid)',               sets:4, reps:'8',  weight:'70kg',  done:0 },
      { name:'Pull-up',           muscle:'Lats',                    sets:3, reps:'10', weight:'BW',    done:0 },
      { name:'Lat Pulldown',      muscle:'Lats (isolation)',        sets:3, reps:'12', weight:'60kg',  done:0 },
      { name:'Face Pull',         muscle:'Rear delt / Rotator cuff',sets:3, reps:'15', weight:'20kg',  done:0 },
      { name:'Barbell Curl',      muscle:'Biceps',                  sets:3, reps:'10', weight:'30kg',  done:0 },
      { name:'Hammer Curl',       muscle:'Biceps (brachialis)',     sets:3, reps:'12', weight:'14kg',  done:0 },
    ],
    muscleLoad:{ chest:0.0, shoulders:0.3, triceps:0.0, biceps:1.0, back:1.0,
                 lats:0.9, quads:0.0, hamstrings:0.5, glutes:0.2, calves:0.0, core:0.3, forearms:0.6 }
  },
  legs: {
    label:'LEG DAY', color:'#b06bff',
    duration:'60 min', split:'PPL',
    muscles:['Quads','Hamstrings','Glutes','Calves'],
    exercises:[
      { name:'Back Squat',          muscle:'Quads / Glutes',         sets:4, reps:'8',  weight:'100kg', done:0 },
      { name:'Romanian Deadlift',   muscle:'Hamstrings / Glutes',    sets:4, reps:'10', weight:'80kg',  done:0 },
      { name:'Leg Press',           muscle:'Quads',                  sets:3, reps:'12', weight:'180kg', done:0 },
      { name:'Leg Curl',            muscle:'Hamstrings (isolation)', sets:3, reps:'12', weight:'45kg',  done:0 },
      { name:'Hip Thrust',          muscle:'Glutes',                 sets:3, reps:'12', weight:'80kg',  done:0 },
      { name:'Walking Lunges',      muscle:'Quads / Glutes',         sets:3, reps:'20', weight:'20kg',  done:0 },
      { name:'Standing Calf Raise', muscle:'Calves',                 sets:4, reps:'15', weight:'60kg',  done:0 },
    ],
    muscleLoad:{ chest:0.0, shoulders:0.0, triceps:0.0, biceps:0.0, back:0.2,
                 lats:0.0, quads:1.0, hamstrings:0.9, glutes:1.0, calves:0.7, core:0.35, forearms:0.1 }
  },
  arms: {
    label:'ARMS DAY', color:'#e8d01a',
    duration:'45 min', split:'PPL+',
    muscles:['Biceps','Triceps','Forearms'],
    exercises:[
      { name:'EZ Bar Curl',         muscle:'Biceps',                 sets:4, reps:'10', weight:'30kg',  done:0 },
      { name:'Incline DB Curl',     muscle:'Biceps (peak)',          sets:3, reps:'12', weight:'12kg',  done:0 },
      { name:'Preacher Curl',       muscle:'Biceps (lower)',         sets:3, reps:'12', weight:'25kg',  done:0 },
      { name:'Skull Crusher',       muscle:'Triceps',                sets:4, reps:'10', weight:'35kg',  done:0 },
      { name:'Dips',                muscle:'Triceps / Chest',        sets:3, reps:'12', weight:'BW',    done:0 },
      { name:'Rope Pushdown',       muscle:'Triceps (isolation)',    sets:3, reps:'15', weight:'20kg',  done:0 },
      { name:'Wrist Curl',          muscle:'Forearms',               sets:3, reps:'15', weight:'15kg',  done:0 },
    ],
    muscleLoad:{ chest:0.2, shoulders:0.1, triceps:1.0, biceps:1.0, back:0.0,
                 lats:0.0, quads:0.0, hamstrings:0.0, glutes:0.0, calves:0.0, core:0.1, forearms:0.9 }
  },
  rest: {
    label:'REST DAY', color:'#5a5850',
    duration:'—', split:'—', muscles:['Recovery'],
    exercises:[],
    muscleLoad:{ chest:0,shoulders:0,triceps:0,biceps:0,back:0,lats:0,
                 quads:0,hamstrings:0,glutes:0,calves:0,core:0,forearms:0 }
  }
};

/* -------------------------------------------------
   6c. RENDER ROUTINE
   Reads the DAYS data and builds the exercise list HTML.
   Called by loadDay() whenever you switch workout type.
------------------------------------------------- */
function vol(ex) {
  if (ex.weight === 'BW') return ex.sets * parseInt(ex.reps);
  return ex.sets * parseInt(ex.reps) * parseFloat(ex.weight);
}

function renderRoutine(key) {
  const d = DAYS[key];
  document.getElementById('routineBadge').textContent = d.label;

  document.getElementById('routineMeta').innerHTML = `
    <div class="routine-meta-item">
      <span class="routine-meta-label">Duration</span>
      <span class="routine-meta-val">${d.duration}</span>
    </div>
    <div class="routine-meta-item">
      <span class="routine-meta-label">Split</span>
      <span class="routine-meta-val">${d.split}</span>
    </div>
    <div class="routine-meta-item">
      <span class="routine-meta-label">Focus</span>
      <span class="routine-meta-val">${d.muscles.join(' · ')}</span>
    </div>
    <div class="routine-meta-item">
      <span class="routine-meta-label">Exercises</span>
      <span class="routine-meta-val"><span style="color:${d.color}">${d.exercises.length}</span></span>
    </div>
  `;

  if (d.exercises.length === 0) {
    document.getElementById('exerciseList').innerHTML =
      `<div style="padding:40px;text-align:center;color:var(--muted);font-size:12px;letter-spacing:0.08em;">
         ACTIVE RECOVERY · NO TRAINING TODAY
       </div>`;
    return;
  }

  document.getElementById('exerciseList').innerHTML = d.exercises.map((e, i) => {
    const v = vol(e);
    const dots = Array.from({length: e.sets}, (_, j) =>
      `<div class="set-dot${j < e.done ? ' done' : ''}"></div>`
    ).join('');
    return `
      <div class="exercise-row">
        <span class="ex-num">${String(i+1).padStart(2,'0')}</span>
        <div>
          <div class="ex-name">${e.name}</div>
          <div class="ex-muscle">${e.muscle}</div>
        </div>
        <div>
          <div class="ex-sets">${e.sets} × ${e.reps} @ ${e.weight}</div>
          <div class="set-dots">${dots}</div>
        </div>
        <div class="ex-vol">
          ${e.weight === 'BW' ? '—' : v.toLocaleString()}<br>
          <span>KG·REP</span>
        </div>
      </div>`;
  }).join('');
}

/* -------------------------------------------------
   6d. RENDER LOAD (body diagram)
   Fills the stat numbers and redraws the SVG body.
------------------------------------------------- */
function renderLoad(key) {
  const d = DAYS[key];
  const tv = d.exercises.reduce((s, e) => s + vol(e), 0);
  const ts = d.exercises.reduce((s, e) => s + e.sets, 0);

  document.getElementById('loadStats').innerHTML = `
    <div class="load-stat">
      <span class="load-stat-label">Total Volume</span>
      <span class="load-stat-val">${tv > 0 ? (tv/1000).toFixed(1) : '—'}</span>
      <span class="load-stat-unit">TONNES</span>
    </div>
    <div class="load-stat">
      <span class="load-stat-label">Total Sets</span>
      <span class="load-stat-val">${ts || '—'}</span>
      <span class="load-stat-unit">SETS</span>
    </div>
    <div class="load-stat">
      <span class="load-stat-label">Exercises</span>
      <span class="load-stat-val">${d.exercises.length || '—'}</span>
      <span class="load-stat-unit">MOVEMENTS</span>
    </div>
  `;

  drawBody(key);

  document.getElementById('bodyLegend').innerHTML = [
    { label:'Primary',   hex:d.color.slice(1), op:'ff' },
    { label:'Secondary', hex:d.color.slice(1), op:'88' },
    { label:'Stabiliser',hex:d.color.slice(1), op:'44' },
    { label:'Inactive',  hex:'5a5850',          op:'ff' },
  ].map(l => `
    <div class="legend-item">
      <div class="legend-swatch" style="background:#${l.hex}${l.op}"></div>
      ${l.label}
    </div>`).join('');
}

function lerpColor(t, hex) {
  if (t < 0.05) return 'rgba(80,78,72,0.35)';
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${Math.min(1, t * 0.85 + 0.15)})`;
}

function drawBody(key) {
  const d = DAYS[key], m = d.muscleLoad, c = d.color;
  const svg = document.getElementById('bodySvg');
  svg.innerHTML = `
  <defs><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/>
  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <ellipse cx="110" cy="28" rx="20" ry="24" fill="rgba(80,78,72,0.3)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
  <rect x="103" y="50" width="14" height="12" rx="3" fill="rgba(80,78,72,0.25)"/>
  <ellipse cx="87" cy="68" rx="14" ry="8" fill="${lerpColor(m.shoulders*0.5,c)}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <ellipse cx="133" cy="68" rx="14" ry="8" fill="${lerpColor(m.shoulders*0.5,c)}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <path d="M88,62 Q110,58 132,62 L136,88 Q110,96 84,88 Z" fill="${lerpColor(m.chest,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.chest>0.5?'filter="url(#glow)"':''}/>
  <line x1="110" y1="62" x2="110" y2="92" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <ellipse cx="80" cy="76" rx="13" ry="10" fill="${lerpColor(m.shoulders,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.shoulders>0.5?'filter="url(#glow)"':''}/>
  <ellipse cx="140" cy="76" rx="13" ry="10" fill="${lerpColor(m.shoulders,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.shoulders>0.5?'filter="url(#glow)"':''}/>
  <path d="M84,88 Q78,100 80,120 L88,120 Q86,100 90,94 Z" fill="${lerpColor(m.lats*0.6,c)}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
  <path d="M136,88 Q142,100 140,120 L132,120 Q134,100 130,94 Z" fill="${lerpColor(m.lats*0.6,c)}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
  <rect x="96" y="92" width="28" height="42" rx="4" fill="${lerpColor(m.core,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <line x1="96" y1="106" x2="124" y2="106" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <line x1="96" y1="120" x2="124" y2="120" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <line x1="110" y1="92" x2="110" y2="134" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <path d="M84,88 Q88,110 88,134 L96,134 L96,92 Z" fill="${lerpColor(m.core*0.6,c)}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
  <path d="M136,88 Q132,110 132,134 L124,134 L124,92 Z" fill="${lerpColor(m.core*0.6,c)}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
  <rect x="66" y="86" width="13" height="38" rx="6" fill="${lerpColor(m.biceps,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.biceps>0.5?'filter="url(#glow)"':''}/>
  <rect x="141" y="86" width="13" height="38" rx="6" fill="${lerpColor(m.biceps,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.biceps>0.5?'filter="url(#glow)"':''}/>
  <rect x="64" y="86" width="13" height="38" rx="6" fill="${lerpColor(m.triceps*0.6,c)}" stroke="${lerpColor(m.triceps,c)}" stroke-width="1" opacity="0.7" ${m.triceps>0.7?'filter="url(#glow)"':''}/>
  <rect x="143" y="86" width="13" height="38" rx="6" fill="${lerpColor(m.triceps*0.6,c)}" stroke="${lerpColor(m.triceps,c)}" stroke-width="1" opacity="0.7" ${m.triceps>0.7?'filter="url(#glow)"':''}/>
  <rect x="67" y="128" width="11" height="36" rx="5" fill="${lerpColor(m.forearms,c)}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <rect x="142" y="128" width="11" height="36" rx="5" fill="${lerpColor(m.forearms,c)}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <ellipse cx="72" cy="172" rx="7" ry="9" fill="rgba(80,78,72,0.25)"/>
  <ellipse cx="148" cy="172" rx="7" ry="9" fill="rgba(80,78,72,0.25)"/>
  <rect x="88" y="134" width="44" height="22" rx="4" fill="${lerpColor(m.glutes*0.4,c)}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <rect x="89" y="156" width="19" height="70" rx="8" fill="${lerpColor(m.quads,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.quads>0.5?'filter="url(#glow)"':''}/>
  <rect x="112" y="156" width="19" height="70" rx="8" fill="${lerpColor(m.quads,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.quads>0.5?'filter="url(#glow)"':''}/>
  <rect x="89" y="158" width="19" height="68" rx="8" fill="${lerpColor(m.hamstrings*0.5,c)}" stroke="${lerpColor(m.hamstrings,c)}" stroke-width="1" opacity="0.55"/>
  <rect x="112" y="158" width="19" height="68" rx="8" fill="${lerpColor(m.hamstrings*0.5,c)}" stroke="${lerpColor(m.hamstrings,c)}" stroke-width="1" opacity="0.55"/>
  <ellipse cx="98" cy="228" rx="10" ry="7" fill="rgba(60,58,52,0.5)" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <ellipse cx="122" cy="228" rx="10" ry="7" fill="rgba(60,58,52,0.5)" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
  <rect x="90" y="236" width="17" height="52" rx="7" fill="${lerpColor(m.calves,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.calves>0.5?'filter="url(#glow)"':''}/>
  <rect x="113" y="236" width="17" height="52" rx="7" fill="${lerpColor(m.calves,c)}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5" ${m.calves>0.5?'filter="url(#glow)"':''}/>
  <ellipse cx="98" cy="294" rx="10" ry="6" fill="rgba(60,58,52,0.4)"/>
  <ellipse cx="122" cy="294" rx="10" ry="6" fill="rgba(60,58,52,0.4)"/>
  ${buildLabels(m,c)}`;
}

function buildLabels(m, c) {
  const pts = [
    { key:'chest',      x:110, y:75,  lx:185, label:'Chest' },
    { key:'shoulders',  x:80,  y:72,  lx:30,  label:'Delts' },
    { key:'triceps',    x:64,  y:105, lx:30,  label:'Triceps' },
    { key:'biceps',     x:67,  y:105, lx:185, label:'Biceps' },
    { key:'forearms',   x:67,  y:148, lx:185, label:'Forearms' },
    { key:'lats',       x:80,  y:104, lx:30,  label:'Lats' },
    { key:'core',       x:110, y:112, lx:185, label:'Core' },
    { key:'quads',      x:98,  y:191, lx:185, label:'Quads' },
    { key:'hamstrings', x:98,  y:195, lx:30,  label:'Hams' },
    { key:'glutes',     x:110, y:142, lx:30,  label:'Glutes' },
    { key:'calves',     x:98,  y:260, lx:185, label:'Calves' },
    { key:'back',       x:110, y:82,  lx:30,  label:'Back' },
  ];
  const used = new Set();
  return pts.filter(p => m[p.key] >= 0.1 && !used.has(p.lx) && used.add(p.lx))
    .map(p => {
      const right = p.lx > 110;
      const alpha = Math.round(m[p.key] * 255).toString(16).padStart(2,'0');
      return `
        <line x1="${p.x}" y1="${p.y}" x2="${right ? p.lx-28 : p.lx+28}" y2="${p.y}"
          stroke="${c}${alpha}" stroke-width="0.7" stroke-dasharray="2,2"/>
        <text x="${right ? p.lx-2 : p.lx+2}" y="${p.y+3.5}"
          font-size="8" font-family="'Courier New',monospace" letter-spacing="0.08em"
          fill="${c}" text-anchor="${right?'end':'start'}" opacity="${Math.min(1,m[p.key]+0.2)}">
          ${p.label.toUpperCase()}
        </text>`;
    }).join('');
}


/* -------------------------------------------------
   6f. SWITCH DAY + INIT
   loadDay — updates pills, dropdown, and both cards
   Runs on page load with 'push' as the default.
------------------------------------------------- */
function loadDay(key) {
  document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
  const pill = document.getElementById('pill-' + key);
  if (pill) pill.classList.add('active');
  document.getElementById('dayPicker').value = key;
  renderRoutine(key);
  renderLoad(key);
}

// Set today's date in topbar
const now = new Date();
document.getElementById('todayDate').textContent =
  now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }).toUpperCase();

// Load push day on page open
loadDay('push');

