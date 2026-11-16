import React, { useState } from 'react';
import { User, MapPin, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

export default function RegistrationScreen({ onBack, onCompleteRegistration, initialData, selectedQuiz }) {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name)');
      return;
    }
    if (!location.trim()) {
      setError('దయచేసి మీరు ఎక్కడ నుండి వచ్చారో రాయండి (Please enter where you are from)');
      return;
    }
    if (!occupation.trim()) {
      setError('దయచేసి మీ వృత్తి/విద్య వివరాలు నమోదు చేయండి (Please enter your occupation)');
      return;
    }

    setError('');
    onCompleteRegistration({
      name: name.trim(),
      location: location.trim(),
      occupation: occupation.trim()
    });
  };

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100/90 shadow-lg relative overflow-hidden">
        
        {/* Soft Background Accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-sm">
            <User className="w-7 h-7 text-emerald-700" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 mb-1.5">
            మీ వివరాలు నమోదు చేయండి
          </h2>
          <p className="text-sm sm:text-base text-emerald-800/80 font-medium">
            క్విజ్ మరియు లీడర్‌బోర్డ్ కోసం 3 ప్రాథమిక వివరాలు
          </p>
          {selectedQuiz?.label && (
            <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold">
              ఎంచుకున్న క్విజ్: {selectedQuiz.label}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
            <span className="text-lg">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: Name */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-700" />
              <span>1. మీ పూర్తి పేరు (Full Name) *</span>
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ఉదాహరణ: మహమ్మద్ అబ్దుల్లా లేదా ఫాతిమా"
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 text-base text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-inner placeholder:text-gray-400"
            />
          </div>

          {/* Question 2: Location / Where From */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>2. మీరు ఎక్కడ నుండి? (Where are you from?) *</span>
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ఉదాహరణ: హైదరాబాద్, గుంటూరు, విజయవాడ, కర్నూలు..."
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 text-base text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-inner placeholder:text-gray-400"
            />
          </div>

          {/* Question 3: Occupation */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-700" />
              <span>3. మీ వృత్తి / విద్య (Occupation) *</span>
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="ఉదాహరణ: విద్యార్థి, టీచర్, ఇంజనీర్, వ్యాపారి..."
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 text-base text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-inner placeholder:text-gray-400"
            />
          </div>

          {/* Info note */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-center gap-2.5">
            <span className="text-xl">⏱️</span>
            <span>క్విజ్ ప్రారంభమైన వెంటనే <strong>3:00 నిమిషాల</strong> టైమర్ మొదలవుతుంది. 10 ప్రశ్నలకు సమాధానాలు ఇవ్వండి.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 text-sm sm:text-base font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>వెనుకకు</span>
            </button>

            <button
              type="submit"
              className="w-full sm:flex-1 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>క్విజ్ ప్రారంభించండి</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
