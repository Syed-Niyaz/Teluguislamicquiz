import React, { useEffect, useMemo, useState } from 'react';
import {
  Sprout,
  BookOpen,
  Moon,
  Star,
  Sparkles,
  Medal,
  Gem,
  Landmark,
  Crown,
  Trophy,
  Award,
  Lock,
  Check,
  X,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  CalendarCheck
} from 'lucide-react';
import { formatDateLabel, toDateKey } from '../data/dailyQuizzes';
import {
  ACHIEVEMENTS,
  getAchievementSnapshot,
  syncAchievements,
  badgeProgress,
  formatUnlockDate
} from '../services/achievementService';
import BadgeToast from './BadgeToast';

const ICONS = {
  sprout: Sprout,
  book: BookOpen,
  moon: Moon,
  star: Star,
  sparkles: Sparkles,
  medal: Medal,
  gem: Gem,
  landmark: Landmark,
  crown: Crown,
  trophy: Trophy
};

const TONES = {
  niyyat: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  talib: 'text-sky-700 bg-sky-50 ring-sky-200',
  sabr: 'text-indigo-700 bg-indigo-50 ring-indigo-200',
  rah: 'text-amber-700 bg-amber-50 ring-amber-200',
  nurani: 'text-teal-700 bg-teal-50 ring-teal-200',
  fath: 'text-yellow-800 bg-yellow-50 ring-yellow-300',
  jawahir: 'text-slate-600 bg-slate-50 ring-slate-300',
  istiqamat: 'text-emerald-800 bg-emerald-50 ring-emerald-300',
  barakat: 'text-amber-800 bg-amber-50 ring-amber-300',
  nurul: 'text-yellow-800 bg-yellow-50 ring-yellow-400'
};

const TIER_CHIP = {
  bronze: 'text-amber-800 bg-amber-50 ring-amber-200',
  silver: 'text-slate-600 bg-slate-50 ring-slate-200',
  emerald: 'text-emerald-800 bg-emerald-50 ring-emerald-200',
  gold: 'text-yellow-900 bg-yellow-50 ring-yellow-300',
  premium: 'text-amber-900 bg-amber-50 ring-amber-300'
};

const APPRECIATION =
  'మాషా అల్లాహ్! మీ ఆసక్తి, ప్రయత్నం అభినందనీయం. ఇస్లామిక్ జ్ఞానాన్ని పెంపొందించుకోవాలనే మీ ప్రయత్నానికి అల్లాహ్ బరకత్ ప్రసాదించుగాక. ఇన్ షా అల్లాహ్, మరిన్ని మంచి విజయాలు సాధించండి!';

const EMPTY_APPRECIATION =
  'బిస్మిల్లాహిర్ రహ్మానిర్ రహీమ్ తో మొదటి అడుగు వేయండి. అల్లాహ్ మీకు తౌఫీక్ దాన్ చేయుగాక.';

function BadgeMedallion({ badge, unlocked, size = 'md' }) {
  const Icon = ICONS[badge.iconKey] || Award;
  const dimension = size === 'lg' ? 'w-16 h-16 rounded-[20px]' : 'w-12 h-12 rounded-2xl';
  return (
    <div
      className={`${dimension} shrink-0 ring-2 flex items-center justify-center transition-all duration-300 ${
        unlocked
          ? `${TONES[badge.id]}`
          : 'bg-slate-100 text-slate-400 ring-slate-200 blur-[1px]'
      }`}
    >
      <Icon className={size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'} strokeWidth={1.7} />
    </div>
  );
}

function BadgeDetailModal({ badge, unlocked, unlockedDate, progress, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-emerald-950/50 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={badge.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white border border-emerald-100 shadow-2xl overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-800" />
        <div className="p-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="float-right w-8 h-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-center">
            <BadgeMedallion badge={badge} unlocked={unlocked} size="lg" />
          </div>
          <span className={`inline-block mt-4 text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${TIER_CHIP[badge.tier]}`}>
            {badge.tierLabel}
          </span>
          <h3 className="mt-2 text-xl font-extrabold text-emerald-950">{badge.title}</h3>
          <p className="mt-2 text-sm text-slate-600 font-medium">{badge.requirement}</p>

          {unlocked ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4" /> అన్ లాక్ అయ్యింది
              </div>
              <div className="mt-1 text-sm font-semibold text-emerald-950">
                📅 {formatUnlockDate(unlockedDate)}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>పురోగతి</span>
                <span>{progress.current} / {progress.target}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Lock className="w-3.5 h-3.5" /> ఇంకా లాక్ అయ్యే ఉంది
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 font-bold text-sm cursor-pointer transition"
          >
            మూసివేయండి
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgressScreen({ onStartQuiz }) {
  const [state, setState] = useState(getAchievementSnapshot);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const name = state.name || 'ఆటగాడు';
  const stats = state.stats;
  const results = state.results;
  const unlockedCount = ACHIEVEMENTS.filter((b) => state.unlocked[b.id]).length;
  const lockedCount = ACHIEVEMENTS.length - unlockedCount;

  useEffect(() => {
    const fresh = syncAchievements();
    setState(fresh);
    if (fresh.newlyUnlocked.length) setToast(fresh.newlyUnlocked);
  }, []);

  const nextBadge = useMemo(
    () => ACHIEVEMENTS.find((b) => !state.unlocked[b.id]) || null,
    [state.unlocked]
  );
  const nextProgress = nextBadge ? badgeProgress(nextBadge, stats) : null;

  const visibleBadges = ACHIEVEMENTS.filter((b) => {
    if (filter === 'unlocked') return !!state.unlocked[b.id];
    if (filter === 'locked') return !state.unlocked[b.id];
    return true;
  });

  const initials = name.trim().charAt(0).toUpperCase() || 'అ';

  return (
    <div className="w-full max-w-6xl mx-auto pb-4 animate-fade-in">
      {/* Page heading */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase">
            అచీవ్మెంట్స్ · ఇల్మ్ యాత్ర
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-950">
            మీ ప్రోగ్రెస్
          </h1>
        </div>
        <p className="font-arabic text-2xl text-amber-800/80" dir="rtl">رَّبِّ زِدْنِي عِلْمًا</p>
      </div>

      {/* Profile card */}
      <section className="rounded-[28px] border border-amber-200/80 bg-white shadow-[0_8px_28px_rgba(18,55,42,0.06)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-900 via-amber-400 to-emerald-900" />
        <div className="p-5 sm:p-7 flex flex-wrap items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-100 ring-4 ring-emerald-50 flex items-center justify-center text-xl font-extrabold shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-amber-800 tracking-wide">
              అల్లాహ్ రహ్మత్ తో
            </div>
            <h2 className="truncate text-xl sm:text-2xl font-extrabold text-emerald-950">{name}</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 font-medium">
              ఇల్మ్ కోసం చేసే ప్రయత్నానికి బరకత్ ఉంది, ఇన్ షా అల్లాహ్.
            </p>
          </div>
          <div
            className="relative w-[76px] h-[76px] rounded-full shrink-0"
            style={{
              background: `conic-gradient(#bfa15f ${(unlockedCount / ACHIEVEMENTS.length) * 100}%, #edf2ee 0)`
            }}
          >
            <div className="absolute inset-[6px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
              <span className="text-lg font-extrabold text-emerald-950 leading-none">{unlockedCount}</span>
              <span className="text-[9px] font-bold text-slate-400">/ {ACHIEVEMENTS.length} బ్యాడ్జ్</span>
            </div>
          </div>
        </div>
        <div className="border-t border-emerald-100 bg-emerald-50/40 px-5 sm:px-7 py-4 flex items-start gap-3">
          <Moon className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
          <p className="text-xs sm:text-sm leading-relaxed text-emerald-950 font-medium">
            {results.length ? APPRECIATION : EMPTY_APPRECIATION}
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: CalendarCheck, label: 'క్విజ్ లు', value: stats.quizzes, tone: 'text-emerald-700' },
          { icon: TrendingUp, label: 'మొత్తం పాయింట్లు', value: stats.totalPoints, tone: 'text-amber-700' },
          { icon: Target, label: 'ఉత్తమ శాతం', value: `${stats.bestAccuracy}%`, tone: 'text-sky-700' },
          { icon: Flame, label: 'గరిష్ట వరుస రోజులు', value: stats.maxStreak, tone: 'text-rose-700' }
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_2px_10px_rgba(18,55,42,0.04)]">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <s.icon className={`w-3.5 h-3.5 ${s.tone}`} /> {s.label}
            </div>
            <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-emerald-950 tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Next milestone */}
      {nextBadge && nextProgress && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(18,55,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <BadgeMedallion badge={nextBadge} unlocked={false} />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                తదుపరి మైలురాయి
              </div>
              <div className="text-sm font-extrabold text-emerald-950 truncate">{nextBadge.title}</div>
              <div className="text-[11px] text-slate-500 font-medium">{nextBadge.requirement}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-emerald-900 tabular-nums">
                {nextProgress.current} / {nextProgress.target}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">పురోగతి</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-500"
              style={{ width: `${nextProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" /> సాధనలు
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {unlockedCount} అన్ లాక్ · {lockedCount} లాక్ అయ్యాయి
            </p>
          </div>
          <div className="inline-flex rounded-full bg-emerald-50 p-1 ring-1 ring-emerald-100">
            {[
              ['all', 'అన్నీ'],
              ['unlocked', `అన్ లాక్ (${unlockedCount})`],
              ['locked', `లాక్ (${lockedCount})`]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  filter === key
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-500 hover:text-emerald-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {visibleBadges.map((badge) => {
            const isUnlocked = !!state.unlocked[badge.id];
            const progress = badgeProgress(badge, stats);
            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => setSelected(badge)}
                className={`relative min-h-[214px] rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                  isUnlocked
                    ? 'border-emerald-200 bg-white shadow-[0_4px_16px_rgba(18,55,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(18,55,42,0.10)]'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                }`}
              >
                {isUnlocked && (
                  <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <BadgeMedallion badge={badge} unlocked={isUnlocked} />
                  {isUnlocked ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-amber-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <span className={`mt-3 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ring-1 ${TIER_CHIP[badge.tier]}`}>
                  {badge.tierLabel}
                </span>
                <div className={`mt-2 text-[13px] font-extrabold leading-snug ${isUnlocked ? 'text-emerald-950' : 'text-slate-600'}`}>
                  {badge.title}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate-500 font-medium min-h-[32px]">
                  {badge.requirement}
                </p>

                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  {isUnlocked ? (
                    <div className="text-[10px] font-bold text-emerald-800">
                      📅 {formatUnlockDate(state.unlocked[badge.id])}
                    </div>
                  ) : (
                    <>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500 transition-all duration-500"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-slate-400 tabular-nums">
                        {progress.current} / {progress.target}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      {results.length > 0 && (
        <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(18,55,42,0.04)]">
          <h2 className="text-sm sm:text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-700" /> ఇటీవలి ఇల్మ్ యాత్ర
          </h2>
          <div className="mt-3 divide-y divide-emerald-50">
            {results.slice(0, 5).map((item, idx) => {
              const acc = Math.min(
                100,
                Math.round(((Number(item.score) || 0) / (Number(item.total) || 10)) * 100)
              );
              return (
                <div key={`${item.quizDate}-${item.submittedAt || idx}`} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-950 truncate">
                      {item.quizDate?.startsWith('weekly-')
                        ? 'వీక్లీ టాప్ క్విజ్'
                        : formatDateLabel(item.quizDate)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {item.timeTakenFormatted || '00:00'} · {item.location || '—'}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">{acc}%</span>
                    <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-900 tabular-nums">
                      {item.score} / {item.total || 10}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => onStartQuiz?.(toDateKey())}
        className="mt-6 w-full py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-amber-50 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
      >
        <span>ఈరోజు ఇల్మ్ పెంచుకుని కొత్త బ్యాడ్జ్ గెలవండి</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {selected && (
        <BadgeDetailModal
          badge={selected}
          unlocked={!!state.unlocked[selected.id]}
          unlockedDate={state.unlocked[selected.id]}
          progress={badgeProgress(selected, stats)}
          onClose={() => setSelected(null)}
        />
      )}

      <BadgeToast badges={toast} onClose={() => setToast(null)} />
    </div>
  );
}
