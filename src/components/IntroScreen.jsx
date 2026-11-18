import React, { useMemo } from 'react';
import { ArrowRight, Award, CalendarDays, Lock, PlayCircle, Trophy, Clock, TrendingUp, ChevronRight, MessageCircle } from 'lucide-react';
import { getDailyQuizSchedule, getWeeklyTopQuiz, toDateKey } from '../data/dailyQuizzes';
import { ACHIEVEMENTS, getAchievementSnapshot } from '../services/achievementService';
import { WHATSAPP_CHANNEL_URL } from '../data/links';

export default function IntroScreen({ onStartQuiz, onOpenLeaderboard, onOpenProgress, onEditProfile, savedUser }) {
  const schedule = useMemo(() => getDailyQuizSchedule(10, 0), []);
  const weeklyQuiz = useMemo(() => getWeeklyTopQuiz(new Date()), []);
  const todayKey = toDateKey();
  const todayQuiz = schedule.find((q) => q.status === 'today');
  const achievementState = getAchievementSnapshot();
  const earnedBadges = ACHIEVEMENTS.filter((b) => achievementState.unlocked[b.id]).length;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-6 sm:space-y-8">
      {/* Today & Weekly Top Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today */}
        <div className="card-surface rounded-[28px] p-5 sm:p-7 flex flex-col">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full mb-4 w-fit">
            <PlayCircle className="w-4 h-4" /> ఈరోజు క్విజ్ (Daily)
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">{todayQuiz?.label}</h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">10 ప్రశ్నలు • 3 నిమిషాలు • రోజువారీ క్విజ్</p>
          <p className="text-xs text-teal-700 font-semibold mt-1.5">ఫలితాలు & లీడర్‌బోర్డ్ WhatsApp ఛానెల్‌లో</p>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 self-start px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white text-xs sm:text-sm font-bold shadow-sm shadow-green-600/20 transition"
          >
            <MessageCircle className="w-4 h-4" fill="currentColor" strokeWidth={1.5} />
            <span>WhatsApp ఛానెల్‌లో చేరండి</span>
          </a>

          {savedUser?.name && (
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-emerald-900 bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5">
              <span className="font-medium">
                <span className="text-emerald-800/80">మీ వివరాలు:</span> {savedUser.name}
                {savedUser.location ? `, ${savedUser.location}` : ''}
              </span>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2 cursor-pointer"
                >
                  మార్చండి
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-auto sm:pt-6">
            <button
              onClick={() => onStartQuiz(todayKey)}
              className="w-full sm:flex-1 px-5 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>ఈరోజు క్విజ్ ప్రారంభించండి</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpenLeaderboard(todayKey)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-teal-700" /> లీడర్‌బోర్డ్ (Admin)
            </button>
          </div>
        </div>

        {/* Weekly Top Quiz */}
        <div className="card-surface rounded-[28px] p-5 sm:p-7 flex flex-col">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#9a7427] bg-[#fdf8ec] border border-[#f0e2be] px-3 py-1.5 rounded-full mb-4 w-fit">
            <Trophy className="w-4 h-4" /> వీక్లీ టాప్ క్విజ్
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">Weekly Top Quiz</h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            ప్రతి శుక్రవారం రాత్రి <strong className="text-emerald-900">7:00 PM</strong>కి ప్రారంభమవుతుంది.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-950 text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-teal-700" /> 30 ప్రశ్నలు
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-950 text-sm font-medium">
              <Clock className="w-4 h-4 text-teal-700" />{' '}
              {weeklyQuiz?.isAvailable ? 'ప్రస్తుతం అందుబాటులో ఉంది' : 'శుక్రవారం 7:00 PM వరకు వేచి ఉండండి'}
            </div>
          </div>

          <div className="mt-6 sm:mt-auto sm:pt-6">
            {weeklyQuiz?.isAvailable ? (
              <button
                onClick={() => onStartQuiz(weeklyQuiz)}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#b58b3a] hover:bg-[#9f7830] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <span>వీక్లీ టాప్ క్విజ్ ప్రారంభించండి</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold flex items-center justify-center gap-2 text-center">
                <Lock className="w-4 h-4 shrink-0" />
                <span>ప్రతి శుక్రవారం రాత్రి 7:00 PMకి అందుబాటులో ఉంటుంది</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player progress & badges */}
      <button
        type="button"
        onClick={onOpenProgress}
        className="group w-full card-surface rounded-[28px] p-5 sm:p-6 flex items-center gap-4 sm:gap-5 text-left hover:shadow-[0_10px_26px_rgba(15,118,110,0.08)] transition cursor-pointer"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold tracking-[0.18em] text-teal-700 uppercase">ఇల్మ్ యాత్ర</div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-950 mt-0.5">
            మీ ప్రోగ్రెస్ & బ్యాడ్జ్ లు
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            పాయింట్లు, వరుస రోజులు, అభినందనలు మరియు సాధనలు చూడండి.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-lg font-extrabold text-emerald-900 tabular-nums">
              {earnedBadges}
              <span className="text-sm text-slate-400">/{ACHIEVEMENTS.length}</span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">బ్యాడ్జ్ లు</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-100 transition">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
}
