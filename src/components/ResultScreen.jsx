import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageCircle,
  HeartHandshake,
  ExternalLink,
  Clock,
  CalendarDays
} from 'lucide-react';
import { toDateKey } from '../data/dailyQuizzes';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9fsvDFHWpzNY1oTD1g';
const SITE_URL = 'https://example.com/islamic-telugu-quiz'; // TODO: replace with real site link

export default function ResultScreen({
  resultData,
  userData,
  questions,
  quizInfo,
  sheetStatus
}) {
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Soft celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2d6a4f', '#40916c', '#bfa15f', '#d4af37']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const { score, total, timeTakenFormatted, percentage, answers } = resultData;
  const scorePercent = total ? (score / total) * 100 : 0;
  const totalMinutes = quizInfo?.timeSeconds ? Math.round(quizInfo.timeSeconds / 60) : 3;
  const totalTimeFormatted = quizInfo?.timeSeconds
    ? `${String(Math.floor(quizInfo.timeSeconds / 60)).padStart(2, '0')}:${String(quizInfo.timeSeconds % 60).padStart(2, '0')}`
    : '03:00';
  const isPastQuiz = !!quizInfo?.date && quizInfo.date < toDateKey();

  const getGreeting = () => {
    if (scorePercent >= 90) {
      return { title: 'మాషా అల్లాహ్! అద్భుతమైన ప్రతిభ!', desc: 'మీ ఇస్లామిక్ జ్ఞానం ఎంతో ప్రశంసనీయం.' };
    }
    if (scorePercent >= 70) {
      return { title: 'అల్హందులిల్లాహ్! చాలా బాగుంది!', desc: 'మంచి జ్ఞానాన్ని ప్రదర్శించారు, మరింత నేర్చుకోండి.' };
    }
    if (scorePercent >= 50) {
      return { title: 'మంచి ప్రయత్నం!', desc: 'ఇస్లామిక్ విషయాలను మరింత లోతుగా అధ్యయనం చేయండి.' };
    }
    return { title: 'ధన్యవాదాలు!', desc: 'ప్రశ్నల సమాధానాలు మరియు వివరణలను క్రింద చూడండి.' };
  };

  const greeting = getGreeting();

  const handleShare = () => {
    const text = `☪️ ఇస్లామిక్ తెలుగు క్విజ్ ఫలితాలు${
      quizInfo?.label ? `\n📅 తేదీ: ${quizInfo.label}` : ''
    }\n👤 పేరు: ${userData.name}\n📍 ప్రాంతం: ${userData.location}\n🏆 స్కోర్: ${score} / ${total} (${percentage})\n⏱️ సమయం: ${timeTakenFormatted} (${totalMinutes} నిమిషాల్లో)\n\n🔗 క్విజ్ ఆడండి: ${SITE_URL}\n📢 WhatsApp చానల్: ${WHATSAPP_CHANNEL_URL}\nమీ స్నేహితులతో షేర్ చేసి సవాబ్ సంపాదించండి.`;

    if (navigator.share) {
      navigator.share({
        title: 'ఇస్లామిక్ తెలుగు క్విజ్',
        text: text
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto px-3 sm:px-4 py-4 animate-fade-in">

      {/* Result Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-10 border border-emerald-100/90 shadow-lg text-center relative overflow-hidden mb-5 sm:mb-6">

        {/* Soft background glows */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Islamic Greeting Calligraphy */}
        <div className="font-arabic text-3xl sm:text-4xl text-amber-700 mb-2 drop-shadow-sm" dir="rtl">
          الْحَمْدُ لِلَّهِ
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-bold text-emerald-950 mb-1.5 leading-snug">
          {greeting.title}
        </h2>
        <p className="text-sm sm:text-base text-emerald-800/80 mb-2 font-medium">
          {greeting.desc}
        </p>
        {quizInfo?.label && (
          <div className="inline-flex items-center gap-1.5 text-emerald-900 text-xs sm:text-sm font-semibold mb-1">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            {quizInfo.label}
          </div>
        )}

        <p className="text-xs sm:text-sm text-emerald-700 font-semibold mb-6">
          {isPastQuiz ? '✅ ప్రాక్టీస్ ఫలితాలు సిద్ధంగా ఉన్నాయి' : '✅ మీ ఫలితం వెంటనే నమోదు అయ్యింది'}
        </p>

        {/* Instant Result Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 mb-6">
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 sm:p-4 shadow-sm">
            <span className="text-[11px] sm:text-xs text-emerald-800 font-semibold block mb-1">సరైన సమాధానాలు</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-950">
              {score} <span className="text-sm text-emerald-700 font-normal">/ {total}</span>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 sm:p-4 shadow-sm">
            <span className="text-[11px] sm:text-xs text-amber-800 font-semibold block mb-1">శాతం (Accuracy)</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-950">{percentage}</div>
          </div>

          <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-3 sm:p-4 shadow-sm">
            <span className="text-[11px] sm:text-xs text-sky-800 font-semibold block mb-1">తీసుకున్న సమయం</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-950 font-mono">{timeTakenFormatted}</div>
          </div>

          <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3 sm:p-4 shadow-sm">
            <span className="text-[11px] sm:text-xs text-purple-800 font-semibold block mb-1">మొత్తం సమయం</span>
            <div className="text-2xl sm:text-3xl font-bold text-purple-950 font-mono">{totalTimeFormatted}</div>
          </div>
        </div>

        {/* Sheet Sync Status message */}
        {sheetStatus && (
          <div className="mb-1 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{sheetStatus.message}</span>
          </div>
        )}
      </div>

      {/* WhatsApp + Share (today's / current quiz only) */}
      {!isPastQuiz && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 sm:mb-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left h-full flex flex-col">
            <div className="flex items-center gap-2 font-bold text-emerald-950 mb-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp లో ఫలితాలు చూడండి</span>
            </div>
            <p className="text-sm text-emerald-900/85 leading-relaxed mb-4 flex-1">
              మీ స్కోర్/ఫలితాల కోసం మా WhatsApp చానల్‌ను చూడండి (Check your score on our WhatsApp).
            </p>
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition mt-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open WhatsApp Channel</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-left h-full flex flex-col">
            <div className="flex items-center gap-2 font-bold text-sky-950 mb-1.5">
              <HeartHandshake className="w-4 h-4 text-sky-700" />
              <span>మిత్రులతో షేర్ చేయండి</span>
            </div>
            <p className="text-sm text-sky-900/85 leading-relaxed mb-4 flex-1">
              ఈ క్విజ్‌ను మీ స్నేహితులతో షేర్ చేయండి. మంచి పనిని వ్యాప్తి చేయడంలో సహకరించి సవాబ్ (good deeds) సంపాదించండి.
            </p>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold transition mt-auto cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'కాపీ చేయబడింది!' : 'షేర్ చేయండి'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Question Review Breakdown */}
      <div className="bg-white rounded-3xl p-4 sm:p-8 border border-emerald-100/90 shadow-md">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between text-left font-bold text-emerald-950 text-sm sm:text-lg cursor-pointer gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shadow-sm shrink-0">
              📝
            </div>
            <span>{questions.length} ప్రశ్నల జవాబుల సమీక్ష (Answers & Explanations)</span>
          </div>
          {showReview ? (
            <ChevronUp className="w-6 h-6 text-emerald-700 shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-emerald-700 shrink-0" />
          )}
        </button>

        {showReview && (
          <div className="mt-5 space-y-5 pt-5 border-t border-emerald-100 divide-y divide-emerald-50">
            {questions.map((q, idx) => {
              const userAnswerIndex = answers[idx];
              const isCorrect = userAnswerIndex === q.correctIndex;
              const hasAnswered = userAnswerIndex !== undefined;

              return (
                <div key={idx} className="pt-4 text-sm sm:text-base">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span className="font-bold text-emerald-950 leading-relaxed">
                      {idx + 1}. {q.question}
                    </span>
                  </div>

                  <div className="pl-7 space-y-1.5 text-slate-800">
                    <p>
                      <span className="text-gray-500 font-medium">మీ ఎంపిక: </span>
                      {hasAnswered ? (
                        <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          {q.options[userAnswerIndex]}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">సమాధానం ఇవ్వలేదు</span>
                      )}
                    </p>

                    {!isCorrect && (
                      <p>
                        <span className="text-gray-500 font-medium">సరైన సమాధానం: </span>
                        <span className="text-emerald-700 font-bold">{q.options[q.correctIndex]}</span>
                      </p>
                    )}

                    {q.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs sm:text-sm text-emerald-950 leading-relaxed">
                        💡 <strong>వివరణ:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sync note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-800/80 font-medium text-center">
        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          {isPastQuiz
            ? 'ఇది ప్రాక్టీస్ క్విజ్ — ఫలితం లీడర్‌బోర్డ్‌కు జోడించబడదు.'
            : 'ఫలితాలు వెంటనే సేవ్ అవుతాయి. లీడర్‌బోర్డ్ అడ్మిన్ మాత్రమే చూడగలరు.'}
        </span>
      </div>
    </div>
  );
}
