import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F1', desc: 'الانتقال السريع لشريط البحث والبارکود' },
    { key: 'F2', desc: 'فتح شاشة الدفع النقدي (كاش)' },
    { key: 'F3', desc: 'فتح شاشة دفع الشبكة (مدى)' },
    { key: 'F4', desc: 'تعليق الفاتورة الحالية' },
    { key: 'F8', desc: 'إلغاء وتفريغ الفاتورة الحالية' },
    { key: 'Enter', desc: 'إضافة المنتج بعد مسح البارکود أو إتمام الدفع' },
    { key: 'Esc', desc: 'إغلاق أي نافذة شاشة مفتوحة' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">اختصارات لوحة المفاتيح بالكاشير</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
