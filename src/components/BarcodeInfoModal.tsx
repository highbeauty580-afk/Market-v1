import React from 'react';
import { X, HelpCircle, ScanBarcode, Camera, Keyboard, Sparkles, CheckCircle2, Copy } from 'lucide-react';
import { Product } from '../types/pos';

interface BarcodeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleProducts: Product[];
  onSelectBarcode: (barcode: string) => void;
}

export const BarcodeInfoModal: React.FC<BarcodeInfoModalProps> = ({
  isOpen,
  onClose,
  sampleProducts,
  onSelectBarcode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">دليل استخدام ماسح الباركود</h3>
              <p className="text-xs text-slate-500">كيفية قراءة المنتجات تلقائياً وبسرعة في الكاشير</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Method 1: Hardware Barcode Scanner */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm">
              <ScanBarcode className="w-5 h-5 text-indigo-600" />
              <span>1. قارئ الباركود اليدوي (أجهزة الليزر USB / Bluetooth)</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              قم بتوصيل قارئ الباركود اليدوي بالكمبيوتر أو الجوال. وجه شعاع الليزر نحو شريطة الباركود المطبوعة على المنتج. يقوم النظام بإدراج المنتج مباشرة وتحديث الفاتورة دون الحاجة للضغط على أي زر.
            </p>
          </div>

          {/* Method 2: Camera Barcode Scanner */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
              <Camera className="w-5 h-5 text-emerald-600" />
              <span>2. ماسح الكاميرا (كاميرا الهاتف أو الكمبيوتر)</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              اضغط على زر <strong className="text-slate-900 font-bold">[ 📷 مسح بالكاميرا ]</strong> بجوار مربع البحث، واسمح للمتصفح بالوصول للكاميرا. وجه الكاميرا نحو شريطة الباركود وسيتم مسح الأصناف والتعرف عليها فجأة.
            </p>
          </div>

          {/* Method 3: Keyboard Search */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
              <Keyboard className="w-5 h-5 text-amber-600" />
              <span>3. البحث والإدخال اليدوي (اختصار F1)</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              يمكنك الضغط على زر <kbd className="px-2 py-0.5 bg-slate-200 font-mono text-[10px] rounded border border-slate-300">F1</kbd> للتركيز الفوري في خانة البحث، واكتب اسم المنتج أو أرقام الباركود واضغط <kbd className="px-2 py-0.5 bg-slate-200 font-mono text-[10px] rounded border border-slate-300">Enter</kbd> لإضافته للفاتورة.
            </p>
          </div>

          {/* Method 4: Test Sample Barcodes */}
          {sampleProducts.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  أكواد باركود تجريبية للاختبار السريع:
                </span>
                <span className="text-[10px] text-emerald-700">اضغط على أي كود لتجربته</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleProducts.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectBarcode(p.barcode);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-emerald-100/60 border border-emerald-200/90 rounded-xl flex items-center justify-between transition-colors text-right cursor-pointer shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs truncate">{p.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">#{p.barcode}</div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>يدعم جميع صيغ الباركود العادية و EAN-13 و QR</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};
