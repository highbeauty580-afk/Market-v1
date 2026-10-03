import React, { useState } from 'react';
import { CartItem } from '../types/pos';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Banknote, 
  CreditCard, 
  PauseCircle, 
  RotateCcw, 
  User, 
  Percent,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../utils/receiptGenerator';

interface CartPanelProps {
  cart: CartItem[];
  orderNumber: number;
  currency: string;
  vatRate: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  orderDiscountAmount: number;
  setOrderDiscountAmount: (discount: number) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  onOpenCheckout: (method: 'cash' | 'card' | 'split') => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  orderNumber,
  currency,
  vatRate,
  customerName,
  setCustomerName,
  orderDiscountAmount,
  setOrderDiscountAmount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldOrder,
  onOpenCheckout
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountInput, setDiscountInput] = useState('');

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.customPrice ?? item.product.price;
    const itemDiscount = item.discountPercent ? itemPrice * (item.discountPercent / 100) : 0;
    return sum + (itemPrice - itemDiscount) * item.quantity;
  }, 0);

  const subtotalAfterOrderDiscount = Math.max(0, rawSubtotal - orderDiscountAmount);
  const taxAmount = subtotalAfterOrderDiscount * vatRate;
  const grandTotal = subtotalAfterOrderDiscount + taxAmount;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(discountInput);
    if (!isNaN(val) && val >= 0) {
      setOrderDiscountAmount(val);
    }
    setShowDiscountInput(false);
  };

  return (
    <div className="w-full lg:w-[450px] xl:w-[480px] bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-200/60 rounded-2xl sm:rounded-3xl flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Cart Top Bar */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>فاتورة رقم #{orderNumber}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-300/80 px-2 py-0.5 rounded-full font-mono font-bold">
                نشط
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              عدد الأصناف: <strong className="text-indigo-700 font-mono font-bold">{totalItemCount}</strong>
            </p>
          </div>
        </div>

        {/* Customer Name Selector / Quick Tag */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-white text-slate-800 border border-slate-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-emerald-600 font-bold shadow-sm"
          >
            <option value="عميل عام">عميل عام</option>
            <option value="عميل مميز (VIP)">عميل مميز (VIP)</option>
            <option value="عميل شركاء">عميل شركاء</option>
            <option value="طلب سفري">طلب سفري</option>
            <option value="طلب توصيل">طلب توصيل</option>
          </select>
        </div>
      </div>

      {/* Cart Itemized Table / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-200/80">
              <ShoppingBag className="w-10 h-10 text-slate-400 stroke-[1.5]" />
            </div>
            <p className="text-sm font-bold text-slate-700">الفاتورة فارغة حالياً</p>
            <p className="text-xs text-slate-400 max-w-[200px]">
              انقر على المنتجات أو امسح البارکود لإضافتها إلى قائمة الشراء
            </p>
          </div>
        ) : (
          cart.map((item, index) => {
            const unitPrice = item.customPrice ?? item.product.price;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div
                key={`${item.product.id}-${index}`}
                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 transition-all flex items-center justify-between gap-2 shadow-sm"
              >
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatCurrency(unitPrice, currency)} / {item.product.unit}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-mono font-bold text-xs text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-left font-mono font-extrabold text-xs text-emerald-700 w-20 truncate">
                  {formatCurrency(lineTotal, currency)}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onRemoveItem(index)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="حذف من الفاتورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Total Display Screen */}
      <div className="bg-white border-t border-slate-200/90 p-4 space-y-3 shrink-0">
        {/* Discount Bar Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>المجموع الفرعي:</span>
          <span className="font-mono font-bold text-slate-800">
            {formatCurrency(rawSubtotal, currency)}
          </span>
        </div>

        {orderDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              خصم الفاتورة:
            </span>
            <span className="font-mono">
              -{formatCurrency(orderDiscountAmount, currency)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>ضريبة القيمة المضافة ({vatRate * 100}%):</span>
          <span className="font-mono font-bold text-slate-700">
            {formatCurrency(taxAmount, currency)}
          </span>
        </div>

        {/* Discount Input Drawer */}
        {showDiscountInput ? (
          <form onSubmit={handleApplyDiscount} className="flex items-center gap-2 pt-1">
            <input
              type="number"
              step="0.5"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="مبلغ الخصم..."
              className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              تطبيق
            </button>
            <button
              type="button"
              onClick={() => setShowDiscountInput(false)}
              className="px-2 py-1.5 bg-slate-100 text-slate-500 text-xs rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowDiscountInput(true)}
              className="text-[11px] text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer font-bold"
            >
              <Percent className="w-3.5 h-3.5" />
              {orderDiscountAmount > 0 ? 'تعديل الخصم' : 'إضافة خصم على الفاتورة'}
            </button>
          </div>
        )}

        {/* Digital Cash Register Display Board */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border border-emerald-400/40 rounded-2xl p-4 text-center shadow-lg shadow-emerald-600/20 relative overflow-hidden text-white">
          <div className="absolute top-2 right-3.5 text-[10px] text-emerald-100/90 font-mono tracking-widest uppercase font-extrabold">
            Total Due / المجموع الإجمالي
          </div>
          <div className="text-3xl xl:text-4xl font-black font-mono tracking-tight pt-2 drop-shadow-sm">
            {formatCurrency(grandTotal, currency)}
          </div>
        </div>

        {/* POS Fast Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Cash Payment */}
          <button
            disabled={cart.length === 0}
            onClick={() => onOpenCheckout('cash')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              cart.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-500/30 shadow-emerald-600/30 hover:scale-[1.02]'
            }`}
          >
            <Banknote className="w-5 h-5 text-emerald-100" />
            <span>دفع كاش (F2)</span>
          </button>

          {/* Card Payment */}
          <button
            disabled={cart.length === 0}
            onClick={() => onOpenCheckout('card')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              cart.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white border border-sky-500/30 shadow-sky-600/30 hover:scale-[1.02]'
            }`}
          >
            <CreditCard className="w-5 h-5 text-sky-100" />
            <span>دفع شبكة (F3)</span>
          </button>
        </div>

        {/* Auxiliary POS Bar */}
        <div className="grid grid-cols-2 gap-2">
          {/* Hold Order */}
          <button
            disabled={cart.length === 0}
            onClick={onHoldOrder}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PauseCircle className="w-4 h-4 text-amber-600" />
            <span>تعليق الطلب (F4)</span>
          </button>

          {/* Clear Cart */}
          <button
            disabled={cart.length === 0}
            onClick={onClearCart}
            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>إلغاء (F8)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
