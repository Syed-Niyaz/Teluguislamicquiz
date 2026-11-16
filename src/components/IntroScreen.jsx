import React, { useMemo } from 'react';
import { ArrowRight, Award, CalendarDays, Lock, PlayCircle, Trophy, Clock } from 'lucide-react';
import { getDailyQuizSchedule, getWeeklyTopQuiz, toDateKey } from '../data/dailyQuizzes';

export default function IntroScreen({ onStartQuiz, onOpenLeaderboard }) {
  const schedule = useMemo(() => getDailyQuizSchedule(10, 0), []);
  const weeklyQuiz = useMemo(() => getWeeklyTopQuiz(new Date()), []);
  const todayKey = toDateKey();
  const todayQuiz = schedule.find((q) => q.status === 'today');

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-5 sm:space-y-6">
      {/* Today & Weekly Top Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Today */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 border border-emerald-200 px-2.5 py-1 rounded-full mb-2">
                <PlayCircle className="w-4 h-4" /> ఈరోజు క్విజ్ (Daily)
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">{todayQuiz?.label}</h2>
              <p className="text-sm text-emerald-800/80 mt-1">10 ప్రశ్నలు • 3 నిమిషాలు • రోజువారీ క్విజ్</p>
              <p className="text-xs text-emerald-700 font-semibold mt-1">ఫలితాలు & లీడర్‌బోర్డ్ WhatsApp ఛానెల్‌లో</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
            <button
              onClick={() => onStartQuiz(todayKey)}
              className="w-full sm:flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>ఈరోజు క్విజ్ ప్రారంభించండి</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpenLeaderboard(todayKey)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-950 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-700" /> లీడర్‌బోర్డ్ (Admin)
            </button>
          </div>
        </div>

        {/* Weekly Top Quiz */}
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-white/80 border border-amber-200 px-2.5 py-1 rounded-full mb-2">
            <Trophy className="w-4 h-4" /> వీక్లీ టాప్ క్విజ్
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950">Weekly Top Quiz</h2>
          <p className="text-sm text-amber-900/80 mt-1">
            ప్రతి శుక్రవారం రాత్రి <strong>7:00 PM</strong>కి ప్రారంభమవుతుంది.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-amber-950 text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-amber-700" /> 30 ప్రశ్నలు
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-amber-950 text-sm font-medium">
              <Clock className="w-4 h-4 text-amber-700" /> {weeklyQuiz?.isAvailable ? 'ప్రస్తుతం అందుబాటులో ఉంది' : 'శుక్రవారం 7:00 PM వరకు వేచి ఉండండి'}
            </div>
          </div>

          <div className="mt-4">
            {weeklyQuiz?.isAvailable ? (
              <button
                onClick={() => onStartQuiz(weeklyQuiz)}
                className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <span>వీక్లీ టాప్ క్విజ్ ప్రారంభించండి</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-200 text-amber-900 text-sm font-semibold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>ప్రతి శుక్రవారం రాత్రి 7:00 PMకి అందుబాటులో ఉంటుంది</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
