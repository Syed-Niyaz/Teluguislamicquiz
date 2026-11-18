import React, { useEffect, useState } from 'react';
import {
  Clock,
  RefreshCw,
  Trophy,
  MapPin,
  Briefcase,
  CalendarDays,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Users,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { fetchLeaderboard, ADMIN_PASSWORD } from '../services/sheetService';
import { formatDateLabel, toDateKey, addDays } from '../data/dailyQuizzes';

const AUTH_KEY = 'islamic_quiz_admin_authed';

const readAuth = () => {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch (err) {
    return false;
  }
};

// Live sheet rows can be missing total/percentage (older script deployments),
// so accuracy is always calculated from score / total here, admin-side only.
const accuracyOf = (item) => {
  const total = Number(item.total) || 10;
  const score = Number(item.score) || 0;
  return Math.max(0, Math.min(100, Math.round((score / total) * 100)));
};

const formatClock = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function Leaderboard({ highlightName, quizDate }) {
  const today = toDateKey();
  const [authed, setAuthed] = useState(readAuth);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedDate, setSelectedDate] = useState(quizDate || today);
  const [allDates, setAllDates] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ source: '', error: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaderboard(allDates ? '' : selectedDate, ADMIN_PASSWORD);
      setLeaderboard(res.items || []);
      setMeta({ source: res.source, error: res.error || '' });
    } catch (err) {
      console.error(err);
      setMeta({ source: 'local', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, selectedDate, allDates]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError('');
      setPassword('');
      try {
        sessionStorage.setItem(AUTH_KEY, '1');
      } catch (err) {
        // ignore
      }
    } else {
      setAuthError('తప్పు పాస్‌వర్డ్. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  };

  const handleLock = () => {
    setAuthed(false);
    setLeaderboard([]);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch (err) {
      // ignore
    }
  };

  // ----- Password gate (admin only) -----
  if (!authed) {
    return (
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-emerald-100/90 shadow-md mt-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-emerald-950">లీడర్‌బోర్డ్ (Admin Only)</h3>
          <p className="text-sm text-emerald-800/80 font-medium mt-1 mb-5">
            లీడర్‌బోర్డ్‌ను చూడటానికి అడ్మిన్ పాస్‌వర్డ్ నమోదు చేయండి.
          </p>

          <form onSubmit={handleUnlock} className="space-y-3 text-left">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="Admin password"
                autoComplete="off"
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-emerald-200 bg-emerald-50/20 text-base text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl text-emerald-800 hover:bg-emerald-50 flex items-center justify-center cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>అన్‌లాక్ చేయండి</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 font-medium mt-4 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Only admin can view full player results
          </p>
          <p className="text-[11px] text-emerald-800/80 font-medium mt-1.5">
            స్కోర్, శాతం, సమయం మరియు మొత్తం గణాంకాలు అడ్మిన్ వ్యూలో మాత్రమే కనిపిస్తాయి.
          </p>
        </div>
      </div>
    );
  }

  // ----- Admin leaderboard -----
  const dateLabel = allDates
    ? 'అన్ని తేదీలు (All dates)'
    : `${formatDateLabel(selectedDate)}${selectedDate === today ? ' • ఈరోజు' : ''}`;

  const playerCount = leaderboard.length;
  const averageScore = playerCount
    ? (leaderboard.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / playerCount).toFixed(1)
    : '0';
  const averageAccuracy = playerCount
    ? Math.round(leaderboard.reduce((sum, item) => sum + accuracyOf(item), 0) / playerCount)
    : 0;
  const times = leaderboard.map((item) => Number(item.timeTakenSeconds) || 0).filter((s) => s > 0);
  const fastestTime = times.length ? Math.min(...times) : null;
  const topPlayer = leaderboard[0];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-8 border border-emerald-100/90 shadow-md mt-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-950 flex flex-wrap items-center gap-2">
              లీడర్‌బోర్డ్
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </h3>
            <p className="text-xs text-emerald-800 mt-1 inline-flex items-center gap-1.5 font-semibold">
              <CalendarDays className="w-3.5 h-3.5" />
              {dateLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="రిఫ్రెష్ చేయండి"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">రిఫ్రెష్</span>
          </button>
          <button
            onClick={handleLock}
            className="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="లాక్ చేయండి"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">లాక్</span>
          </button>
        </div>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="date"
          value={selectedDate}
          disabled={allDates}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
          className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-sm text-emerald-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => {
            setAllDates(false);
            setSelectedDate(today);
          }}
          className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
            !allDates && selectedDate === today
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          ఈరోజు
        </button>
        <button
          type="button"
          onClick={() => {
            setAllDates(false);
            setSelectedDate(addDays(today, -1));
          }}
          className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
            !allDates && selectedDate === addDays(today, -1)
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          నిన్న
        </button>
        <button
          type="button"
          onClick={() => setAllDates((v) => !v)}
          className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
            allDates
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          అన్ని తేదీలు
        </button>
      </div>

      {meta.error && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-medium flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Live Google Sheet కనెక్షన్ సమస్య: {meta.error}
            {meta.source === 'local' ? ' • స్థానిక ఫలితాలు చూపిస్తున్నాము' : ''}
          </span>
        </div>
      )}

      {/* Extra insights — visible to admin only */}
      {!loading && playerCount > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 mb-1">
                <Users className="w-3.5 h-3.5" /> పాల్గొన్నవారు
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-950">{playerCount}</div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3 sm:p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-sky-800 mb-1">
                <Target className="w-3.5 h-3.5" /> సగటు స్కోరు
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-sky-950">{averageScore}<span className="text-xs sm:text-sm font-semibold text-sky-700"> / 10</span></div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 sm:p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-800 mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> సగటు శాతం
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-950">{averageAccuracy}%</div>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3 sm:p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-purple-800 mb-1">
                <Zap className="w-3.5 h-3.5" /> వేగవంతమైన సమయం
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-purple-950 font-mono">
                {fastestTime !== null ? formatClock(fastestTime) : '—'}
              </div>
            </div>
          </div>

          {topPlayer && (
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 flex items-center gap-3">
              <span className="text-2xl leading-none">🏆</span>
              <div className="min-w-0 text-xs sm:text-sm text-emerald-950 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-emerald-700 font-bold">టాప్ పెర్ఫార్మర్:</span>
                <span className="font-extrabold">{topPlayer.name}</span>
                <span className="text-emerald-800">{topPlayer.score} / {topPlayer.total || 10}</span>
                <span className="text-amber-800 font-bold">{accuracyOf(topPlayer)}%</span>
              </div>
            </div>
          )}
        </>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-emerald-800 font-medium">డేటా లోడ్ అవుతోంది...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          ఈ తేదీకి ఇంకా ఫలితాలు లేవు.
          <span className="block mt-1 text-xs text-gray-400">
            (మీరు సబ్మిట్ చేసిన తర్వాత ఇక్కడ వెంటనే కనిపిస్తుంది)
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="w-full min-w-[680px] text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-emerald-200 text-emerald-950 bg-emerald-50/70">
                <th className="py-3 px-3 sm:px-3.5 rounded-l-2xl font-bold whitespace-nowrap">ర్యాంక్</th>
                <th className="py-3 px-3 sm:px-3.5 font-bold">పేరు & వివరాలు</th>
                <th className="py-3 px-3 sm:px-3.5 text-center font-bold whitespace-nowrap">స్కోర్</th>
                <th className="py-3 px-3 sm:px-3.5 font-bold whitespace-nowrap">శాతం / Accuracy</th>
                <th className="py-3 px-3 sm:px-3.5 text-right rounded-r-2xl font-bold whitespace-nowrap">సమయం</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/70">
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                const isUser = highlightName && item.name === highlightName;

                return (
                  <tr
                    key={item._rowIndex || `${item.name}-${item.submittedAt || idx}`}
                    className={`transition-colors ${isUser ? 'bg-emerald-100/70 font-semibold' : 'hover:bg-emerald-50/50'}`}
                  >
                    <td className="py-3.5 px-3.5 align-top">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm border border-amber-300 shadow-sm">
                          🥇 1
                        </span>
                      ) : rank === 2 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300">
                          🥈 2
                        </span>
                      ) : rank === 3 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm border border-amber-200">
                          🥉 3
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold">
                          {rank}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3.5 align-top">
                      <div className="font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
                        <span>{item.name}</span>
                        {isUser && (
                          <span className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                            మీరు
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                            {item.location}
                          </span>
                        )}
                        {item.occupation && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                            {item.occupation}
                          </span>
                        )}
                        {item.quizDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-sky-700" />
                            {formatDateLabel(String(item.quizDate))}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 text-center align-top">
                      <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-sm sm:text-base shadow-sm">
                        {item.score} / {item.total || 10}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 align-top">
                      {(() => {
                        const acc = accuracyOf(item);
                        const bar = acc >= 80 ? 'bg-emerald-600' : acc >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                        const text = acc >= 80 ? 'text-emerald-700' : acc >= 50 ? 'text-amber-700' : 'text-rose-600';
                        return (
                          <div className="flex flex-col gap-1.5 min-w-[72px]">
                            <span className={`font-bold text-sm sm:text-base ${text}`}>{acc}%</span>
                            <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                              <div className={`h-full rounded-full ${bar}`} style={{ width: `${acc}%` }} />
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-3.5 text-right font-mono text-sm sm:text-base font-bold text-slate-800 align-top">
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-700" />
                          {item.timeTakenFormatted || '00:00'}
                        </span>
                        {(item.date || item.submittedAt) && (
                          <span className="text-[10px] sm:text-[11px] font-sans font-medium text-slate-500">
                            {String(item.date || item.submittedAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
