// store.js — shared data layer for the book library
const STORAGE_KEY = 'kg_library_books';

let books = [];
let nextId = 1;

function loadBooks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) {
                books = parsed;
                nextId = Math.max(...books.map(b => b.id || 0), 0) + 1;
                return;
            }
        }
    } catch (_) {}

    // Seed data
    books = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
          cover: '', rating: 4, status: 'completed',
          notes: 'A classic about the American Dream.',
          dateAdded: Date.now() - 86400000 * 30 },
        { id: 2, title: 'Atomic Habits', author: 'James Clear',
          cover: '', rating: 5, status: 'reading',
          notes: 'Tiny changes, remarkable results.',
          dateAdded: Date.now() - 86400000 * 5 },
        { id: 3, title: 'The Alchemist', author: 'Paulo Coelho',
          cover: '', rating: 3, status: 'want-to-read',
          notes: '', dateAdded: Date.now() - 86400000 * 2 }
    ];
    nextId = 4;
    saveBooks();
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
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

