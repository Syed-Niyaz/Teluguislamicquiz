import React from 'react';
import {
  Sparkles,
  Flame,
  CalendarCheck,
  Medal,
  Trophy,
  Star,
  Zap,
  Award,
  Target,
  ChevronRight,
  Lock,
  TrendingUp
} from 'lucide-react';
import { getLocalResults } from '../services/sheetService';
import { toDateKey, addDays, formatDateLabel } from '../data/dailyQuizzes';

const BADGES = [
  {
    id: 'first',
    title: 'తొలి అడుగు',
    desc: 'మొదటి క్విజ్ ఆడినప్పుడు',
    icon: Sparkles,
    art: 'from-emerald-400 to-emerald-700',
    ring: 'border-emerald-300 bg-emerald-50'
  },
  {
    id: 'three',
    title: 'మూడు రోజుల వీరుడు',
    desc: '3 రోజులు వరకు పాల్గొన్నప్పుడు',
    icon: Flame,
    art: 'from-orange-400 to-rose-600',
    ring: 'border-orange-300 bg-orange-50'
  },
  {
    id: 'week',
    title: 'వారం పట్టుదల',
    desc: '7 రోజులు పాల్గొన్నప్పుడు',
    icon: CalendarCheck,
    art: 'from-sky-400 to-blue-700',
    ring: 'border-sky-300 bg-sky-50'
  },
  {
    id: 'ten',
    title: 'పది రోజుల ఛాంపియన్',
    desc: '10 రోజులు పాల్గొన్నప్పుడు',
    icon: Medal,
    art: 'from-violet-500 to-indigo-700',
    ring: 'border-violet-300 bg-violet-50'
  },
  {
    id: 'perfect',
    title: 'పరిపూర్ణ విజయం',
    desc: '100% స్కోర్ సాధించినప్పుడు',
    icon: Trophy,
    art: 'from-amber-300 to-amber-600',
    ring: 'border-amber-300 bg-amber-50'
  },
  {
    id: 'scholar',
    title: 'జ్ఞాన దీపం',
    desc: 'సగటు శాతం 80% దాటినప్పుడు',
    icon: Star,
    art: 'from-fuchsia-400 to-purple-700',
    ring: 'border-fuchsia-300 bg-fuchsia-50'
  },
  {
    id: 'speed',
    title: 'మెరుపు ఆటగాడు',
    desc: '60 సెకన్లలోపు పూర్తి చేసినప్పుడు',
    icon: Zap,
    art: 'from-rose-400 to-red-700',
    ring: 'border-rose-300 bg-rose-50'
  },
  {
    id: 'streak',
    title: 'వరుస విజయాలు',
    desc: '3 రోజులు వరుసగా ఆడినప్పుడు',
    icon: Award,
    art: 'from-teal-400 to-emerald-700',
    ring: 'border-teal-300 bg-teal-50'
  }
];

export default function ProgressScreen({ onStartQuiz }) {
  const results = getLocalResults();
  const name = results[0]?.name || 'ఆటగాడు';

  const uniqueDates = [...new Set(results.map((r) => r.quizDate).filter(Boolean))];
  const dailyDates = uniqueDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const playedCount = uniqueDates.length;
  const totalCorrect = results.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
  const averageAccuracy = results.length
    ? Math.round(
        results.reduce((sum, r) => {
          const score = Number(r.score) || 0;
          const total = Number(r.total) || 10;
          return sum + Math.min(100, Math.round((score / total) * 100));
        }, 0) / results.length
      )
    : 0;
  const hasPerfect = results.some((r) => {
    const score = Number(r.score) || 0;
    return score > 0 && score === (Number(r.total) || 10);
  });
  const fastest = results.map((r) => Number(r.timeTakenSeconds) || 0).filter((s) => s > 0);

  const today = toDateKey();
  let cursor = dailyDates.includes(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dailyDates.includes(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const unlocked = {
    first: playedCount >= 1,
    three: dailyDates.length >= 3,
    week: dailyDates.length >= 7,
    ten: dailyDates.length >= 10,
    perfect: hasPerfect,
    scholar: averageAccuracy >= 80,
    speed: fastest.length > 0 && Math.min(...fastest) <= 60,
    streak: streak >= 3
  };
  const unlockedCount = BADGES.filter((b) => unlocked[b.id]).length;
  const weekProgress = Math.min(dailyDates.length, 7);

  const appreciation = !results.length
    ? 'ఇంకా క్విజ్ ఆడలేదు. ఈరోజు మొదటి అడుగు వేసి మీ ప్రయాణం మొదలుపెట్టండి!'
    : streak >= 7
    ? 'మీ 7 రోజుల పట్టుదల అద్భుతం! అల్హందులిల్లాహ్, మీరు నిజమైన ఛాంపియన్!'
    : hasPerfect
    ? 'మాషా అల్లాహ్! పరిపూర్ణ స్కోర్ సాధించిన మీ జ్ఞానానికి సలామ్!'
    : averageAccuracy >= 90
    ? 'అద్భుతం! మీ ఇస్లామిక్ జ్ఞానం చాలా బలంగా ఉంది — ఇలాగే కొనసాగండి!'
    : unlockedCount >= 4
    ? 'జజాకల్లాహు ఖైర్! మీరు గొప్ప బ్యాడ్జ్ లు సంపాదించారు — మరిన్ని గెలవండి!'
    : 'మంచి మొదలు! ప్రతిరోజూ కొంచెం నేర్చుకుంటూ ముందుకు సాగండి.';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      {/* Hero card */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shrink-0">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wide">
              మీ ప్రోగ్రెస్
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-emerald-950 truncate">{name}</h2>
            <p className="text-xs sm:text-sm text-emerald-800/80 mt-1 font-medium">
              ప్రతి రోజు క్విజ్ ఆడి బ్యాడ్జ్ లు గెలవండి!
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-amber-200 px-4 py-2 text-center shadow-sm shrink-0">
            <div className="text-2xl font-extrabold text-amber-700">{unlockedCount}<span className="text-sm text-amber-600">/{BADGES.length}</span></div>
            <div className="text-[10px] sm:text-xs font-bold text-amber-800">బ్యాడ్జ్ లు</div>
          </div>
        </div>

        <div className="relative mt-5 p-4 rounded-2xl bg-white/85 border border-emerald-100 flex items-start gap-3">
          <span className="text-2xl leading-none">✨</span>
          <p className="text-sm sm:text-base text-emerald-950 font-semibold leading-relaxed">{appreciation}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-bold text-emerald-800 mb-1">క్విజ్ లు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">{playedCount}</div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-bold text-sky-800 mb-1">సరైన సమాధానాలు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-950">{totalCorrect}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-bold text-amber-800 mb-1">సగటు శాతం</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950">{averageAccuracy}%</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 sm:p-4">
          <div className="text-[11px] sm:text-xs font-bold text-rose-800 mb-1">వరుస రోజులు</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-950 flex items-center gap-1">
            <Flame className="w-5 h-5 text-rose-600" /> {streak}
          </div>
        </div>
      </div>

      {/* 7-day goal */}
      <div className="rounded-3xl border border-emerald-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-700" /> 7 రోజుల లక్ష్యం
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-800">{weekProgress} / 7 రోజులు</span>
        </div>
        <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
            style={{ width: `${(weekProgress / 7) * 100}%` }}
          />
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-800/80 font-medium mt-2">
          {weekProgress >= 7 ? 'లక్ష్యం పూర్తి! మీకు “వారం పట్టుదల” బ్యాడ్జ్ లభించింది 🎉' : '7 రోజులు పాల్గొంటే “వారం పట్టుదల” బ్యాడ్జ్ గెలవండి.'}
        </p>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-amber-700" />
          <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">మీ బ్యాడ్జ్ లు</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlocked[badge.id];
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-3 sm:p-4 text-center transition ${
                  isUnlocked
                    ? `${badge.ring} shadow-sm`
                    : 'border-slate-200 bg-slate-50/70 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md mb-2.5 ${
                    isUnlocked
                      ? `bg-gradient-to-br ${badge.art}`
                      : 'bg-gradient-to-br from-slate-300 to-slate-400'
                  }`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className={`font-bold text-xs sm:text-sm ${isUnlocked ? 'text-emerald-950' : 'text-slate-600'}`}>
                  {badge.title}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1 leading-snug">
                  {badge.desc}
                </div>
                <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${isUnlocked ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {isUnlocked ? <><Sparkles className="w-3 h-3" /> గెలిచారు</> : <><Lock className="w-3 h-3" /> ఇంకా లాక్ అయ్యే ఉంది</>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      {results.length > 0 && (
        <div className="rounded-3xl border border-emerald-100 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 mb-3 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" /> ఇటీవలి క్విజ్ లు
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

      {/* CTA */}
      <button
        onClick={() => onStartQuiz?.(toDateKey())}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
      >
        <span>ఈరోజు క్విజ్ ఆడి కొత్త బ్యాడ్జ్ గెలవండి</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
