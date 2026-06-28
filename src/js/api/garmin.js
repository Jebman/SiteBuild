// garmin.js
// Garmin uses OAuth 1.0a — easiest via a thin backend proxy (Node.js / Vercel function)

async function fetchDailySummary(date) {
  // Your Vercel serverless function proxies the Garmin API call
  const res = await fetch(`/api/garmin/daily?date=${date}`);
  return res.json();
  // Returns: { steps, heartRate, hrv, sleep, stress, calories, bodyBattery }
}

async function fetchActivityDetails(activityId) {
  const res = await fetch(`/api/garmin/activity/${activityId}`);
  return res.json();
  // Returns: { duration, avgHR, maxHR, calories, sport, sets[] (for strength) }
}
