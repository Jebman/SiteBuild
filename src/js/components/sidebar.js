// sidebar.js — renders sidebar and handles expand/collapse + navigation

const NAV = [
  { label: 'Dashboard', href: 'index.html', icon: 'grid' },
  { divider: true },
  {
    label: 'Health',
    href: '#',
    icon: 'sun',
    children: [
      { label: 'Biometrics', href: 'dashboard.html', icon: 'pulse'    },
      { label: 'Workouts',   href: 'workouts.html',   icon: 'dumbbell' },
      { label: 'Calendar',   href: 'calendar.html',   icon: 'calendar' },
    ]
  },
];

const ICONS = {
  grid:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  sun:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  pulse:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
};

function renderSidebar(nav, currentPath) {
  const currentFile = currentPath.split('/').pop() || 'index.html';

  const items = nav.map(function(item) {
    if (item.divider) {
      return '<div style="height:1px;background:var(--border);margin:8px 16px;"></div>';
    }

    const selfActive    = currentFile === item.href;
    const childActive   = item.children && item.children.some(c => currentFile === c.href);
    const isActive      = selfActive || childActive;
    const isOpen        = childActive; // expand if a child is active

    if (item.children) {
      const childItems = item.children.map(function(child) {
        const childIsActive = currentFile === child.href ? ' active' : '';
        return '<a class="sidebar-item sidebar-child' + childIsActive + '" href="' + child.href + '" data-nav="true">' +
                 (ICONS[child.icon] || '') +
                 child.label +
               '</a>';
      }).join('');

      return '<a class="sidebar-item' + (isActive ? ' active' : '') + '" href="' + item.href + '" data-toggle="true">' +
               (ICONS[item.icon] || '') +
               item.label +
               '<span class="sidebar-arrow' + (isOpen ? ' open' : '') + '">›</span>' +
             '</a>' +
             '<div class="sidebar-children' + (isOpen ? ' open' : '') + '">' +
               childItems +
             '</div>';
    }

    return '<a class="sidebar-item' + (isActive ? ' active' : '') + '" href="' + item.href + '" data-nav="true">' +
             (ICONS[item.icon] || '') +
             item.label +
           '</a>';
  }).join('');

  return '<a class="sidebar-back" href="index.html">' +
           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>' +
           'Back' +
         '</a>' +
         '<nav class="sidebar-nav">' + items + '</nav>';
}

// ── Setup sidebar with event delegation ──
document.addEventListener('DOMContentLoaded', function() {
  const aside = document.getElementById('sidebar');
  if (!aside) return;
  aside.innerHTML = renderSidebar(NAV, window.location.pathname);

  // Delegate click events on the sidebar-nav
  const nav = aside.querySelector('.sidebar-nav');
  if (!nav) return;

  nav.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (!target) return;

    // Toggle parent (has data-toggle)
    if (target.dataset.toggle === 'true') {
      e.preventDefault();
      const children = target.nextElementSibling;
      const arrow    = target.querySelector('.sidebar-arrow');
      if (children && children.classList.contains('sidebar-children')) {
        children.classList.toggle('open');
        if (arrow) arrow.classList.toggle('open');
      }
      return;
    }

    // Navigation link (data-nav)
    if (target.dataset.nav === 'true') {
      const href = target.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        return;
      }
      // Allow normal navigation – no need to prevent default
      // but we want a smooth transition
      e.preventDefault();
      document.body.style.transition = 'opacity 0.15s';
      document.body.style.opacity = '0';
      setTimeout(function() { window.location.href = href; }, 150);
    }
  });
});