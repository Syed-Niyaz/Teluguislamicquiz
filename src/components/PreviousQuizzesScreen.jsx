import React, { useMemo, useState } from 'react';
import { ArrowLeft, History, PlayCircle, ListChecks, ChevronDown } from 'lucide-react';
import { getDailyQuizSchedule, QUIZ_START_DATE, toDateKey } from '../data/dailyQuizzes';

const dayDiff = (fromKey, toKey) =>
  Math.max(0, Math.round((new Date(toKey + 'T00:00:00') - new Date(fromKey + 'T00:00:00')) / 86400000));

const optionLetter = (index) => String.fromCharCode(65 + index);

export default function PreviousQuizzesScreen({ onBack, onStartQuiz }) {
  const [openDate, setOpenDate] = useState('');

  const previous = useMemo(() => {
    const today = toDateKey();
    const pastDays = Math.max(1, dayDiff(QUIZ_START_DATE, today));
    return getDailyQuizSchedule(pastDays, 0)
      .filter((q) => q.status === 'past' && q.date >= QUIZ_START_DATE)
      .slice()
      .reverse();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="rounded-3xl border border-emerald-100/90 bg-white/90 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mb-2">
              <History className="w-4 h-4" /> గత క్విజ్‌లు
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">మునుపటి క్విజ్‌లు (Previous Quizzes)</h2>
            <p className="text-sm text-emerald-800/75 mt-1">ఏదైనా గత తేదీ క్విజ్‌ని ఎంచుకుని మళ్లీ ప్రయత్నించండి, లేదా ఆ రోజు ప్రశ్నలను చూడండి.</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 text-sm font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> హోమ్
          </button>
        </div>

        {previous.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">ఇంకా గత క్విజ్‌లు అందుబాటులో లేవు.</div>
        ) : (
          <div className="space-y-3">
            {previous.map((q) => {
              const isOpen = openDate === q.date;
              return (
                <div key={q.date} className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-emerald-950">{q.label}</div>
                      <div className="text-xs text-emerald-700 mt-0.5">10 ప్రశ్నలు • 3 నిమిషాలు</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setOpenDate(isOpen ? '' : q.date)}
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-semibold transition cursor-pointer"
                      >
                        <ListChecks className="w-4 h-4" />
                        <span>{isOpen ? 'ప్రశ్నలు దాచు' : 'ప్రశ్నలు చూడండి'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => onStartQuiz(q.date)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <ol className="mt-4 space-y-3">
                      {(q.questions || []).map((item, idx) => (
                        <li key={idx} className="rounded-xl bg-white border border-emerald-100 p-3">
                          <div className="text-sm font-semibold text-emerald-950 mb-2 leading-snug">
                            {idx + 1}. {item.question}
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {(item.options || []).map((opt, optIdx) => {
                              const isCorrect = optIdx === item.correctIndex;
                              return (
                                <li
                                  key={optIdx}
                                  className={`text-xs rounded-lg px-2.5 py-1.5 border ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                      : 'bg-gray-50/60 border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <span className="font-bold mr-1">{optionLetter(optIdx)}.</span>
                                  {opt}
                                  {isCorrect ? ' ✓' : ''}
                                </li>
                              );
                            })}
                          </ul>
                          {item.explanation && (
                            <p className="text-[11px] text-emerald-800/70 mt-2 leading-relaxed">{item.explanation}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
