import React from 'react';
import { Heart, X, Sparkles } from 'lucide-react';

interface AmounaReservedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AmounaReservedModal: React.FC<AmounaReservedModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-white/95 to-rose-50/95 border-2 border-rose-300/80 rounded-3xl w-full max-w-md p-6 shadow-[0_25px_60px_-15px_rgba(225,29,72,0.3)] text-center relative overflow-hidden flex flex-col items-center">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating Heart Badge */}
        <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-red-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-rose-500/40 mb-4 animate-bounce">
          <Heart className="w-10 h-10 fill-white" />
        </div>

        {/* Central Title */}
        <div className="flex items-center gap-1.5 text-rose-600 font-black text-xs mb-2">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>تنبيه خاص جدًا!</span>
          <Sparkles className="w-4 h-4 text-rose-500" />
        </div>

        {/* Exact User Requested Phrase */}
        <div className="bg-white/80 border border-rose-200/90 rounded-2xl p-4 shadow-sm my-2">
          <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed dir-rtl">
            🧐 عذرا هذا المنتج تم حجزه لقلبي س كدا هه متجيش تاني بقا
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
        >
          حسناً، فهمت ذلك ❤️
        </button>
      </div>
    </div>
  );
};
