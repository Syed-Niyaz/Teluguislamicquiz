import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import IntroScreen from './components/IntroScreen';
import RegistrationScreen from './components/RegistrationScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import AdminDetails from './components/AdminDetails';
import PreviousQuizzesScreen from './components/PreviousQuizzesScreen';
import GoogleSheetModal from './components/GoogleSheetModal';
import { getQuizForDate, getQuizByKey, toDateKey } from './data/dailyQuizzes';
import { submitQuizToGoogleSheets } from './services/sheetService';

export default function App() {
  const [screen, setScreen] = useState('intro'); // 'intro' | 'previous' | 'registration' | 'quiz' | 'result' | 'leaderboard' (admin full-details view)
  const [selectedQuizDate, setSelectedQuizDate] = useState(toDateKey());
  const [selectedQuiz, setSelectedQuiz] = useState(getQuizForDate(toDateKey()));
  const [userData, setUserData] = useState({
    name: '',
    location: '',
    occupation: ''
  });
  const [resultData, setResultData] = useState(null);
  const [sheetStatus, setSheetStatus] = useState(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Select a quiz and start (daily today: registration, past/weekly: play directly)
  const handleStartQuizForDate = (quizOrKey) => {
    const quiz = typeof quizOrKey === 'string' ? getQuizByKey(quizOrKey) : quizOrKey;
    if (!quiz || quiz.isUpcoming) return;
    const key = quiz.date || quiz.id || toDateKey();
    setSelectedQuizDate(key);
    setSelectedQuiz(quiz);
    setResultData(null);
    setSheetStatus(null);
    if (quiz.type !== 'weekly' && key === toDateKey()) {
      setScreen('registration');
    } else {
      setUserData({ name: '', location: '', occupation: '' });
      setScreen('quiz');
    }
  };

  const handleOpenLeaderboard = (dateKey) => {
    const key = dateKey || selectedQuizDate || toDateKey();
    setSelectedQuizDate(key);
    setSelectedQuiz(getQuizByKey(key));
    setScreen('leaderboard');
  };

  // Completed the 3 user details (Name, Where from, Occupation)
  const handleCompleteRegistration = (data) => {
    setUserData(data);
    setScreen('quiz');
  };

  // Completed or submitted the quiz
  const handleCompleteQuiz = async (results) => {
    setResultData(results);
    setScreen('result');

    // Past daily quizzes are practice only (no registration/name), so don't
    // write them into the live leaderboard. Today's quiz (with user details)
    // and weekly quiz (when player details exist) sync instantly.
    const shouldSyncToSheet =
      !!userData.name && (selectedQuiz?.type === 'weekly' || selectedQuizDate === toDateKey());
    if (!shouldSyncToSheet) {
      setSheetStatus(null);
      return;
    }

    // Build payload for Google Sheets & Local Leaderboard
    const payload = {
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      quizDate: selectedQuizDate,
      quizLabel: selectedQuiz?.label,
      name: userData.name,
      location: userData.location,
      occupation: userData.occupation,
      score: results.score,
      total: results.total,
      timeTakenFormatted: results.timeTakenFormatted,
      timeTakenSeconds: results.timeTakenSeconds,
      percentage: results.percentage
    };

    try {
      const response = await submitQuizToGoogleSheets(payload);
      setSheetStatus(response);
    } catch (err) {
      console.error('Sheet submission error:', err);
      setSheetStatus({
        success: true,
        message: 'ఫలితాలు స్థానికంగా సేవ్ చేయబడ్డాయి.'
      });
    }
  };

  // Reset scroll to top on every page/screen change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [screen, selectedQuizDate]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        onGoHome={() => setScreen('intro')}
        onOpenPrevious={() => setScreen('previous')}
        onOpenLeaderboard={() => handleOpenLeaderboard(selectedQuizDate || toDateKey())}
        onOpenSettings={() => {}}
      />

      {/* Main Content Areas based on current screen */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {screen === 'intro' && (
            <IntroScreen
              onStartQuiz={handleStartQuizForDate}
              onOpenLeaderboard={handleOpenLeaderboard}
            />
          )}

          {screen === 'previous' && (
            <PreviousQuizzesScreen
              onBack={() => setScreen('intro')}
              onStartQuiz={handleStartQuizForDate}
            />
          )}

          {screen === 'registration' && (
            <RegistrationScreen
              initialData={userData}
              selectedQuiz={selectedQuiz}
              onBack={() => setScreen('intro')}
              onCompleteRegistration={handleCompleteRegistration}
            />
          )}

          {screen === 'quiz' && (
            <QuizScreen
              questions={selectedQuiz?.questions || []}
              userData={userData}
              quizInfo={selectedQuiz}
              onCompleteQuiz={handleCompleteQuiz}
            />
          )}

          {screen === 'result' && resultData && (
            <ResultScreen
              resultData={resultData}
              userData={userData}
              questions={selectedQuiz?.questions || []}
              quizInfo={selectedQuiz}
              sheetStatus={sheetStatus}
            />
          )}

          {screen === 'leaderboard' && (
            <div className="w-full max-w-5xl mx-auto animate-fade-in">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setScreen('intro')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-emerald-200 bg-white/90 text-emerald-950 hover:bg-emerald-50 text-sm font-semibold transition cursor-pointer shadow-sm hover:shadow"
                >
                  <span>← హోమ్</span>
                  <span className="text-emerald-700/70 hidden sm:inline">(Home)</span>
                </button>
              </div>
              <AdminDetails />
            </div>
          )}
        </div>
      </main>

      {/* Peaceful Islamic Footer */}
      <footer className="w-full border-t border-emerald-100/70 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6 text-center text-xs sm:text-sm text-emerald-900/80">
          <div className="flex items-center justify-center gap-2 mb-1.5 font-arabic text-amber-800 text-lg sm:text-xl">
            <span>رَّبِّ زِدْنِي عِلْمًا</span>
          </div>
          <p className="text-emerald-800/80 font-medium mb-1">
            ఓ అల్లాహ్! నా జ్ఞానాన్ని వృద్ధి చేయుము
          </p>
          <p className="font-medium text-emerald-950/60 leading-relaxed">
            © ఇస్లామిక్ తెలుగు క్విజ్ • Daily & Weekly Quizzes • Leaderboard
          </p>
        </div>
      </footer>

      {/* Google Sheets Connection Modal */}
      {isSheetModalOpen && (
        <GoogleSheetModal onClose={() => setIsSheetModalOpen(false)} />
      )}
    </div>
  );
}
