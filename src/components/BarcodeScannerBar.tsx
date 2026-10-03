import React, { useRef, useEffect, useState } from 'react';
import { Search, ScanBarcode, Plus, X, Camera, HelpCircle } from 'lucide-react';
import { Product } from '../types/pos';
import { CameraScannerModal } from './CameraScannerModal';
import { BarcodeInfoModal } from './BarcodeInfoModal';

interface BarcodeScannerBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBarcodeSubmit: (barcode: string) => void;
  onOpenCustomItem: () => void;
  products?: Product[];
}

export const BarcodeScannerBar: React.FC<BarcodeScannerBarProps> = ({
  searchQuery,
  setSearchQuery,
  onBarcodeSubmit,
  onOpenCustomItem,
  products = [],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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

  const handleCameraScanned = (barcode: string) => {
    onBarcodeSubmit(barcode);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        {/* Search & Barcode Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center min-w-[180px]">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none">
            <ScanBarcode className="w-5 h-5 text-indigo-600 animate-pulse" />
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="امسح البارکود أو اكتب اسم المنتج / الكود (F1)..."
            className="w-full bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl py-2.5 pr-11 pl-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 font-bold transition-all shadow-xs"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Camera Scanner Button */}
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 shadow-xs"
          title="فتح كاميرا الجوال/الكمبيوتر لمسح الباركود"
        >
          <Camera className="w-4 h-4 text-indigo-600" />
          <span className="hidden xs:inline">مسح بالكاميرا</span>
        </button>

        {/* Info Icon for Barcode Instructions */}
        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="p-2.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-300 rounded-xl transition-all cursor-pointer shadow-xs"
          title="كيفية استخدام ماسح الباركود"
        >
          <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
        </button>

        {/* Add Custom Item Button */}
        <button
          type="button"
          onClick={onOpenCustomItem}
          className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
          title="إضافة صنف يدوي غير مسجل بالنظام"
        >
          <Plus className="w-4 h-4 text-white stroke-[3]" />
          <span>صنف مخصص</span>
        </button>
      </div>

      {/* Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onBarcodeScanned={handleCameraScanned}
      />

      {/* Barcode Info & Guide Modal */}
      <BarcodeInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        sampleProducts={products}
        onSelectBarcode={(code) => setSearchQuery(code)}
      />
    </>
  );
};
