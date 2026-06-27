// calendar.js

// ─────────────────────────────────────────────
// SECTION 1: CONFIG
// ─────────────────────────────────────────────

var gToken = null;

var SCHEDULE = {
  0: null,
  1: 'push',
  2: 'pull',
  3: 'legs',
  4: 'arms',
  5: 'push',
  6: null,
};

var WORKOUT_TIME = { start: 7, duration: 1 };

// ─────────────────────────────────────────────
// SECTION 2: WORKOUT DATA
// ─────────────────────────────────────────────

var WORKOUTS = {
  push: {
    label: 'Push',
    color: 'workout-push',
    exercises: [
      { name: 'Bench Press', muscle: 'Chest', sets: '4×8' },
      { name: 'Overhead Press', muscle: 'Shoulders', sets: '4×8' },
      { name: 'Incline Press', muscle: 'Upper Chest', sets: '3×10' },
      { name: 'Dips', muscle: 'Chest / Triceps', sets: '3×12' },
    ]
  },
  pull: {
    label: 'Pull',
    color: 'workout-pull',
    exercises: [
      { name: 'Deadlift', muscle: 'Back / Legs', sets: '4×6' },
      { name: 'Pull-ups', muscle: 'Back / Biceps', sets: '4×10' },
      { name: 'Rows', muscle: 'Back', sets: '4×10' },
      { name: 'Face Pulls', muscle: 'Rear Delts', sets: '3×15' },
    ]
  },
  legs: {
    label: 'Legs',
    color: 'workout-legs',
    exercises: [
      { name: 'Squat', muscle: 'Quadriceps', sets: '4×8' },
      { name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: '4×10' },
      { name: 'Leg Press', muscle: 'Quadriceps', sets: '3×12' },
      { name: 'Calf Raises', muscle: 'Calves', sets: '4×15' },
    ]
  },
  arms: {
    label: 'Arms',
    color: 'workout-arms',
    exercises: [
      { name: 'Barbell Curl', muscle: 'Biceps', sets: '4×10' },
      { name: 'Tricep Pushdown', muscle: 'Triceps', sets: '4×12' },
      { name: 'Hammer Curl', muscle: 'Biceps / Brachialis', sets: '3×12' },
      { name: 'Skull Crushers', muscle: 'Triceps', sets: '3×12' },
    ]
  },
  cardio: {
    label: 'Cardio',
    color: 'workout-cardio',
    exercises: [
      { name: 'Running', muscle: 'Full Body', sets: '30 min' },
      { name: 'Cycling', muscle: 'Legs', sets: '30 min' },
    ]
  },
  rest: {
    label: 'Rest',
    color: 'workout-rest',
    exercises: []
  }
};

// ─────────────────────────────────────────────
// SECTION 3: STATE
// ─────────────────────────────────────────────

var currentWeekStart = null;

// ─────────────────────────────────────────────
// SECTION 4: GOOGLE OAUTH
// ─────────────────────────────────────────────

var GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
var GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/calendar';

function signInWithGoogle() {
  var client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope:     GOOGLE_SCOPES,
    callback:  function(response) {
      if (response.error) {
        console.error('OAuth error:', response.error);
        return;
      }
      gToken = response.access_token;
      console.log('Google Calendar connected');
      document.getElementById('connectBtn').textContent = '✓ Connected';
      document.getElementById('connectBtn').style.borderColor = '#34a853';
      document.getElementById('connectBtn').style.color = '#34a853';
      renderWeek();
    }
  });
  client.requestAccessToken();
}

function isGoogleConnected() {
  return gToken !== null;
}

// ─────────────────────────────────────────────
// SECTION 5: GOOGLE CALENDAR API
// ─────────────────────────────────────────────

async function getWorkoutEvents(weekStart) {
  if (!isGoogleConnected()) return null;

  var weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  try {
    var res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
      '?timeMin=' + weekStart.toISOString() +
      '&timeMax=' + weekEnd.toISOString() +
      '&q=workout' +
      '&singleEvents=true' +
      '&orderBy=startTime',
      { headers: { Authorization: 'Bearer ' + gToken } }
    );

    if (!res.ok) {
      console.error('Calendar API error:', res.status);
      return null;
    }

    var data = await res.json();
    return data.items || [];

  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    return null;
  }
}

async function scheduleWorkout(date, workoutType) {
  if (!isGoogleConnected()) {
    console.warn('Not connected to Google Calendar');
    return false;
  }

  var dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  var dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  try {
    var checkRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
      '?timeMin=' + dayStart.toISOString() +
      '&timeMax=' + dayEnd.toISOString() +
      '&q=Workout:',
      { headers: { Authorization: 'Bearer ' + gToken } }
    );
    var checkData = await checkRes.json();

    if (checkData.items && checkData.items.length > 0) {
      console.log('Workout already scheduled on', date.toDateString());
      return false;
    }
  } catch (err) {
    console.warn('Duplicate check failed, proceeding anyway:', err);
  }

  var start = new Date(date);
  start.setHours(WORKOUT_TIME.start, 0, 0, 0);
  var end = new Date(start.getTime() + WORKOUT_TIME.duration * 3600000);

  try {
    var res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + gToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary:     'Workout: ' + workoutType,
          description: 'Auto-scheduled by Health Dashboard',
          start: { dateTime: start.toISOString() },
          end:   { dateTime: end.toISOString() },
        })
      }
    );

    if (!res.ok) {
      console.error('Failed to create event:', res.status);
      return false;
    }

    console.log('Workout scheduled:', workoutType, 'on', start.toDateString());
    return true;

  } catch (err) {
    console.error('scheduleWorkout error:', err);
    return false;
  }
}

async function scheduleWeek(weekStart) {
  for (var i = 0; i < 7; i++) {
    var day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    var dow = day.getDay();
    var workoutKey = SCHEDULE[dow];
    if (workoutKey) {
      await scheduleWorkout(day, workoutKey);
    }
  }
}

// ─────────────────────────────────────────────
// SECTION 6: DATA RESOLVER
// ─────────────────────────────────────────────

async function getWeekWorkouts(weekStart) {
  var result = {};
  var googleEvents = await getWorkoutEvents(weekStart);

  if (googleEvents && googleEvents.length > 0) {
    googleEvents.forEach(function(event) {
      var title = event.summary || '';
      var dateStr = (event.start.dateTime || event.start.date).split('T')[0];

      var match = title.toLowerCase().match(/workout:\s*(\w+)/);
      if (match && WORKOUTS[match[1]]) {
        result[dateStr] = match[1];
      }
    });
    return result;
  }

  // Fallback to local SCHEDULE
  for (var i = 0; i < 7; i++) {
    var day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    var dow = day.getDay();
    var key = SCHEDULE[dow];
    if (key) {
      var dateStr = day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate();
      result[dateStr] = key;
    }
  }
  return result;
}

// ─────────────────────────────────────────────
// SECTION 7: RENDER ENGINE
// ─────────────────────────────────────────────

function getMonday(date) {
  var d = new Date(date);
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function formatWeekLabel(weekStart) {
  var end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  var opts = { month: 'short', day: 'numeric' };
  return weekStart.toLocaleDateString('en-US', opts) + ' — ' + end.toLocaleDateString('en-US', opts);
}

var DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function renderDayHeaders(weekStart) {
  var html = '<div class="day-header-spacer"></div>';
  var today = new Date();
  var todayStr = formatDateKey(today);

  for (var i = 0; i < 7; i++) {
    var d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    var dateStr = formatDateKey(d);
    var isToday = dateStr === todayStr;
    html += '<div class="day-header' + (isToday ? ' today' : '') + '">' +
            '<div class="day-header-name">' + DAY_NAMES_SHORT[i] + '</div>' +
            '<div class="day-header-num' + (isToday ? ' today' : '') + '">' + d.getDate() + '</div>' +
            '</div>';
  }
  document.getElementById('dayHeaders').innerHTML = html;
}

async function renderWeek() {
  if (!currentWeekStart) {
    currentWeekStart = getMonday(new Date());
  }

  var weekStart = new Date(currentWeekStart);
  document.getElementById('weekLabel').textContent = formatWeekLabel(weekStart);
  renderDayHeaders(weekStart);

  var grid = document.getElementById('weekGrid');
  var workoutMap = await getWeekWorkouts(weekStart);

  var html = '';
  var now = new Date();
  var todayStr = formatDateKey(now);
  var currentHour = now.getHours();
  var currentMinute = now.getMinutes();

  for (var h = 0; h < 24; h++) {
    var label = (h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p');
    html += '<div class="time-slot">' + label + '</div>';

    for (var d = 0; d < 7; d++) {
      var day = new Date(weekStart);
      day.setDate(day.getDate() + d);
      var dateStr = formatDateKey(day);
      var isToday = dateStr === todayStr;

      html += '<div class="day-cell' + (isToday ? ' today-col' : '') + '" ' +
              'data-date="' + dateStr + '" ' +
              'onclick="openDayPanel(\'' + dateStr + '\')">';

      var workoutKey = workoutMap[dateStr];
      if (workoutKey && h === WORKOUT_TIME.start) {
        var wInfo = WORKOUTS[workoutKey] || WORKOUTS.rest;
        var colorClass = wInfo.color || 'workout-rest';
        var labelDisplay = wInfo.label || workoutKey;
        var endHour = WORKOUT_TIME.start + WORKOUT_TIME.duration;
        var rowSpan = WORKOUT_TIME.duration;
        html += '<div class="workout-block ' + colorClass + '" ' +
                'style="top:0;height:' + (rowSpan * 48 - 4) + 'px;" ' +
                'onclick="event.stopPropagation();openDayPanel(\'' + dateStr + '\')">' +
                '<div class="workout-block-name">' + labelDisplay + '</div>' +
                '<div class="workout-block-meta">' +
                String(WORKOUT_TIME.start).padStart(2, '0') + ':00 – ' +
                String(endHour).padStart(2, '0') + ':00' +
                '</div>' +
                '</div>';
      }

      if (isToday && h === currentHour) {
        var topPx = (currentMinute / 60) * 48;
        html += '<div class="time-line" style="top:' + topPx + 'px;"></div>';
      }

      html += '</div>';
    }
  }

  grid.innerHTML = html;
}

// ─────────────────────────────────────────────
// SECTION 8: NAVIGATION
// ─────────────────────────────────────────────

function shiftWeek(delta) {
  if (!currentWeekStart) currentWeekStart = getMonday(new Date());
  currentWeekStart.setDate(currentWeekStart.getDate() + delta * 7);
  renderWeek();
  closePanel();
}

function goToday() {
  currentWeekStart = getMonday(new Date());
  renderWeek();
  closePanel();
}

// ─────────────────────────────────────────────
// SECTION 9: SIDE PANEL
// ─────────────────────────────────────────────

function closePanel() {
  document.getElementById('sidePanel').classList.remove('open');
}

function openDayPanel(dateStr) {
  var panel = document.getElementById('sidePanel');
  var inner = document.getElementById('panelInner');

  var parts = dateStr.split('-').map(Number);
  var date = new Date(parts[0], parts[1] - 1, parts[2]);

  // Find workout for this day from the current render
  var workoutKey = null;
  var grid = document.getElementById('weekGrid');
  var cells = grid.querySelectorAll('.day-cell');
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].dataset.date === dateStr) {
      var block = cells[i].querySelector('.workout-block');
      if (block) {
        var nameEl = block.querySelector('.workout-block-name');
        if (nameEl) {
          var label = nameEl.textContent.trim();
          for (var key in WORKOUTS) {
            if (WORKOUTS[key].label === label) {
              workoutKey = key;
              break;
            }
          }
        }
      }
      break;
    }
  }

  // If not found, check SCHEDULE
  if (!workoutKey) {
    var dow = date.getDay();
    var scheduledKey = SCHEDULE[dow];
    if (scheduledKey) {
      var weekStart = new Date(currentWeekStart);
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      if (date >= weekStart && date < weekEnd) {
        workoutKey = scheduledKey;
      }
    }
  }

  var wInfo = workoutKey ? WORKOUTS[workoutKey] : null;

  var html = '';
  html += '<div class="panel-header">' +
          '<div class="panel-title">' + date.toLocaleDateString('en-US', { weekday: 'long' }) + '</div>' +
          '<button class="panel-close" onclick="closePanel()">✕</button>' +
          '</div>';

  html += '<div class="panel-date">' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + '</div>';

  if (wInfo) {
    html += '<div class="panel-workout-type" style="color:var(--orange);">' + wInfo.label + ' Day</div>';

    var exerciseCount = wInfo.exercises ? wInfo.exercises.length : 0;
    var totalSets = 0;
    if (wInfo.exercises) {
      wInfo.exercises.forEach(function(ex) {
        var setMatch = ex.sets.match(/^\d+/);
        if (setMatch) totalSets += parseInt(setMatch[0], 10);
      });
    }
    html += '<div class="panel-stats">' +
            '<div class="panel-stat"><div class="panel-stat-label">Exercises</div><div class="panel-stat-val">' + exerciseCount + '</div></div>' +
            '<div class="panel-stat"><div class="panel-stat-label">Total Sets</div><div class="panel-stat-val">' + totalSets + '</div></div>' +
            '<div class="panel-stat"><div class="panel-stat-label">Duration</div><div class="panel-stat-val">' + WORKOUT_TIME.duration + 'h</div></div>' +
            '</div>';

    if (wInfo.exercises && wInfo.exercises.length > 0) {
      html += '<div class="panel-section-label">Exercises</div>';
      wInfo.exercises.forEach(function(ex) {
        html += '<div class="panel-exercise">' +
                '<div><div class="panel-ex-name">' + ex.name + '</div>' +
                '<div class="panel-ex-muscle">' + ex.muscle + '</div></div>' +
                '<div class="panel-ex-sets">' + ex.sets + '</div>' +
                '</div>';
      });
    } else {
      html += '<div class="panel-empty">' +
              '<div class="panel-empty-icon">🧘</div>' +
              '<div class="panel-empty-text">Rest day — take it easy</div>' +
              '</div>';
    }
  } else {
    html += '<div class="panel-workout-type" style="color:var(--muted);">Rest Day</div>';
    html += '<div class="panel-empty">' +
            '<div class="panel-empty-icon">🛋️</div>' +
            '<div class="panel-empty-text">No workout scheduled</div>' +
            '</div>';
  }

  inner.innerHTML = html;
  panel.classList.add('open');
}

// ─────────────────────────────────────────────
// SECTION 10: INIT
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  currentWeekStart = getMonday(new Date());
  renderWeek();

  if (gToken) {
    document.getElementById('connectBtn').textContent = '✓ Connected';
    document.getElementById('connectBtn').style.borderColor = '#34a853';
    document.getElementById('connectBtn').style.color = '#34a853';
  }
});

// Expose functions globally for inline onclick handlers
window.shiftWeek = shiftWeek;
window.goToday = goToday;
window.openDayPanel = openDayPanel;
window.closePanel = closePanel;
window.signInWithGoogle = signInWithGoogle;
window.renderWeek = renderWeek;
window.scheduleWeek = scheduleWeek;
window.getWeekWorkouts = getWeekWorkouts;
window.scheduleWorkout = scheduleWorkout;
