import { QUIZ_QUESTIONS } from './questions';
import DAILY_QUESTION_SNAPSHOTS from './dailySnapshots.json';

// Simple deterministic shuffle based on date string so each day gets a stable order
function seededShuffle(items, seedStr) {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// The quiz program actually started on this date. Nothing before it exists,
// so Previous Quizzes never lists earlier dates.
export const QUIZ_START_DATE = '2026-11-15';

export function toDateKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey, days) {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function formatDateLabel(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('te-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateKey) {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('te-IN', { day: 'numeric', month: 'short' });
}

export function isFutureDate(dateKey) {
  return dateKey > toDateKey(new Date());
}

export function isToday(dateKey) {
  return dateKey === toDateKey(new Date());
}

export function getQuizForDate(dateKey) {
  // Past dates use the frozen snapshot (exactly the questions played that day),
  // so editing/adding questions later never changes an old quiz.
  // Today and future dates use the live question bank.
  const frozen = DAILY_QUESTION_SNAPSHOTS[dateKey];
  const source =
    Array.isArray(frozen) && frozen.length
      ? frozen
      : seededShuffle(QUIZ_QUESTIONS, dateKey).slice(0, 10);

  const questions = source.map((q, idx) => ({
    ...q,
    displayId: idx + 1,
  }));
  return {
    date: dateKey,
    label: formatDateLabel(dateKey),
    title: `రోజువారీ ఇస్లామిక్ క్విజ్`,
    questions,
    total: questions.length,
    timeSeconds: 180,
    isUpcoming: isFutureDate(dateKey),
  };
}

export function getDailyQuizSchedule(pastDays = 7, futureDays = 0) {
  const today = toDateKey(new Date());
  const items = [];
  for (let i = pastDays; i >= 1; i--) {
    const date = addDays(today, -i);
    // Never generate quizzes before the program started
    if (date < QUIZ_START_DATE) continue;
    items.push(date);
  }
  items.push(today);
  for (let i = 1; i <= futureDays; i++) items.push(addDays(today, i));
  return items.map((date) => {
    const quiz = getQuizForDate(date);
    let status = 'past';
    if (isToday(date)) status = 'today';
    else if (isFutureDate(date)) status = 'upcoming';
    return { ...quiz, status };
  });
}

export function getUpcomingFridayDateKey(fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun ... 5 Fri
  const daysUntilFriday = (5 - day + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return toDateKey(d);
}

export function getWeeklyTopQuiz(now = new Date()) {
  const fridayKey = getUpcomingFridayDateKey(now);
  const unlockAt = new Date(fridayKey + 'T19:00:00'); // Friday 7:00 PM local
  const isAvailable = now >= unlockAt;
  const isUpcoming = !isAvailable;

  // 30 questions: 20 shuffled + 10 more from a different seeded shuffle (deterministic)
  const first = seededShuffle(QUIZ_QUESTIONS, `weekly-${fridayKey}-a`);
  const second = seededShuffle(QUIZ_QUESTIONS, `weekly-${fridayKey}-b`).slice(0, 10);
  const questions = [...first, ...second].map((q, idx) => ({ ...q, displayId: idx + 1 }));

  return {
    id: `weekly-${fridayKey}`,
    date: fridayKey,
    label: `వీక్లీ టాప్ క్విజ్ • ${formatDateLabel(fridayKey)}`,
    title: 'వీక్లీ టాప్ క్విజ్',
    questions,
    total: 30,
    timeSeconds: 900, // 15 minutes for 30 questions
    type: 'weekly',
    isUpcoming,
    isAvailable,
    unlockAt: unlockAt.toISOString(),
    unlockLabel: 'ప్రతి శుక్రవారం రాత్రి 7:00 PM',
  };
}

export function getQuizByKey(key, now = new Date()) {
  if (typeof key === 'string' && key.startsWith('weekly-')) {
    return getWeeklyTopQuiz(now);
  }
  return getQuizForDate(key);
}