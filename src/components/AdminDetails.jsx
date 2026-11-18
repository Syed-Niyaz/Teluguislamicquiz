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
  Zap,
  Download,
  FileText
} from 'lucide-react';
import { fetchLeaderboard, ADMIN_PASSWORD } from '../services/sheetService';
import { formatDateLabel, toDateKey } from '../data/dailyQuizzes';

const AUTH_KEY = 'islamic_quiz_admin_authed';

const readAuth = () => {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch (err) {
    return false;
  }
};

// Live sheet rows may be missing total/percentage (older script deployments),
// so accuracy is always calculated here from score / total.
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

const csvCell = (value) => {
  const raw = String(value ?? '');
  // Neutralise spreadsheet formula injection from sheet-entered names.
  const safe = /^[=+@\-]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

const byRank = (a, b) => {
  if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
  if ((a.timeTakenSeconds || 999999) !== (b.timeTakenSeconds || 999999)) {
    return (a.timeTakenSeconds || 999999) - (b.timeTakenSeconds || 999999);
  }
  return String(a.submittedAt || a.date || '').localeCompare(String(b.submittedAt || b.date || ''));
};

export default function AdminDetails() {
  const today = toDateKey();
  const [authed, setAuthed] = useState(readAuth);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ source: '', error: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch everything, then group/filter locally so all dates are available.
      const res = await fetchLeaderboard('', ADMIN_PASSWORD);
      setRows(res.items || []);
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
  }, [authed]);

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
      setAuthError('తప్పు పాస్ వర్డ్. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  };

  const handleLock = () => {
    setAuthed(false);
    setRows([]);
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
          <h3 className="text-lg sm:text-xl font-bold text-emerald-950">పూర్తి వివరాలు (Admin Only)</h3>
          <p className="text-sm text-emerald-800/80 font-medium mt-1 mb-5">
            ప్రతి ఆటగాడి పూర్తి వివరాలు చూడటానికి అడ్మిన్ పాస్ వర్డ్ నమోదు చేయండి.
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
              <span>అన్ లాక్ చేయండి</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 font-medium mt-4 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Only admin can view complete player details
          </p>
        </div>
      </div>
    );
  }

  // ----- Admin-only complete details -----
  const visibleRows = selectedDate ? rows.filter((r) => r.quizDate === selectedDate) : rows;
  const playerCount = visibleRows.length;
  const averageScore = playerCount
    ? (visibleRows.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / playerCount).toFixed(1)
    : '0';
  const averageAccuracy = playerCount
    ? Math.round(visibleRows.reduce((sum, item) => sum + accuracyOf(item), 0) / playerCount)
    : 0;
  const times = visibleRows.map((item) => Number(item.timeTakenSeconds) || 0).filter((s) => s > 0);
  const fastestTime = times.length ? Math.min(...times) : null;
  const topPlayer = [...visibleRows].sort(byRank)[0];

  const groups = visibleRows.reduce((acc, item) => {
    const key = item.quizDate || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const dateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  dateKeys.forEach((key) => groups[key].sort(byRank));

  const handleExportCsv = () => {
    const lines = [
      ['Date', 'Rank', 'Name', 'Location', 'Occupation', 'Score', 'Total', 'Accuracy', 'Time Taken', 'Submitted At'].join(',')
    ];
    dateKeys.forEach((key) => {
      groups[key].forEach((item, idx) => {
        lines.push([
          key,
          idx + 1,
          item.name,
          item.location,
          item.occupation,
          item.score,
          item.total || 10,
          `${accuracyOf(item)}%`,
          item.timeTakenFormatted || '',
          item.submittedAt || item.date || ''
        ].map(csvCell).join(','));
      });
    });
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-admin-details${selectedDate ? `-${selectedDate}` : ''}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-8 border border-emerald-100/90 shadow-md mt-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-950 flex flex-wrap items-center gap-2">
              పూర్తి వివరాలు
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </h3>
            <p className="text-xs text-emerald-800 mt-1 inline-flex items-center gap-1.5 font-semibold">
              <CalendarDays className="w-3.5 h-3.5" />
              {selectedDate ? `${formatDateLabel(selectedDate)}${selectedDate === today ? ' • ఈరోజు' : ''}` : 'అన్ని తేదీలు (All dates)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            disabled={!visibleRows.length}
            className="px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 disabled:opacity-40 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="CSV డౌన్ లోడ్"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
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

      <p className="text-[11px] sm:text-xs text-emerald-800/80 font-medium mb-4">
        ఈ గణాంకాలు మరియు ఆటగాళ్ల పూర్తి వివరాలు అడ్మిన్ కోసం మాత్రమే. ఆటగాళ్లకు ఫలితాలు WhatsApp ఛానెల్ లో ప్రకటిస్తారు.
      </p>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-sm text-emerald-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={() => setSelectedDate('')}
          className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
            !selectedDate
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

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-emerald-800 font-medium">డేటా లోడ్ అవుతోంది...</p>
        </div>
      ) : playerCount === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          ఈ తేదీకి ఇంకా ఫలితాలు లేవు.
        </div>
      ) : (
        <>
          {/* Overall summary */}
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
              <div className="text-xl sm:text-2xl font-extrabold text-sky-950">
                {averageScore}<span className="text-xs sm:text-sm font-semibold text-sky-700"> / 10</span>
              </div>
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
            <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 flex items-center gap-3">
              <span className="text-2xl leading-none">🏆</span>
              <div className="min-w-0 text-xs sm:text-sm text-emerald-950 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-emerald-700 font-bold">టాప్ పెర్ఫార్మర్:</span>
                <span className="font-extrabold">{topPlayer.name}</span>
                <span className="text-emerald-800">{topPlayer.score} / {topPlayer.total || 10}</span>
                <span className="text-amber-800 font-bold">{accuracyOf(topPlayer)}%</span>
              </div>
            </div>
          )}

          {/* Per-date complete details */}
          {dateKeys.map((key) => (
            <section key={key} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-700" />
                  {formatDateLabel(key)}
                </h4>
                <span className="text-[11px] sm:text-xs text-emerald-800 font-semibold">
                  {groups[key].length} మంది ఆటగాళ్లు
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                <table className="w-full min-w-[900px] text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-emerald-200 text-emerald-950 bg-emerald-50/70">
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">ర్యాంక్</th>
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">పేరు</th>
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">ప్రాంతం</th>
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">వృత్తి</th>
                      <th className="py-2.5 px-3 text-center font-bold whitespace-nowrap">స్కోర్</th>
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">శాతం</th>
                      <th className="py-2.5 px-3 text-right font-bold whitespace-nowrap">సమయం</th>
                      <th className="py-2.5 px-3 text-right font-bold whitespace-nowrap">సబ్మిట్ అయిన సమయం</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/70">
                    {groups[key].map((item, idx) => {
                      const acc = accuracyOf(item);
                      const text = acc >= 80 ? 'text-emerald-700' : acc >= 50 ? 'text-amber-700' : 'text-rose-600';
                      const bar = acc >= 80 ? 'bg-emerald-600' : acc >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                      return (
                        <tr key={item._rowIndex || `${item.name}-${item.submittedAt || idx}`} className="hover:bg-emerald-50/50">
                          <td className="py-3 px-3 align-top">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 font-bold">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top font-bold text-emerald-950 whitespace-nowrap">{item.name}</td>
                          <td className="py-3 px-3 align-top text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                              {item.location || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 align-top text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                              {item.occupation || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center align-top font-bold text-emerald-950 whitespace-nowrap">
                            {item.score} / {item.total || 10}
                          </td>
                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-col gap-1 min-w-[64px]">
                              <span className={`font-bold ${text}`}>{acc}%</span>
                              <div className="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                                <div className={`h-full rounded-full ${bar}`} style={{ width: `${acc}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right align-top font-mono font-bold text-slate-800 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-4 h-4 text-emerald-700" />
                              {item.timeTakenFormatted || '00:00'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right align-top text-[11px] font-medium text-slate-500 whitespace-nowrap">
                            {item.submittedAt || item.date || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
