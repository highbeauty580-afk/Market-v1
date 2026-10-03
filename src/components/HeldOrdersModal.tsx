import React from 'react';
import { HeldOrder } from '../types/pos';
import { X, Play, Trash2, PauseCircle, Clock, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatPosDate } from '../utils/receiptGenerator';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  currency: string;
  onRestoreOrder: (held: HeldOrder) => void;
  onDeleteHeldOrder: (id: string) => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  isOpen,
  onClose,
  heldOrders,
  currency,
  onRestoreOrder,
  onDeleteHeldOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl border border-amber-200">
              <PauseCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">الطلبات المعلقة</h3>
              <p className="text-xs text-slate-500">استرجاع طلبات الفواتير المعلقة مسبقاً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">لا توجد أية طلبات معلقة حالياً</p>
              <p className="text-xs text-slate-400">
                يمكنك تعليق أية فاتورة قائمة بالضغط على زر (تعليق الطلب F4) لاستكمالها لاحقاً
              </p>
            </div>
          ) : (
            heldOrders.map((held) => {
              const { date, time } = formatPosDate(held.heldAt);
              const totalItems = held.items.reduce((s, i) => s + i.quantity, 0);
              const totalAmount = held.items.reduce((s, i) => {
                const price = i.customPrice ?? i.product.price;
                return s + price * i.quantity;
              }, 0);

              return (
                <div
                  key={held.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all flex flex-wrap items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        فاتورة #{held.orderNumber}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold border border-amber-200">
                        {held.customerName || 'عميل عام'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {time} - {date}
                      </span>
                      <span>·</span>
                      <span>الأصناف: {totalItems}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {formatCurrency(totalAmount, currency)}
                    </span>

                    <button
                      onClick={() => {
                        onRestoreOrder(held);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      title="استرجاع الفاتورة للشاشة الرئيسية"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>استرجاع</span>
                    </button>

                    <button
                      onClick={() => onDeleteHeldOrder(held.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
