// ────────────────────────────────────────
//  STATE
// ────────────────────────────────────────
let books = [];
let nextId = 1;

const STORAGE_KEY = 'kg_library_books';

// ────────────────────────────────────────
//  DOM refs
// ────────────────────────────────────────
const grid = document.getElementById('bookGrid');
const emptyState = document.getElementById('emptyState');
const statsBadge = document.getElementById('statsBadge');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalTitle = document.getElementById('modalTitle');
const modalSubmit = document.getElementById('modalSubmit');
const bookForm = document.getElementById('bookForm');
const editId = document.getElementById('editId');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');
const bookCover = document.getElementById('bookCover');
const bookRating = document.getElementById('bookRating');
const bookStatus = document.getElementById('bookStatus');
const bookNotes = document.getElementById('bookNotes');

// ────────────────────────────────────────
//  THEME
// ────────────────────────────────────────
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;
let dark = false;

const saved = localStorage.getItem('theme');
if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    dark = true;
    root.setAttribute('data-theme', 'dark');
    toggle.textContent = 'light';
}

toggle.addEventListener('click', () => {
    dark = !dark;
    root.setAttribute('data-theme', dark ? 'dark' : '');
    toggle.textContent = dark ? 'light' : 'dark';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
});

// ────────────────────────────────────────
//  STORAGE
// ────────────────────────────────────────
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
    } catch (_) { /* ignore */ }
    // Seed with a couple of example books
    books = [{
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover: '',
        rating: 4,
        status: 'completed',
        notes: 'A classic about the American Dream.',
        dateAdded: Date.now() - 86400000 * 30
    }, {
        id: 2,
        title: 'Atomic Habits',
        author: 'James Clear',
        cover: '',
        rating: 5,
        status: 'reading',
        notes: 'Tiny changes, remarkable results.',
        dateAdded: Date.now() - 86400000 * 5
    }, {
        id: 3,
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        cover: '',
        rating: 3,
        status: 'want-to-read',
        notes: '',
        dateAdded: Date.now() - 86400000 * 2
    }];
    nextId = 4;
    saveBooks();
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    render();
}

// ────────────────────────────────────────
//  RENDER
// ────────────────────────────────────────
function getFilteredAndSorted() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = books;

    if (query) {
        filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            (b.notes && b.notes.toLowerCase().includes(query))
        );
    }

    const sort = sortSelect.value;
    const cmp = (a, b) => {
        switch (sort) {
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'author-asc':
                return a.author.localeCompare(b.author);
            case 'author-desc':
                return b.author.localeCompare(a.author);
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            case 'rating-asc':
                return (a.rating || 0) - (b.rating || 0);
            case 'date-desc':
                return b.dateAdded - a.dateAdded;
            case 'date-asc':
                return a.dateAdded - b.dateAdded;
            case 'status': {
                const order = { 'want-to-read': 0, 'reading': 1, 'completed': 2 };
                return (order[a.status] || 0) - (order[b.status] || 0);
            }
            default:
                return 0;
        }
    };
    return [...filtered].sort(cmp);
}

function render() {
    const items = getFilteredAndSorted();
    statsBadge.textContent = `${books.length} book${books.length !== 1 ? 's' : ''}`;

    if (books.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    if (items.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;padding:40px 20px;">
        <p style="font-family:var(--mono);font-size:13px;color:var(--muted);">No books match your search</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = items.map(b => {
        const coverHtml = b.cover ?
            `<img src="${b.cover}" alt="${b.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />` :
            '';
        const placeholderText = b.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '📖';

        const stars = b.rating || 0;
        const starHtml = Array.from({ length: 5 }, (_, i) =>
            `<span class="star${i < stars ? '' : ' empty'}">${i < stars ? '★' : '☆'}</span>`
        ).join('');

        const statusClass = b.status || 'want-to-read';
        const statusLabel = {
            'want-to-read': 'Want to Read',
            'reading': 'Reading',
            'completed': 'Completed'
        } [statusClass] || 'Want to Read';

        const dateStr = b.dateAdded ? new Date(b.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric',
            year: 'numeric' }) : '';

        return `
      <div class="book-card" data-id="${b.id}">
        <div class="book-cover">
          ${coverHtml}
          <div class="placeholder" style="display:${b.cover ? 'none' : 'flex'}">${placeholderText}</div>
        </div>
        <div class="book-title">${escHtml(b.title)}</div>
        <div class="book-author">${escHtml(b.author)}</div>
        <div class="book-meta">
          <div class="book-rating">${starHtml}</div>
          <span class="book-status ${statusClass}">${statusLabel}</span>
        </div>
        ${dateStr ? `<div class="book-date">${dateStr}</div>` : ''}
        <div class="book-actions">
          <button class="book-edit-btn" data-action="edit" data-id="${b.id}">edit</button>
          <button class="btn-danger" data-action="delete" data-id="${b.id}">✕</button>
        </div>
      </div>
    `;
    }).join('');

    // ── attach events ──
    grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (confirm('Remove this book from your library?')) {
                books = books.filter(b => b.id !== id);
                saveBooks();
            }
        });
    });

    grid.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const book = books.find(b => b.id === id);
            if (book) openEditModal(book);
        });
    });
}

function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ────────────────────────────────────────
//  MODAL
// ────────────────────────────────────────
function openAddModal() {
    modalTitle.textContent = 'Add Book';
    modalSubmit.textContent = 'Save';
    editId.value = '';
    bookTitle.value = '';
    bookAuthor.value = '';
    bookCover.value = '';
    bookRating.value = '0';
    bookStatus.value = 'want-to-read';
    bookNotes.value = '';
    modalOverlay.classList.add('open');
    setTimeout(() => bookTitle.focus(), 100);
}

function openEditModal(book) {
    modalTitle.textContent = 'Edit Book';
    modalSubmit.textContent = 'Update';
    editId.value = book.id;
    bookTitle.value = book.title;
    bookAuthor.value = book.author;
    bookCover.value = book.cover || '';
    bookRating.value = book.rating || '0';
    bookStatus.value = book.status || 'want-to-read';
    bookNotes.value = book.notes || '';
    modalOverlay.classList.add('open');
    setTimeout(() => bookTitle.focus(), 100);
}

function closeModal() {
    modalOverlay.classList.remove('open');
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ────────────────────────────────────────
//  FORM SUBMIT
// ────────────────────────────────────────
bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    if (!title || !author) {
        alert('Title and author are required.');
        return;
    }

    const id = editId.value ? parseInt(editId.value) : null;
    const cover = bookCover.value.trim() || '';
    const rating = parseInt(bookRating.value) || 0;
    const status = bookStatus.value || 'want-to-read';
    const notes = bookNotes.value.trim() || '';

    if (id) {
        // Edit existing
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
            books[idx] = { ...books[idx], title, author, cover, rating, status, notes };
        }
    } else {
        // Add new
        books.push({
            id: nextId++,
            title,
            author,
            cover,
            rating,
            status,
            notes,
            dateAdded: Date.now()
        });
    }

    saveBooks();
    closeModal();
});

// ────────────────────────────────────────
//  SEARCH & SORT (debounced)
// ────────────────────────────────────────
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(render, 150);
});

sortSelect.addEventListener('change', render);

// ────────────────────────────────────────
//  ADD BUTTON
// ────────────────────────────────────────
document.getElementById('addBookBtn').addEventListener('click', openAddModal);

// ────────────────────────────────────────
//  INIT
// ────────────────────────────────────────
loadBooks();

// If no books, ensure empty state is shown
if (books.length === 0) {
    emptyState.style.display = 'block';
}

// ────────────────────────────────────────
//  Auto-fetch cover from Open Library (bonus)
//  When user blurs the title field, try to fetch cover
// ────────────────────────────────────────
let coverFetchTimeout;
bookTitle.addEventListener('blur', () => {
    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    if (!title || bookCover.value.trim()) return;

    clearTimeout(coverFetchTimeout);
    coverFetchTimeout = setTimeout(() => {
        fetchCoverFromOpenLibrary(title, author);
    }, 400);
});

bookAuthor.addEventListener('blur', () => {
    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    if (!title || !author || bookCover.value.trim()) return;

    clearTimeout(coverFetchTimeout);
    coverFetchTimeout = setTimeout(() => {
        fetchCoverFromOpenLibrary(title, author);
    }, 400);
});

async function fetchCoverFromOpenLibrary(title, author) {
    if (!title) return;
    try {
        const query = encodeURIComponent(`${title} ${author || ''}`);
        const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
            const doc = data.docs[0];
            const coverId = doc.cover_i || doc.cover_edition_key;
            if (coverId) {
                const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
                // test if image exists
                const img = new Image();
                img.onload = () => {
                    if (bookCover.value.trim() === '') {
                        bookCover.value = url;
                    }
                };
                img.onerror = () => { /* silently ignore */ };
                img.src = url;
            }
        }
    } catch (_) { /* ignore network errors */ }
}

