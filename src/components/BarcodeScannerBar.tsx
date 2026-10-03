import React, { useRef, useEffect } from 'react';
import { Search, ScanBarcode, Plus, X } from 'lucide-react';

interface BarcodeScannerBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBarcodeSubmit: (barcode: string) => void;
  onOpenCustomItem: () => void;
}

export const BarcodeScannerBar: React.FC<BarcodeScannerBarProps> = ({
  searchQuery,
  setSearchQuery,
  onBarcodeSubmit,
  onOpenCustomItem,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on barcode input for fast POS operation
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        e.key === 'Escape'
      ) {
        return;
      }
      if (e.key === 'F1') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onBarcodeSubmit(searchQuery.trim());
  };

  return (
    <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center gap-3">
      <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2 pointer-events-none">
          <ScanBarcode className="w-5 h-5 text-indigo-600 animate-pulse" />
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="امسح البارکود أو اكتب اسم المنتج / الكود (F1)..."
          className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-xl py-2.5 pr-12 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 font-bold transition-all shadow-sm"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={onOpenCustomItem}
        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
        title="إضافة صنف يدوي غير مسجل بالنظام"
      >
        <Plus className="w-4 h-4 text-white stroke-[3]" />
        <span>صنف مخصص</span>
      </button>
    </div>
  );
};
