import React, { useEffect } from 'react';
import { Moon, X } from 'lucide-react';

export default function BadgeToast({ badges, onClose }) {
  useEffect(() => {
    if (!badges?.length) return undefined;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [badges, onClose]);

  if (!badges?.length) return null;

  return (
    <div className="fixed inset-x-4 bottom-5 z-[70] flex justify-center pointer-events-none animate-fade-in">
      <div className="pointer-events-auto w-full max-w-md card-surface rounded-2xl p-4 flex items-start gap-3 shadow-[0_12px_32px_rgba(15,118,110,0.14)]">
        <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
          <Moon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-sm sm:text-base text-teal-800">
            Masha Allah! Badge Unlocked 🌙
          </div>
          <div className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
            {badges.map((b) => `${b.icon} ${b.title}`).join(' • ')}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-teal-700 shrink-0 cursor-pointer transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
