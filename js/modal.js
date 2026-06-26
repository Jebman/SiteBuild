/* -------------------------------------------------
   6e. MODAL FUNCTIONS
   openModal  — shows backdrop + modal, adds first row
   closeModal — hides them, clears form
   addSetRow  — appends a new table row with inputs
   removeRow  — deletes a specific row by id
   saveEntry  — reads all inputs, validates, saves to Store
   showToast  — brief green confirmation message
------------------------------------------------- */
let setCount = 0; // tracks row IDs so they stay unique

function openModal() {
  document.getElementById('modal').style.display = 'block';
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.style.display = 'block';
  backdrop.classList.add('open');       // ← triggers animation fresh each time
  document.getElementById('setsBody').innerHTML = '';
  document.getElementById('inputExercise').value = '';
  document.getElementById('inputNotes').value = '';
  setCount = 0;
  addSetRow();
  document.getElementById('inputExercise').focus();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.style.display = 'none';
  backdrop.classList.remove('open');    // ← resets it so animation works next open
}

function addSetRow() {
  setCount++;
  const row = document.createElement('tr');
  row.id = `set-${setCount}`;
  row.innerHTML = `
    <td style="color:var(--muted2);font-size:10px;font-family:var(--mono)">${setCount}</td>
    <td><input type="number" id="weight-${setCount}" placeholder="80" step="0.5" min="0"/></td>
    <td><input type="number" id="reps-${setCount}"   placeholder="8"  step="1"   min="0"/></td>
    <td><input type="number" id="rpe-${setCount}"    placeholder="8"  step="0.5" min="1" max="10"/></td>
    <td><button class="btn-remove-row" onclick="removeRow(${setCount})">✕</button></td>
  `;
  document.getElementById('setsBody').appendChild(row);
}

function removeRow(id) {
  const row = document.getElementById(`set-${id}`);
  if (row) row.remove();
}

function saveEntry() {
  // 1. Get exercise name
  const exercise = document.getElementById('inputExercise').value.trim();
  if (!exercise) {
    document.getElementById('inputExercise').focus();
    return;
  }

  // 2. Collect every visible set row
  const rows = document.getElementById('setsBody').querySelectorAll('tr');
  const sets = [];
  rows.forEach(row => {
    const id = row.id.replace('set-', '');
    const weight = parseFloat(document.getElementById(`weight-${id}`)?.value);
    const reps   = parseInt(document.getElementById(`reps-${id}`)?.value);
    const rpe    = parseFloat(document.getElementById(`rpe-${id}`)?.value);
    // Only include rows the user actually filled in
    if (!isNaN(weight) && !isNaN(reps)) {
      sets.push({ weight, reps, rpe: isNaN(rpe) ? null : rpe });
    }
  });

  if (sets.length === 0) return;

  // 3. Build entry object
  const today = new Date().toISOString().split('T')[0]; // '2026-06-25'
  const entry = {
    date:      today,
    exercise,
    sets,
    notes:     document.getElementById('inputNotes').value.trim(),
    loggedAt:  new Date().toISOString(),
  };

  // 4. Save to localStorage via Store
  Store.logWorkout(entry);

  // 5. Close and confirm
  closeModal();
  const totalVol = sets.reduce((s, set) => s + (set.weight * set.reps), 0);
  showToast(`${sets.length} sets of ${exercise} logged · ${totalVol.toLocaleString()} kg·reps`);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000); // disappears after 3s
}


