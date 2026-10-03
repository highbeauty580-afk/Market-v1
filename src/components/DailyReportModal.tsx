import React from 'react';
import { Order, StoreConfig } from '../types/pos';
import { 
  X, 
  BarChart3, 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  ShoppingBag, 
  Printer, 
  Receipt,
  RotateCcw 
} from 'lucide-react';
import { formatCurrency, formatPosDate } from '../utils/receiptGenerator';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  storeConfig: StoreConfig;
  cashierName: string;
  onResetShift: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeConfig,
  cashierName,
  onResetShift,
}) => {
  if (!isOpen) return null;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSales = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalTax = completedOrders.reduce((s, o) => s + o.taxAmount, 0);
  const totalOrders = completedOrders.length;

  const cashSales = completedOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((s, o) => s + o.totalAmount, 0);

  const cardSales = completedOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((s, o) => s + o.totalAmount, 0);

  const splitSales = completedOrders
    .filter((o) => o.paymentMethod === 'split')
    .reduce((s, o) => s + o.totalAmount, 0);

  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Aggregate Top Products
  const productSalesMap: Record<string, { name: string; qty: number; total: number }> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const pid = item.product.id;
      const price = item.customPrice ?? item.product.price;
      const lineTotal = price * item.quantity;

      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { name: item.product.name, qty: 0, total: 0 };
      }
      productSalesMap[pid].qty += item.quantity;
      productSalesMap[pid].total += lineTotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تقرير المبيعات اليومية (Z-Report)</h3>
              <p className="text-xs text-slate-400">ملخص الوردية الحالية للكاشير {cashierName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium">إجمالي المبيعات</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(totalSales, storeConfig.currency)}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium">عدد الفواتير</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {totalOrders}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium">الضريبة المجمعة</span>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {formatCurrency(totalTax, storeConfig.currency)}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium">متوسط الفاتورة</span>
              <div className="text-xl font-black text-cyan-400 font-mono mt-1">
                {formatCurrency(avgOrderValue, storeConfig.currency)}
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              توزيع المبيعات حسب طريقة الدفع
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-semibold">نقدي (كاش)</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(cashSales, storeConfig.currency)}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300 font-semibold">شبكة (مدى)</span>
                </div>
                <span className="font-mono font-bold text-sky-400">
                  {formatCurrency(cardSales, storeConfig.currency)}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 font-semibold">دفع مشترك</span>
                </div>
                <span className="font-mono font-bold text-purple-400">
                  {formatCurrency(splitSales, storeConfig.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              الأصناف الأكثر مبيعاً اليوم
            </h4>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">لا توجد مبيعات مسجلة اليوم بعد</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-200">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-slate-400 text-[11px]">{p.qty} كمية</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(p.total, storeConfig.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onResetShift}
            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="تصفير الوردية وبدء يوم جديد"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إغلاق الوردية وتصفير العدادات</span>
          </button>

          <button
            onClick={handlePrintZReport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير Z-Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
