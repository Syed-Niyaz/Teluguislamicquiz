import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BadgeToast({ badges, onClose }) {
  useEffect(() => {
    if (!badges?.length) return undefined;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [badges, onClose]);

  if (!badges?.length) return null;

  return (
    <div className="fixed inset-x-4 bottom-5 z-[70] flex justify-center pointer-events-none animate-fade-in">
      <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-amber-400/70 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-amber-50 shadow-2xl p-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/50 flex items-center justify-center text-2xl shrink-0">
          🌙
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-sm sm:text-base text-amber-200">
            Masha Allah! Badge Unlocked 🌙
          </div>
          <div className="text-xs sm:text-sm text-amber-50/90 mt-0.5 font-medium">
            {badges.map((b) => `${b.icon} ${b.title}`).join(' • ')}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-amber-200/80 hover:text-white shrink-0 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
