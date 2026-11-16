import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { TOTAL_TIME_SECONDS } from '../data/questions';

export default function QuizScreen({
  questions,
  userData,
  quizInfo,
  onCompleteQuiz
}) {
  const totalTimeSeconds = quizInfo?.timeSeconds || TOTAL_TIME_SECONDS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(totalTimeSeconds);
  }, [totalTimeSeconds, quizInfo?.date, quizInfo?.id]);

  // Ensure quiz opens at top and stays visible on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (containerRef.current && typeof containerRef.current.scrollIntoView === 'function') {
      containerRef.current.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (containerRef.current && typeof containerRef.current.scrollIntoView === 'function') {
      containerRef.current.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [currentIndex]);

  // 4-minute timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answers]);

  const handleTimeUp = () => {
    finishQuiz(totalTimeSeconds);
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentIndex];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const finishQuiz = (timeTakenSecs) => {
    const finalTimeTaken = timeTakenSecs !== undefined ? timeTakenSecs : (totalTimeSeconds - timeLeft);
    
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    onCompleteQuiz({
      score,
      total: questions.length,
      answers,
      timeTakenSeconds: finalTimeTaken,
      timeTakenFormatted: formatTime(finalTimeTaken),
      percentage: ((score / questions.length) * 100).toFixed(0) + '%'
    });
  };

  const handleManualSubmit = () => {
    if (answeredCount < questions.length) {
      setShowConfirmModal(true);
    } else {
      finishQuiz();
    }
  };

  const isWarning = timeLeft <= 60;
  const isDanger = timeLeft <= 30;

  return (
    <div ref={containerRef} className="w-full max-w-2xl sm:max-w-3xl mx-auto px-2 sm:px-4 py-2 sm:py-3 animate-fade-in scroll-mt-24">

      {/* Top Bar: compact, timer on right */}
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <div className="min-w-0 flex items-center gap-2">
          {userData?.name ? (
            <span className="text-xs sm:text-sm font-semibold text-emerald-900 truncate">{userData.name}</span>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-emerald-900/70 truncate">మునుపటి క్విజ్</span>
          )}
        </div>
        <div
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono font-bold text-sm sm:text-base ${
            isDanger
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : isWarning
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
          aria-label="Timer"
        >
          <Clock className={`w-4 h-4 ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}`} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-emerald-100/70 h-2 rounded-full mb-2 sm:mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-emerald-100/90 shadow-sm sm:shadow-lg relative">

        {/* Question Header */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] sm:text-sm font-bold tracking-wide">
            ప్రశ్న {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-[11px] sm:text-sm font-medium">
            {answers[currentIndex] !== undefined ? (
              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> Done
              </span>
            ) : (
              <span className="text-gray-400">Select</span>
            )}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-base sm:text-xl font-bold text-emerald-950 mb-3 sm:mb-5 leading-snug sm:leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-center gap-2.5 sm:gap-4 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/60 hover:border-emerald-300'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {letter}
                </div>
                <span
                  className={`text-sm sm:text-base font-medium leading-snug sm:leading-relaxed ${
                    isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800'
                  }`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t border-emerald-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>మునుపటి</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>తదుపరి</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualSubmit}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <span>సమర్పించండి</span>
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>



      </div>

      {/* Confirmation Modal when submitting before answering all */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-emerald-100 shadow-2xl text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-emerald-950 mb-2">
              ఇంకా కొన్ని ప్రశ్నలు మిగిలి ఉన్నాయి!
            </h4>
            <p className="text-sm text-slate-700 mb-6 leading-relaxed">
              మీరు {questions.length} ప్రశ్నలలో <strong>{answeredCount}</strong> మాత్రమే పూర్తి చేశారు. మిగిలిన <strong>{questions.length - answeredCount}</strong> ప్రశ్నలకు కూడా సమాధానం ఇవ్వవచ్చు.
              ఇప్పుడే సమర్పించాలనుకుంటున్నారా?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
              >
                ఆగండి, పూర్తి చేస్తాను
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  finishQuiz();
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md cursor-pointer"
              >
                అవును, సమర్పించు
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
