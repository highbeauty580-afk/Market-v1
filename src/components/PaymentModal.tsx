import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../types/pos';
import { 
  X, 
  Banknote, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  ArrowLeft,
  Coins
} from 'lucide-react';
import { formatCurrency } from '../utils/receiptGenerator';
import { posAudio } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  currency: string;
  initialMethod: PaymentMethod;
  onCompleteSale: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    changeGiven: number,
    cashPaid?: number,
    cardPaid?: number
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  currency,
  initialMethod,
  onCompleteSale
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [cashInput, setCashInput] = useState<string>('');
  const [cardPaid, setCardPaid] = useState<number>(0);
  const [cardStatus, setCardStatus] = useState<'idle' | 'processing' | 'approved'>('idle');

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod);
      setCashInput(grandTotal.toFixed(2));
      setCardStatus('idle');
    }
  }, [isOpen, initialMethod, grandTotal]);

  if (!isOpen) return null;

  const numericCash = parseFloat(cashInput) || 0;
  const changeGiven = Math.max(0, numericCash - grandTotal);
  const isCashSufficient = numericCash >= grandTotal;

  const presetBills = [10, 20, 50, 100, 200, 500];

  const handleNumpad = (val: string) => {
    posAudio.playBeep();
    if (val === 'C') {
      setCashInput('');
    } else if (val === 'DEL') {
      setCashInput((prev) => prev.slice(0, -1));
    } else if (val === 'EXACT') {
      setCashInput(grandTotal.toFixed(2));
    } else {
      setCashInput((prev) => prev + val);
    }
  };

  const handleCardSimulate = () => {
    posAudio.playBeep();
    setCardStatus('processing');
    setTimeout(() => {
      setCardStatus('approved');
      posAudio.playSuccessChime();
    }, 1000);
  };

  const handleFinish = () => {
    posAudio.playCashDrawerOpen();
    posAudio.playSuccessChime();

    if (method === 'cash') {
      onCompleteSale('cash', numericCash, changeGiven);
    } else if (method === 'card') {
      onCompleteSale('card', grandTotal, 0, 0, grandTotal);
    } else {
      // Split
      const cashPart = parseFloat(cashInput) || 0;
      const cardPart = Math.max(0, grandTotal - cashPart);
      onCompleteSale('split', grandTotal, 0, cashPart, cardPart);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">إتمام عملية الدفع</h3>
              <p className="text-xs text-slate-500">اختر طريقة الدفع وأدخل المبلغ المستلم</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Total Banner */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-slate-400 font-medium">المبلغ المطلوب للدفع</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {formatCurrency(grandTotal, currency)}
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono font-bold">
                فاتورة محددة
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setMethod('cash'); posAudio.playBeep(); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                method === 'cash'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>نقدي (كاش)</span>
            </button>

            <button
              onClick={() => { setMethod('card'); posAudio.playBeep(); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                method === 'card'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>شبكة (مدى)</span>
            </button>

            <button
              onClick={() => { setMethod('split'); posAudio.playBeep(); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                method === 'split'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>دفع مشترك</span>
            </button>
          </div>

          {/* CASH MODE */}
          {method === 'cash' && (
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="text-xs text-slate-500 block mb-2 font-bold">
                  المبالغ المجهزة السريعة:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  <button
                    onClick={() => { setCashInput(grandTotal.toFixed(2)); posAudio.playBeep(); }}
                    className="py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer col-span-2 shadow-xs"
                  >
                    بالظبط ({grandTotal.toFixed(1)})
                  </button>
                  {presetBills.map((bill) => (
                    <button
                      key={bill}
                      onClick={() => { setCashInput(bill.toString()); posAudio.playBeep(); }}
                      className="py-2 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer font-mono shadow-xs"
                    >
                      {bill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Display & Change Calculation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <span className="text-[11px] text-slate-500 font-bold block">المبلغ المستلم من العميل</span>
                  <input
                    type="number"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full bg-transparent text-xl font-extrabold text-slate-900 font-mono focus:outline-none pt-1"
                    placeholder="0.00"
                  />
                </div>

                <div className={`border rounded-2xl p-3 ${
                  isCashSufficient 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'bg-rose-50 border-rose-300'
                }`}>
                  <span className="text-[11px] text-slate-500 font-bold block">المتبقي للعميل (الباقي)</span>
                  <div className={`text-xl font-black font-mono pt-1 ${
                    isCashSufficient ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {isCashSufficient 
                      ? formatCurrency(changeGiven, currency)
                      : 'المبلغ غير كافٍ'}
                  </div>
                </div>
              </div>

              {/* Onscreen POS Numpad */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-2xl border border-slate-200">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'DEL'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleNumpad(btn)}
                    className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-mono font-bold text-base rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CARD MODE */}
          {method === 'card' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 bg-sky-50 border-2 border-sky-300 rounded-full flex items-center justify-center mx-auto text-sky-600 animate-pulse shadow-sm">
                <CreditCard className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">جهاز صراف مدى / NFC جاهز</h4>
                <p className="text-xs text-slate-500 mt-1">
                  مرر بطاقة العميل أو الجوال عبر جهاز الشبكة بقيمة {formatCurrency(grandTotal, currency)}
                </p>
              </div>

              {cardStatus === 'idle' && (
                <button
                  onClick={handleCardSimulate}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer shadow-md shadow-sky-600/30"
                >
                  محاكاة تمرير البطاقة
                </button>
              )}

              {cardStatus === 'processing' && (
                <div className="text-amber-700 font-bold text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري معالجة العملية بالشبكة...</span>
                </div>
              )}

              {cardStatus === 'approved' && (
                <div className="text-emerald-800 font-bold text-sm flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 p-3 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم قبول عملية الدفع بنجاح!</span>
                </div>
              )}
            </div>
          )}

          {/* SPLIT MODE */}
          {method === 'split' && (
            <div className="space-y-4">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs text-slate-600 font-bold block mb-1">المبلغ النقدي (كاش):</label>
                  <input
                    type="number"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 font-mono font-bold text-base rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 shadow-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">المتبقي للدفع عبر البطاقة (شبكة):</span>
                  <span className="font-mono font-bold text-purple-700 text-sm">
                    {formatCurrency(Math.max(0, grandTotal - (parseFloat(cashInput) || 0)), currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            تراجع
          </button>

          <button
            disabled={method === 'cash' && !isCashSufficient}
            onClick={handleFinish}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>إتمام البيع وطباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
