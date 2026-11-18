import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Lock,
  Target,
  Flame,
  TrendingUp,
  CalendarCheck,
  ChevronRight,
  X,
  Check
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

const APPRECIATION =
  'మాషా అల్లాహ్! మీ ఆసక్తి, ప్రయత్నం అభినందనీయం. ఇస్లామిక్ జ్ఞానాన్ని పెంపొందించుకోవాలనే మీ ప్రయత్నానికి అల్లాహ్ బరకత్ ప్రసాదించుగాక. ఇన్ షా అల్లాహ్, మరిన్ని మంచి విజయాలు సాధించండి!';

const EMPTY_APPRECIATION =
  'బిస్మిల్లాహిర్ రహ్మానిర్ రహీమ్ తో మొదటి అడుగు వేయండి. అల్లాహ్ మీకు తౌఫీక్ దాన్ చేయుగాక.';

// Subtle Islamic geometric diamond pattern — decorative, never loud.
const GEOMETRIC = {
  backgroundImage:
    'linear-gradient(45deg, rgba(183,148,63,0.055) 25%, transparent 25%), linear-gradient(-45deg, rgba(183,148,63,0.055) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(183,148,63,0.055) 75%), linear-gradient(-45deg, transparent 75%, rgba(183,148,63,0.055) 75%)',
  backgroundSize: '22px 22px',
  backgroundPosition: '0 0, 0 11px, 11px -11px, -11px 0px'
};

const TIER_LABEL_CLASS = {
  bronze: 'text-amber-800 bg-amber-100/80 border-amber-300',
  silver: 'text-slate-700 bg-slate-100 border-slate-300',
  emerald: 'text-emerald-800 bg-emerald-100/80 border-emerald-300',
  gold: 'text-yellow-900 bg-yellow-100/80 border-yellow-400',
  premium: 'text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-200 border-amber-400'
};

function BadgeDetailModal({ badge, unlocked, unlockedDate, progress, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={badge.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white border border-amber-200 shadow-2xl overflow-hidden"
      >
        <div className="relative h-28 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 flex items-center justify-center" style={GEOMETRIC}>
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${badge.art} ${unlocked ? badge.glow : 'grayscale blur-[1px] opacity-70'} flex items-center justify-center text-4xl border-2 ${badge.ring}`}
          >
            {badge.icon}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6 text-center">
          <span className={`inline-block text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${TIER_LABEL_CLASS[badge.tier]}`}>
            {badge.tierLabel}
          </span>
          <h3 className="text-xl font-extrabold text-emerald-950">{badge.title}</h3>
          <p className="text-sm text-emerald-900/80 mt-2 font-medium">{badge.requirement}</p>

          {unlocked ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4" /> అన్ లాక్ అయ్యింది
              </div>
              <div className="text-sm text-emerald-950 font-semibold mt-1">
                📅 {formatUnlockDate(unlockedDate)}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>పురోగతి</span>
                <span>{progress.current} / {progress.target}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-2">
                <Lock className="w-3.5 h-3.5" /> ఇంకా లాక్ అయ్యే ఉంది
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm cursor-pointer transition"
          >
            మూసివేయండి
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgressScreen({ onStartQuiz }) {
  // First render is a pure read; awards happen in the effect below so that
  // StrictMode's double render can never silently swallow a toast.
  const [state, setState] = useState(getAchievementSnapshot);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);

  const name = state.name || 'ఆటగాడు';
  const stats = state.stats;
  const results = state.results;
  const unlockedCount = ACHIEVEMENTS.filter((b) => state.unlocked[b.id]).length;

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      {/* Hero */}
      <div
        className="relative rounded-3xl border border-amber-300/70 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 sm:p-7 shadow-sm overflow-hidden"
        style={GEOMETRIC}
      >
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-amber-400/60 text-amber-200 flex items-center justify-center shadow-md shrink-0">
            <Award className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-amber-800 tracking-wide">
              అల్లాహ్ రహ్మత్ తో — మీ ఇల్మ్ ప్రయాణం
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-emerald-950 truncate">{name}</h2>
            <p className="text-xs sm:text-sm text-emerald-800/80 mt-1 font-medium">
              ఇల్మ్ కోసం చేసే ప్రయత్నానికి బరకత్ ఉంది, ఇన్ షా అల్లాహ్.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-amber-400/70 px-4 py-2 text-center shadow-sm shrink-0">
            <div className="text-2xl font-extrabold text-amber-800">{unlockedCount}<span className="text-sm text-amber-700">/10</span></div>
            <div className="text-[10px] sm:text-xs font-bold text-emerald-900">బ్యాడ్జ్ లు</div>
          </div>
        </div>

        <div className="relative mt-5 p-4 rounded-2xl bg-white/90 border border-emerald-200/80 flex items-start gap-3">
          <span className="text-2xl leading-none">🌙</span>
          <p className="text-sm sm:text-base text-emerald-950 font-semibold leading-relaxed">
            {results.length ? APPRECIATION : EMPTY_APPRECIATION}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="text-[11px] sm:text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" /> క్విజ్ లు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">{stats.quizzes}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="text-[11px] sm:text-xs font-bold text-amber-800 mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> మొత్తం పాయింట్లు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats.totalPoints}</div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="text-[11px] sm:text-xs font-bold text-sky-800 mb-1 flex items-center gap-1"><Target className="w-3.5 h-3.5" /> ఉత్తమ శాతం</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-950">{stats.bestAccuracy}%</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="text-[11px] sm:text-xs font-bold text-rose-800 mb-1 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> వరుస రోజులు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-950">{stats.maxStreak}</div>
        </div>
      </div>

      {/* Next badge to unlock */}
      {nextBadge && nextProgress && (
        <div className="rounded-3xl border border-amber-300/70 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-4 sm:p-5 shadow-sm" style={GEOMETRIC}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${nextBadge.art} flex items-center justify-center text-xl text-white shadow-sm shrink-0`}>
              {nextBadge.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold text-amber-800">తదుపరి బ్యాడ్జ్</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-950 truncate">{nextBadge.title}</div>
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-800 shrink-0">
              {nextProgress.current} / {nextProgress.target}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
              style={{ width: `${nextProgress.percent}%` }}
            />
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-900/80 font-medium mt-2">{nextBadge.requirement}</p>
        </div>
      )}

      {/* 10 achievement badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-amber-700" />
          <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">సాధనలు — 10 బ్యాడ్జ్ లు</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = !!state.unlocked[badge.id];
            const progress = badgeProgress(badge, stats);
            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => setSelected(badge)}
                className={`group relative rounded-2xl border p-3 sm:p-4 text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  isUnlocked
                    ? `${badge.ring} ${badge.glow} bg-white hover:-translate-y-0.5`
                    : 'border-slate-300 bg-slate-100/80 hover:border-slate-400'
                }`}
              >
                {isUnlocked && <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={GEOMETRIC} />}
                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${badge.art} flex items-center justify-center text-2xl sm:text-3xl border-2 ${badge.ring} ${
                        isUnlocked ? badge.glow : 'grayscale blur-[1.5px] opacity-70'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-800 text-amber-100 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                        <Check className="w-2.5 h-2.5" /> అన్ లాక్
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-300/80 text-slate-600 flex items-center justify-center shrink-0">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className={`font-extrabold text-xs sm:text-sm ${isUnlocked ? 'text-emerald-950' : 'text-slate-600'}`}>
                    {badge.title}
                  </div>
                  <div className={`text-[10px] sm:text-[11px] mt-1 leading-snug ${isUnlocked ? 'text-emerald-900/75' : 'text-slate-500'}`}>
                    {badge.requirement}
                  </div>

                  <span className={`inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${TIER_LABEL_CLASS[badge.tier]}`}>
                    {badge.tierLabel}
                  </span>

                  {isUnlocked ? (
                    <div className="mt-2 text-[10px] sm:text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      📅 {formatUnlockDate(state.unlocked[badge.id])}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="w-full h-1.5 rounded-full bg-slate-300/70 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-700 transition-all duration-500"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-1">{progress.current} / {progress.target}</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {results.length > 0 && (
        <div className="rounded-3xl border border-emerald-100 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 mb-3 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" /> ఇటీవలి ఇల్మ్ యాత్ర
          </h3>
          <div className="space-y-2">
            {results.slice(0, 5).map((item, idx) => {
              const acc = Math.min(
                100,
                Math.round(((Number(item.score) || 0) / (Number(item.total) || 10)) * 100)
              );
              return (
                <div
                  key={`${item.quizDate}-${item.submittedAt || idx}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 text-sm truncate">
                      {item.quizDate?.startsWith('weekly-') ? 'వీక్లీ టాప్ క్విజ్' : formatDateLabel(item.quizDate)}
                    </div>
                    <div className="text-[11px] text-emerald-800/80 font-medium">
                      {item.timeTakenFormatted || '00:00'} • {item.location || '—'}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-emerald-800 font-bold text-xs sm:text-sm">{acc}%</span>
                    <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-950 font-extrabold text-sm shadow-sm">
                      {item.score} / {item.total || 10}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onStartQuiz?.(toDateKey())}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-black text-amber-100 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-amber-400/40"
      >
        <span>ఈరోజు ఇల్మ్ పెంచుకుని కొత్త బ్యాడ్జ్ గెలవండి</span>
        <ChevronRight className="w-5 h-5" />
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
