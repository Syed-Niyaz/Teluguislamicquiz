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
  ScrollText,
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
import { getBadgeIcon } from '../data/badgeIcons';
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
  certificate: ScrollText
};

const TONES = {
  niyyat: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  talib: 'text-teal-700 bg-teal-50 ring-teal-200',
  sabr: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  rah: 'text-teal-700 bg-teal-50 ring-teal-200',
  nurani: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  fath: 'text-emerald-800 bg-emerald-50 ring-emerald-300',
  jawahir: 'text-teal-800 bg-teal-50 ring-teal-200',
  istiqamat: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  barakat: 'text-teal-800 bg-teal-50 ring-teal-300',
  nurul: 'text-emerald-800 bg-emerald-50 ring-emerald-300'
};

const LOCKED_MEDALLION = 'bg-[#eaf0f5] text-[#8a9daf] ring-[#d6e1ea]';
const LOCKED_CARD = 'border-[#dbe5ee] bg-[#f7fafd] hover:bg-[#f3f8fc]';

const TIER_CHIP = {
  bronze: 'text-[#9a7427] bg-[#fdf8ec] ring-[#f0e2be]',
  silver: 'text-[#6c8398] bg-[#eef2f6] ring-[#d7e0e8]',
  emerald: 'text-emerald-800 bg-emerald-50 ring-emerald-200',
  gold: 'text-[#9a7427] bg-[#fdf8ec] ring-[#e8cf95]',
  premium: 'text-[#a85c72] bg-[#fdf2f5] ring-[#f3d4dd]'
};

const APPRECIATION =
  'మాషా అల్లాహ్! మీ ఆసక్తి, ప్రయత్నం అభినందనీయం. ఇస్లామిక్ జ్ఞానాన్ని పెంపొందించుకోవాలనే మీ ప్రయత్నానికి అల్లాహ్ బరకత్ ప్రసాదించుగాక. ఇన్ షా అల్లాహ్, మరిన్ని మంచి విజయాలు సాధించండి!';

const EMPTY_APPRECIATION =
  'బిస్మిల్లాహిర్ రహ్మానిర్ రహీమ్ తో మొదటి అడుగు వేయండి. అల్లాహ్ మీకు తౌఫీక్ దాన్ చేయుగాక.';

function BadgeMedallion({ badge, unlocked, size = 'md' }) {
  const Icon = ICONS[badge.iconKey] || Award;
  const iconUrl = getBadgeIcon(badge);
  const dimension = size === 'lg' ? 'w-20 h-20 rounded-[22px]' : 'w-14 h-14 rounded-2xl';
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div
      className={`${dimension} shrink-0 ring-2 flex items-center justify-center transition-all duration-300 ${
        unlocked ? `${TONES[badge.id]}` : `${LOCKED_MEDALLION}`
      }`}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          className={`${iconSize} object-contain transition-all duration-300 ${
            unlocked ? '' : 'grayscale blur-[1.5px] opacity-60'
          }`}
        />
      ) : (
        <Icon
          className={`${size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} ${unlocked ? '' : 'blur-[1px]'}`}
          strokeWidth={1.7}
        />
      )}
    </div>
  );
}

function BadgeDetailModal({ badge, unlocked, unlockedDate, progress, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-teal-950/25 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={badge.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white border border-emerald-200/80 shadow-xl overflow-hidden"
      >
        <div
          className="h-1.5"
          style={{ background: 'linear-gradient(90deg, #0f766e 0%, #d4af63 34%, #5aa9d6 67%, #e8a8b8 100%)' }}
        />
        <div className="p-6 sm:p-7 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center cursor-pointer transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center pt-1">
            <BadgeMedallion badge={badge} unlocked={unlocked} size="lg" />
          </div>

          <span
            className={`inline-block mt-4 text-[10px] font-bold px-3 py-1 rounded-full ring-1 ${TIER_CHIP[badge.tier]}`}
          >
            {badge.tierLabel}
          </span>

          <h3 className="mt-3 text-xl font-extrabold text-emerald-950">{badge.title}</h3>
          {badge.meaning && (
            <p className="mt-1 text-sm font-semibold text-teal-700">{badge.meaning}</p>
          )}
          <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">{badge.requirement}</p>

          {unlocked ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4" /> అన్ లాక్ అయ్యింది
              </div>
              <div className="mt-1 text-sm font-semibold text-emerald-950">
                📅 {formatUnlockDate(unlockedDate)}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#d6e1ea] bg-[#f5f9fb] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#6c8398]">
                <span>పురోగతి</span>
                <span>{progress.current} / {progress.target}</span>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-[#e2eaf1] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9db1c2] transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8a9daf] font-medium">
                <Lock className="w-3.5 h-3.5" /> ఇంకా లాక్ అయ్యే ఉంది
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 font-bold text-sm cursor-pointer transition"
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

  return (
    <div className="w-full max-w-6xl mx-auto pb-6 sm:pb-10 animate-fade-in space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
          మీ ప్రోగ్రెస్
        </h1>
        <p className="font-arabic text-2xl text-teal-800/70" dir="rtl">
          رَّبِّ زِدْنِي عِلْمًا
        </p>
      </div>

      {/* Profile */}
      <section className="card-surface rounded-[28px] overflow-hidden">
        <div
          className="h-1.5"
          style={{ background: 'linear-gradient(90deg, #0f766e 0%, #d4af63 32%, #5aa9d6 66%, #e8a8b8 100%)' }}
        />
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-teal-700 tracking-wide">అల్లాహ్ రహ్మత్ తో</div>
              <h2 className="truncate text-xl sm:text-2xl font-extrabold text-emerald-950">{name}</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 font-medium">
                మాషా అల్లాహ్! జ్ఞానాన్ని పెంపొందించుకునే ప్రతి అడుగు మీకు మేలును, అల్లాహ్ అనుగ్రహాన్ని అందించుగాక.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-1 sm:pt-0">
              <div className="sm:hidden text-xs font-semibold text-slate-500">
                {unlockedCount} / {ACHIEVEMENTS.length} బ్యాడ్జ్‌లు అన్‌లాక్
              </div>
              <div
                className="relative w-[84px] h-[84px] rounded-full shrink-0"
                style={{
                  background: `conic-gradient(#0f766e ${(unlockedCount / ACHIEVEMENTS.length) * 100}%, #e7f1ee 0)`
                }}
              >
                <div className="absolute inset-[7px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xl font-extrabold text-emerald-950 leading-none">{unlockedCount}</span>
                  <span className="text-[9px] font-bold text-slate-400">/ {ACHIEVEMENTS.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 sm:px-5 py-4 flex items-start gap-3">
            <Moon className="w-4 h-4 mt-0.5 text-teal-700 shrink-0" />
            <p className="text-sm leading-relaxed text-emerald-950 font-medium">
              {results.length ? APPRECIATION : EMPTY_APPRECIATION}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: CalendarCheck, label: 'క్విజ్ లు', value: stats.quizzes, tone: 'text-emerald-700', bg: 'bg-emerald-50' },
          { icon: TrendingUp, label: 'మొత్తం పాయింట్లు', value: stats.totalPoints, tone: 'text-[#b58b3a]', bg: 'bg-[#fdf8ec]' },
          { icon: Target, label: 'ఉత్తమ శాతం', value: `${stats.bestAccuracy}%`, tone: 'text-[#4b9ac7]', bg: 'bg-[#eef7fc]' },
          { icon: Flame, label: 'గరిష్ట వరుస రోజులు', value: stats.maxStreak, tone: 'text-[#c2798e]', bg: 'bg-[#fdf2f5]' }
        ].map((s) => (
          <div key={s.label} className="card-surface rounded-2xl p-4 sm:p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.tone} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="text-[11px] font-bold text-slate-500">{s.label}</div>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Next milestone */}
      {nextBadge && nextProgress && (
        <div className="card-surface rounded-2xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <BadgeMedallion badge={nextBadge} unlocked={false} />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold tracking-wider text-teal-700 uppercase">తదుపరి మైలురాయి</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-950 truncate mt-0.5">
                {nextBadge.title}
              </div>
              {nextBadge.meaning && (
                <div className="text-xs font-semibold text-teal-700 mt-0.5">{nextBadge.meaning}</div>
              )}
              <div className="text-xs text-slate-500 font-medium mt-0.5">{nextBadge.requirement}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-extrabold text-emerald-900 tabular-nums">
                {nextProgress.current} / {nextProgress.target}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">పురోగతి</div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-700 transition-all duration-500"
              style={{ width: `${nextProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-700" /> సాధనలు
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {unlockedCount} అన్ లాక్ · {lockedCount} లాక్ అయ్యాయి
            </p>
          </div>
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-emerald-100 shadow-sm">
            {[
              ['all', 'అన్నీ'],
              ['unlocked', `అన్ లాక్ (${unlockedCount})`],
              ['locked', `లాక్ (${lockedCount})`]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  filter === key
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-teal-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {visibleBadges.map((badge) => {
            const isUnlocked = !!state.unlocked[badge.id];
            const progress = badgeProgress(badge, stats);
            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => setSelected(badge)}
                className={`group relative rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                  isUnlocked
                    ? 'card-surface hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,118,110,0.10)]'
                    : LOCKED_CARD
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <BadgeMedallion badge={badge} unlocked={isUnlocked} />
                  {isUnlocked ? (
                    <span className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-white border border-[#d6e1ea] text-[#8a9daf] flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <span
                  className={`mt-4 inline-block text-[9px] font-bold px-2.5 py-1 rounded-full ring-1 ${TIER_CHIP[badge.tier]}`}
                >
                  {badge.tierLabel}
                </span>

                <div
                  className={`mt-2.5 text-sm font-extrabold leading-snug ${
                    isUnlocked ? 'text-emerald-950' : 'text-[#6c8398]'
                  }`}
                >
                  {badge.title}
                </div>
                {badge.meaning && (
                  <div
                    className={`mt-0.5 text-[11px] font-semibold leading-snug ${
                      isUnlocked ? 'text-teal-700' : 'text-[#7c95a8]'
                    }`}
                  >
                    {badge.meaning}
                  </div>
                )}

                <p
                  className={`mt-1.5 text-[11px] leading-relaxed font-medium min-h-[34px] ${
                    isUnlocked ? 'text-slate-500' : 'text-[#8a9daf]'
                  }`}
                >
                  {badge.requirement}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100/80">
                  {isUnlocked ? (
                    <div className="text-[11px] font-bold text-emerald-800">
                      📅 {formatUnlockDate(state.unlocked[badge.id])}
                    </div>
                  ) : (
                    <>
                      <div className="h-1.5 rounded-full bg-[#e2eaf1] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#9db1c2] transition-all duration-500"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <div className="mt-1.5 text-[10px] font-semibold text-[#8a9daf] tabular-nums">
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
        <section className="card-surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm sm:text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-700" /> ఇటీవలి ఇల్మ్ యాత్ర
          </h2>
          <div className="mt-4 divide-y divide-emerald-50">
            {results.slice(0, 5).map((item, idx) => {
              const acc = Math.min(
                100,
                Math.round(((Number(item.score) || 0) / (Number(item.total) || 10)) * 100)
              );
              return (
                <div
                  key={`${item.quizDate}-${item.submittedAt || idx}`}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-emerald-950 truncate">
                      {item.quizDate?.startsWith('weekly-')
                        ? 'వీక్లీ టాప్ క్విజ్'
                        : formatDateLabel(item.quizDate)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {item.timeTakenFormatted || '00:00'} · {item.location || '—'}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">{acc}%</span>
                    <span className="rounded-xl bg-teal-50 border border-teal-100 px-3 py-1.5 text-xs font-extrabold text-teal-900 tabular-nums">
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
        className="w-full py-3.5 sm:py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
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
