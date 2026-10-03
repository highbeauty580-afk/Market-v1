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
    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-3">
      <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2 pointer-events-none">
          <ScanBarcode className="w-5 h-5 text-emerald-400 animate-pulse" />
          <Search className="w-4 h-4 text-slate-500" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="امسح البارکود أو اكتب اسم المنتج / الكود (F1)..."
          className="w-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm rounded-xl py-2.5 pr-12 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all shadow-inner"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={onOpenCustomItem}
        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
        title="إضافة صنف يدوي غير مسجل بالنظام"
      >
        <Plus className="w-4 h-4 text-emerald-400" />
        <span>صنف مخصص</span>
      </button>
    </div>
  );
};
