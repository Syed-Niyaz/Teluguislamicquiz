import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Menu, History, Settings, Trophy } from 'lucide-react';

export default function Header({ onGoHome, onOpenPrevious, onOpenLeaderboard, onOpenSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group text-left min-w-0 flex-1"
          aria-label="Go to home"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 ring-1 ring-emerald-500/20 group-hover:scale-[1.03] transition shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-emerald-950 text-sm sm:text-lg tracking-wide block truncate">
              ఇస్లామిక్ తెలుగు క్విజ్
            </span>
            <span className="block text-[10px] sm:text-xs text-emerald-700/80 font-medium truncate">
              Islamic Telugu Knowledge Quiz
            </span>
          </div>
        </button>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-white/95 hover:bg-emerald-50 text-emerald-900 flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="Menu"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-emerald-100 bg-white shadow-lg overflow-hidden z-50">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onOpenPrevious?.(); }}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-950 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer"
              >
                <History className="w-4 h-4 text-emerald-700" />
                <span>మునుపటి క్విజ్‌లు</span>
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onOpenLeaderboard?.(); }}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-950 hover:bg-emerald-50 flex items-center gap-2.5 border-t border-emerald-50 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-700" />
                <span>లీడర్‌బోర్డ్ (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onOpenSettings?.(); }}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-950 hover:bg-emerald-50 flex items-center gap-2.5 border-t border-emerald-50 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>సెట్టింగ్స్</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
