// calendar.js — after OAuth setup
async function getWorkoutEvents(weekStart) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?timeMin=${weekStart.toISOString()}&timeMax=${weekEnd}&q=workout`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.items; // array of calendar events
}

async function scheduleWorkout(date, workoutType) {
  await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `Workout: ${workoutType}`,
      start: { dateTime: date.toISOString() },
      end:   { dateTime: new Date(date.getTime() + 3600000).toISOString() },
    })
  });
}
