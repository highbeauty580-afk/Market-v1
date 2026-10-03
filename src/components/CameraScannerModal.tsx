import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeScanned,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setScannerError(null);
      setLastScanned(null);

      const elementId = 'camera-barcode-reader';

      const timer = setTimeout(async () => {
        try {
          if (!isMounted) return;

          const scanner = new Html5Qrcode(elementId, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
            verbose: false,
          });

          html5QrcodeRef.current = scanner;

          await scanner.start(
            { facingMode },
            {
              fps: 15,
              qrbox: { width: 260, height: 160 },
              aspectRatio: 1.5,
            },
            (decodedText) => {
              if (isMounted) {
                posAudio.playBeep();
                setLastScanned(decodedText);
                onBarcodeScanned(decodedText);
                setTimeout(() => {
                  if (isMounted) setLastScanned(null);
                }, 1500);
              }
            },
            () => {
              // Ignore scan errors per frame
            }
          );
        } catch (err: unknown) {
          if (isMounted) {
            console.error('Camera initialization error:', err);
            setScannerError('تعذر فتح الكاميرا. يرجى السماح لصلاحية الكاميرا في المتصفح وإعادة المحاولة.');
          }
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5QrcodeRef.current) {
          html5QrcodeRef.current.stop().catch(() => {}).finally(() => {
            if (html5QrcodeRef.current) {
              html5QrcodeRef.current.clear();
              html5QrcodeRef.current = null;
            }
          });
        }
      };
    }
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const toggleCameraFacing = async () => {
    if (html5QrcodeRef.current) {
      await html5QrcodeRef.current.stop().catch(() => {});
      html5QrcodeRef.current.clear();
      html5QrcodeRef.current = null;
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">ماسح الباركود بالكاميرا</h3>
              <p className="text-[11px] text-slate-400">وجه الكاميرا نحو الباركود لمسحه فوراً</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="تبديل الكاميرا"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Feed Container */}
        <div className="relative bg-slate-950 flex flex-col items-center justify-center min-h-[280px] p-2 overflow-hidden">
          <div id="camera-barcode-reader" className="w-full h-full rounded-2xl overflow-hidden" />

          {/* Scan Target Guidance Animation */}
          {!scannerError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="w-64 h-36 border-2 border-dashed border-emerald-400/80 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                <div className="w-full h-0.5 bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
              </div>
              <span className="mt-3 text-[11px] font-bold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                ضع ملصق الباركود داخل الإطار
              </span>
            </div>
          )}

          {/* Scanner Error Notice */}
          {scannerError && (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-300 font-bold leading-relaxed">{scannerError}</p>
            </div>
          )}

          {/* Success Scanned Banner */}
          {lastScanned && (
            <div className="absolute bottom-4 bg-emerald-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>تم مسح: #{lastScanned}</span>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>تصدر نغمة عند النجاح</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق الكاميرا
          </button>
        </div>
      </div>
    </div>
  );
};
