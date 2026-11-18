// Real, persistent achievement badges for the Islamic Telugu Quiz.
// Badge unlock dates are stored per player name in localStorage so they
// survive refreshes and are never awarded twice.

import { getLocalResults } from './sheetService';
import { toDateKey, addDays } from '../data/dailyQuizzes';

const STORAGE_KEY = 'islamic_quiz_achievements';

export const ACHIEVEMENTS = [
  {
    id: 'niyyat',
    icon: '🌱',
    iconKey: 'sprout',
    title: 'నియ్యత్-ఎ-ఖైర్',
    requirement: 'మొదటి క్విజ్ పూర్తి చేయండి.',
    tier: 'bronze',
    tierLabel: 'కాంస్య',
    metric: 'quizzes',
    target: 1,
    art: 'from-amber-700 to-yellow-700',
    ring: 'border-amber-400 bg-amber-50/80',
    glow: 'shadow-[0_0_20px_rgba(180,120,40,0.30)]',
    iconCredit: { label: 'Goal icon by Magnific', href: 'https://www.flaticon.com/free-icons/goal' }
  },
  {
    id: 'talib',
    icon: '📖',
    iconKey: 'book',
    title: 'తాలిబుల్ ఇల్మ్',
    requirement: '5 క్విజ్ లు పూర్తి చేయండి.',
    tier: 'bronze',
    tierLabel: 'కాంస్య',
    metric: 'quizzes',
    target: 5,
    art: 'from-orange-700 to-amber-600',
    ring: 'border-orange-400 bg-orange-50/80',
    glow: 'shadow-[0_0_20px_rgba(194,120,40,0.28)]',
    iconCredit: { label: 'Goal icon by Magnific', href: 'https://www.flaticon.com/free-icons/goal' }
  },
  {
    id: 'sabr',
    icon: '🌙',
    iconKey: 'moon',
    title: 'సబ్ర్ వ సుక్ర్',
    requirement: '3 రోజులు వరుసగా పాల్గొనండి.',
    tier: 'emerald',
    tierLabel: 'మరకత',
    metric: 'streak',
    target: 3,
    art: 'from-emerald-600 to-teal-800',
    ring: 'border-emerald-400 bg-emerald-50/80',
    glow: 'shadow-[0_0_20px_rgba(16,130,90,0.28)]',
    iconCredit: { label: 'Achievement icon by Magnific', href: 'https://www.flaticon.com/free-icons/achievement' }
  },
  {
    id: 'rah',
    icon: '⭐',
    iconKey: 'star',
    title: 'రాహే ఇల్మ్',
    requirement: 'మొత్తం 100 పాయింట్లు సంపాదించండి.',
    tier: 'silver',
    tierLabel: 'రజత',
    metric: 'points',
    target: 100,
    art: 'from-slate-500 to-zinc-700',
    ring: 'border-slate-400 bg-slate-50/80',
    glow: 'shadow-[0_0_20px_rgba(120,130,145,0.28)]',
    iconCredit: { label: 'Achievement icon by flatart_icons', href: 'https://www.flaticon.com/free-icons/achievement' }
  },
  {
    id: 'nurani',
    icon: '✨',
    iconKey: 'sparkles',
    title: 'నూరానీ ప్రయాణం',
    requirement: '7 రోజులు వరుసగా పాల్గొనండి.',
    tier: 'emerald',
    tierLabel: 'మరకత',
    metric: 'streak',
    target: 7,
    art: 'from-teal-600 to-emerald-900',
    ring: 'border-teal-400 bg-teal-50/80',
    glow: 'shadow-[0_0_20px_rgba(13,148,136,0.28)]',
    iconCredit: { label: 'Success icon by Magnific', href: 'https://www.flaticon.com/free-icons/success' }
  },
  {
    id: 'fath',
    icon: '🏅',
    iconKey: 'medal',
    title: 'ఫత్హుల్ ఇల్మ్',
    requirement: 'ఒక క్విజ్ లో 90% లేదా అంతకంటే ఎక్కువ సాధించండి.',
    tier: 'gold',
    tierLabel: 'రాజ బంగారం',
    metric: 'bestAccuracy',
    target: 90,
    art: 'from-yellow-500 to-amber-700',
    ring: 'border-yellow-500 bg-yellow-50/80',
    glow: 'shadow-[0_0_22px_rgba(212,175,55,0.35)]',
    iconCredit: { label: 'Reward icon by Heykiyou', href: 'https://www.flaticon.com/free-icons/reward' }
  },
  {
    id: 'jawahir',
    icon: '💎',
    iconKey: 'gem',
    title: 'జవాహిరుల్ ఇల్మ్',
    requirement: 'మొత్తం 500 పాయింట్లు సంపాదించండి.',
    tier: 'silver',
    tierLabel: 'రజత',
    metric: 'points',
    target: 500,
    art: 'from-zinc-400 to-slate-600',
    ring: 'border-zinc-400 bg-zinc-50/80',
    glow: 'shadow-[0_0_20px_rgba(130,140,155,0.28)]',
    iconCredit: { label: 'High quality icon by Prosymbols Premium', href: 'https://www.flaticon.com/free-icons/high-quality' }
  },
  {
    id: 'istiqamat',
    icon: '🕌',
    iconKey: 'landmark',
    title: 'ఇస్తిఖామత్',
    requirement: '30 రోజుల పాల్గొనే ధారను కొనసాగించండి.',
    tier: 'emerald',
    tierLabel: 'మరకత',
    metric: 'streak',
    target: 30,
    art: 'from-green-700 to-emerald-950',
    ring: 'border-green-500 bg-green-50/80',
    glow: 'shadow-[0_0_20px_rgba(20,120,70,0.30)]',
    iconCredit: { label: 'Trophy icon by Magnific', href: 'https://www.flaticon.com/free-icons/trophy' }
  },
  {
    id: 'barakat',
    icon: '👑',
    iconKey: 'crown',
    title: 'బరకతే ఇల్మ్',
    requirement: 'మొత్తం 1,000 పాయింట్లు సంపాదించండి.',
    tier: 'premium',
    tierLabel: 'ఖాస్ బంగారం',
    metric: 'points',
    target: 1000,
    art: 'from-amber-400 via-yellow-600 to-amber-800',
    ring: 'border-amber-500 bg-amber-50/80',
    glow: 'shadow-[0_0_24px_rgba(218,165,32,0.40)]',
    iconCredit: { label: 'Fifa icon by cube29', href: 'https://www.flaticon.com/free-icons/fifa' }
  },
  {
    id: 'nurul',
    icon: '📜',
    iconKey: 'certificate',
    title: 'నూరుల్ హిదాయత్',
    requirement: 'లీడర్ బోర్డ్ లో మొదటి స్థానం సాధించండి.',
    tier: 'premium',
    tierLabel: 'ఖాస్ బంగారం',
    metric: 'rankOne',
    target: 1,
    art: 'from-yellow-300 via-amber-500 to-yellow-800',
    ring: 'border-yellow-600 bg-yellow-50/80',
    glow: 'shadow-[0_0_26px_rgba(212,175,55,0.45)]',
    iconCredit: { label: 'Certificate icon by Smashicons', href: 'https://www.flaticon.com/free-icons/certificate' }
  }
];

const isDateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (err) {
    return {};
  }
};

const writeStore = (store) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    // ignore storage failures — badges simply won't persist in that browser
  }
};

export const statsFromResults = (results = []) => {
  const quizzes = results.length;
  const totalPoints = results.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
  const totalPossible = results.reduce((sum, r) => sum + (Number(r.total) || 10), 0);
  const accuracy = totalPossible ? Math.round((totalPoints / totalPossible) * 100) : 0;
  const bestAccuracy = results.length
    ? Math.max(
        ...results.map((r) => {
          const score = Number(r.score) || 0;
          const total = Number(r.total) || 10;
          return Math.min(100, Math.round((score / total) * 100));
        })
      )
    : 0;

  const days = [...new Set(results.map((r) => r.quizDate).filter(isDateKey))].sort();

  let maxStreak = 0;
  let run = 0;
  let prev = null;
  days.forEach((day) => {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    prev = day;
  });

  let cursor = days.includes(toDateKey()) ? toDateKey() : addDays(toDateKey(), -1);
  let currentStreak = 0;
  while (days.includes(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // A local, honest proxy for "first on the leaderboard": a perfect score
  // completed inside 60 seconds. A true global rank needs a public rank API.
  const rankOne = results.some((r) => {
    const score = Number(r.score) || 0;
    const total = Number(r.total) || 10;
    const secs = Number(r.timeTakenSeconds) || 0;
    return score > 0 && score === total && secs > 0 && secs <= 60;
  });

  return { quizzes, totalPoints, accuracy, bestAccuracy, maxStreak, currentStreak, rankOne };
};

const metricValue = (stats, metric) => {
  if (metric === 'quizzes') return stats.quizzes;
  if (metric === 'points') return stats.totalPoints;
  if (metric === 'streak') return stats.maxStreak;
  if (metric === 'bestAccuracy') return stats.bestAccuracy;
  if (metric === 'rankOne') return stats.rankOne ? 1 : 0;
  return 0;
};

export const badgeProgress = (badge, stats) => {
  const current = Math.min(metricValue(stats, badge.metric), badge.target);
  return {
    current,
    target: badge.target,
    percent: badge.target ? Math.min(100, Math.round((current / badge.target) * 100)) : 0
  };
};

export const getPlayerResults = (name) => {
  const all = getLocalResults();
  const player = name || all[0]?.name || '';
  return {
    name: player,
    results: player ? all.filter((r) => r.name === player) : all
  };
};

/** Read-only snapshot used for the first render (no writes, no awards). */
export const getAchievementSnapshot = () => {
  const { name, results } = getPlayerResults();
  const stats = statsFromResults(results);
  const store = readStore();
  const unlocked = { ...(store[name || 'default'] || {}) };
  return { name, results, stats, unlocked, newlyUnlocked: [] };
};

/**
 * Recalculate every achievement for a player, persist first-time unlock dates,
 * and return only the badges that were newly earned. Safe to call repeatedly.
 */
export const syncAchievements = (explicitName) => {
  const { name, results } = getPlayerResults(explicitName);
  const stats = statsFromResults(results);
  const store = readStore();
  const key = name || 'default';
  const unlocked = { ...(store[key] || {}) };
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((badge) => {
    if (!unlocked[badge.id] && metricValue(stats, badge.metric) >= badge.target) {
      unlocked[badge.id] = new Date().toISOString();
      newlyUnlocked.push(badge);
    }
  });

  store[key] = unlocked;
  writeStore(store);

  return { name, results, stats, unlocked, newlyUnlocked };
};

export const formatUnlockDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('te-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
