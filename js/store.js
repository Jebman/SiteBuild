// store.js — local database

/* -------------------------------------------------
   6b. STORE
   Saves and loads workout logs from localStorage.
   localStorage is like a mini database built into
   every browser. Data persists after you close the tab.
------------------------------------------------- */
const Store = {

  // Save one exercise entry under today's date
  logWorkout(entry) {
    // Load the whole log object (or start fresh if nothing saved yet)
    const log = JSON.parse(localStorage.getItem('workoutLog') || '{}');
    // Each date can have multiple entries (array)
    if (!log[entry.date]) log[entry.date] = [];
    log[entry.date].push(entry);
    // Write it back to localStorage as a JSON string
    localStorage.setItem('workoutLog', JSON.stringify(log));
  },

  // Get all entries for a specific date
  getWorkout(date) {
    const log = JSON.parse(localStorage.getItem('workoutLog') || '{}');
    return log[date] || [];
  },

  // Get every logged date (for history views)
  getAllWorkouts() {
    return JSON.parse(localStorage.getItem('workoutLog') || '{}');
  }
};

