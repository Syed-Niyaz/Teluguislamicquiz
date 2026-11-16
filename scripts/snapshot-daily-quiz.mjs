/**
 * Freezes each day's quiz questions.
 *
 * Why: daily questions are picked from the changing bank in
 * `src/data/questions.js`. Without a snapshot, editing the bank would also
 * change quizzes that already happened. This script stores every past day's
 * exact 10 questions in `src/data/dailySnapshots.json`.
 *
 * Rules:
 * - A date that is already frozen is NEVER overwritten.
 * - Missing dates (up to today) are frozen from the current bank.
 * - `--today` re-freezes only today's questions (use after editing today's quiz).
 *
 * Runs automatically before `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const QUESTIONS_FILE = path.join(ROOT, 'src', 'data', 'questions.js');
const SNAPSHOT_FILE = path.join(ROOT, 'src', 'data', 'dailySnapshots.json');
const QUIZ_START_DATE = '2026-11-15';
const QUESTIONS_PER_DAY = 10;

const refreshToday = process.argv.includes('--today');

// Must match src/data/dailyQuizzes.js exactly
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

function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateKey, days) {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

// Never fail a deployment because of snapshotting.
try {
const { QUIZ_QUESTIONS } = await import(pathToFileURL(QUESTIONS_FILE).href);

if (!Array.isArray(QUIZ_QUESTIONS) || !QUIZ_QUESTIONS.length) {
  throw new Error('No questions found in src/data/questions.js');
}

let snapshots = {};
if (fs.existsSync(SNAPSHOT_FILE)) {
  try {
    snapshots = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  } catch (err) {
    console.error('Could not read dailySnapshots.json, starting a new file:', err.message);
    snapshots = {};
  }
}

const today = toDateKey();
const created = [];
const skipped = [];

let cursor = QUIZ_START_DATE;
while (cursor <= today) {
  const current = snapshots[cursor];
  const missing = !Array.isArray(current) || current.length === 0;
  const overwrite = refreshToday && cursor === today;

  if (missing || overwrite) {
    snapshots[cursor] = seededShuffle(QUIZ_QUESTIONS, cursor)
      .slice(0, QUESTIONS_PER_DAY)
      .map((q) => ({
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
      }));
    created.push(cursor);
  } else {
    skipped.push(cursor);
  }

  cursor = addDays(cursor, 1);
}

const sorted = {};
Object.keys(snapshots)
  .sort()
  .forEach((key) => {
    sorted[key] = snapshots[key];
  });

fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf8');

if (created.length) {
  console.log(`Frozen ${created.length} day(s): ${created.join(', ')}`);
} else {
  console.log(`All ${skipped.length} day(s) already frozen — history unchanged.`);
}
} catch (err) {
  console.warn('Quiz snapshot skipped (build continues):', err.message);
}
