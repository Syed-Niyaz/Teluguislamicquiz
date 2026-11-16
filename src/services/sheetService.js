// Service for interacting with Google Sheets via Google Apps Script Web App

const STORAGE_KEY_SCRIPT_URL = 'islamic_quiz_gas_url';
const STORAGE_KEY_LOCAL_RESULTS = 'islamic_quiz_local_leaderboard';
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXMMQffo11cPtuzye6Xaj3KDKceyY19cb7P09x8594S4Sguzjkn9xNc0kzi4G9bJagaw/exec';

// Admin password required to open the leaderboard (must match ADMIN_PASSWORD in Apps Script)
export const ADMIN_PASSWORD = 'Syed2002@';

// Always compare quiz dates as plain YYYY-MM-DD (guards against Sheets returning ISO/Date strings)
const localDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MONTH_KEYS = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

export const normalizeDateKey = (value) => {
  if (!value) return '';
  if (value instanceof Date) return localDateKey(value);
  const s = String(value).trim();
  if (s.startsWith('weekly-')) return s;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // Handles old Sheet rows like "Sun Nov 15 2026 00:00:00 GMT+0300 ..."
  const named = s.match(/([A-Z][a-z]{2})\s+(\d{1,2}),?\s+(\d{4})/);
  if (named && MONTH_KEYS[named[1]]) {
    return `${named[3]}-${MONTH_KEYS[named[1]]}-${String(named[2]).padStart(2, '0')}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return localDateKey(parsed);
  return s;
};

const formatSeconds = (value) => {
  const secs = Number(value);
  if (!Number.isFinite(secs) || secs < 0) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const sanitizeRow = (r) => {
  const score = Number(r.score) || 0;
  const total = Number(r.total) || 0;
  const secs = Number(r.timeTakenSeconds) || 0;
  return {
    ...r,
    quizDate: normalizeDateKey(r.quizDate),
    score,
    total,
    timeTakenSeconds: secs,
    timeTakenFormatted: formatSeconds(secs) || r.timeTakenFormatted || '',
    percentage: total ? `${Math.round((score / total) * 100)}%` : r.percentage || ''
  };
};

const sortResults = (list) =>
  list.sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if ((a.timeTakenSeconds || 999999) !== (b.timeTakenSeconds || 999999)) {
      return (a.timeTakenSeconds || 999999) - (b.timeTakenSeconds || 999999);
    }
    // Who submitted first wins the tie
    return String(a.submittedAt || a.date || '').localeCompare(String(b.submittedAt || b.date || ''));
  });

export const getSavedScriptUrl = () => {
  return localStorage.getItem(STORAGE_KEY_SCRIPT_URL) || DEFAULT_SCRIPT_URL;
};

export const saveScriptUrl = (url) => {
  if (url) {
    localStorage.setItem(STORAGE_KEY_SCRIPT_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_SCRIPT_URL);
  }
};

export const getLocalResults = (quizDate) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_RESULTS);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    if (quizDate) {
      return list.filter((r) => normalizeDateKey(r.quizDate) === normalizeDateKey(quizDate));
    }
    return list;
  } catch (err) {
    console.error('Error reading local results:', err);
    return [];
  }
};

export const saveLocalResult = (entry) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_RESULTS);
    const parsed = raw ? JSON.parse(raw) : [];
    const current = Array.isArray(parsed) ? parsed : [];
    const updated = [{ ...entry, quizDate: normalizeDateKey(entry.quizDate) }, ...current];
    localStorage.setItem(STORAGE_KEY_LOCAL_RESULTS, JSON.stringify(updated.slice(0, 200)));
    return updated;
  } catch (err) {
    console.error('Error saving local result:', err);
    return [];
  }
};

/**
 * Submit quiz result to Google Sheets (instantly).
 * Saves locally first so the result is never lost, then posts to the sheet.
 */
export const submitQuizToGoogleSheets = async (resultData) => {
  const payload = {
    ...resultData,
    quizDate: normalizeDateKey(resultData.quizDate)
  };

  // Always save locally first so the user gets instant results
  saveLocalResult(payload);

  const scriptUrl = getSavedScriptUrl();
  if (!scriptUrl) {
    return {
      success: true,
      savedLocally: true,
      message: 'ఫలితం స్థానికంగా భద్రపరచబడింది.'
    };
  }

  try {
    // text/plain keeps this a "simple" request (no preflight) for Apps Script
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      syncedToSheet: true,
      message: 'మీ ఫలితం Google Sheet లో నమోదు చేయబడింది.'
    };
  } catch (error) {
    console.warn('Google Sheets submission error:', error);
    return {
      success: true,
      savedLocally: true,
      error: error.message,
      message: 'ఫలితం స్థానికంగా సేవ్ చేయబడింది. నెట్‌వర్క్ సమస్య వల్ల Google Sheet కి పంపలేకపోయాము.'
    };
  }
};

/**
 * Fetch leaderboard from Google Sheets (admin password required).
 * Returns { items, source, error } so the UI can show connection problems.
 */
export const fetchLeaderboard = async (quizDate, password = ADMIN_PASSWORD) => {
  const scriptUrl = getSavedScriptUrl();
  const localList = sortResults(getLocalResults(quizDate).map(sanitizeRow));

  if (!scriptUrl) {
    return { items: localList, source: 'local', error: 'Google Sheet URL సెట్ చేయలేదు' };
  }

  const params = new URLSearchParams();
  params.set('action', 'getLeaderboard');
  // Fetch all rows and filter locally: this works even with older Apps Script
  // deployments that could not match Sheet date values reliably.
  if (password) params.set('password', password);

  try {
    const res = await fetch(`${scriptUrl}?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (Array.isArray(data)) {
      const cleaned = data.map(sanitizeRow);
      const filtered = quizDate
        ? cleaned.filter((r) => normalizeDateKey(r.quizDate) === normalizeDateKey(quizDate))
        : cleaned;
      sortResults(filtered);
      return { items: filtered, source: 'sheet', error: null };
    }

    if (data && data.error) {
      throw new Error(
        data.error === 'unauthorized'
          ? 'Admin పాస్‌వర్డ్ తప్పు (Apps Script లో ADMIN_PASSWORD అప్‌డేట్ చేయండి)'
          : String(data.error)
      );
    }

    throw new Error('Google Sheet నుండి సరైన డేటా రాలేదు');
  } catch (err) {
    console.warn('Could not fetch from Google Sheet, using local data:', err);
    return { items: localList, source: 'local', error: err.message };
  }
};
