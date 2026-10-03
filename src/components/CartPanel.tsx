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
    <div className="w-full lg:w-[450px] xl:w-[480px] bg-slate-950 border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Cart Top Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>فاتورة رقم #{orderNumber}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                نشط
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              عدد الأصناف: <strong className="text-emerald-400 font-mono">{totalItemCount}</strong>
            </p>
          </div>
        </div>

        {/* Customer Name Selector / Quick Tag */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 font-medium"
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-700 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-400">الفاتورة فارغة حالياً</p>
            <p className="text-xs text-slate-500 max-w-[200px]">
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
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition-all flex items-center justify-between gap-2 shadow-sm"
              >
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {formatCurrency(unitPrice, currency)} / {item.product.unit}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-mono font-bold text-xs text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-left font-mono font-extrabold text-xs text-emerald-400 w-20 truncate">
                  {formatCurrency(lineTotal, currency)}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onRemoveItem(index)}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
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
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 shrink-0">
        {/* Discount Bar Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>المجموع الفرعي:</span>
          <span className="font-mono font-bold text-slate-200">
            {formatCurrency(rawSubtotal, currency)}
          </span>
        </div>

        {orderDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              خصم الفاتورة:
            </span>
            <span className="font-mono font-bold">
              -{formatCurrency(orderDiscountAmount, currency)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>ضريبة القيمة المضافة ({vatRate * 100}%):</span>
          <span className="font-mono font-bold text-slate-300">
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
              className="flex-1 bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              تطبيق
            </button>
            <button
              type="button"
              onClick={() => setShowDiscountInput(false)}
              className="px-2 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-lg cursor-pointer"
            >
              إلغاء
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowDiscountInput(true)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Percent className="w-3 h-3" />
              {orderDiscountAmount > 0 ? 'تعديل الخصم' : 'إضافة خصم على الفاتورة'}
            </button>
          </div>
        )}

        {/* Digital Cash Register Display Display Board */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-3 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[10px] text-emerald-500/70 font-mono tracking-widest uppercase">
            Total Due / المجموع الإجمالي
          </div>
          <div className="text-3xl xl:text-4xl font-black text-emerald-400 font-mono tracking-tight pt-2">
            {formatCurrency(grandTotal, currency)}
          </div>
        </div>

        {/* POS Fast Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Cash Payment */}
          <button
            disabled={cart.length === 0}
            onClick={() => onOpenCheckout('cash')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-400/30 shadow-emerald-950/60 hover:scale-[1.02]'
            }`}
          >
            <Banknote className="w-5 h-5 text-emerald-200" />
            <span>دفع كاش (F2)</span>
          </button>

          {/* Card Payment */}
          <button
            disabled={cart.length === 0}
            onClick={() => onOpenCheckout('card')}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white border border-sky-400/30 shadow-sky-950/60 hover:scale-[1.02]'
            }`}
          >
            <CreditCard className="w-5 h-5 text-sky-200" />
            <span>دفع شبكة (F3)</span>
          </button>
        </div>

        {/* Auxiliary POS Bar */}
        <div className="grid grid-cols-2 gap-2">
          {/* Hold Order */}
          <button
            disabled={cart.length === 0}
            onClick={onHoldOrder}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-amber-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>تعليق الطلب (F4)</span>
          </button>

          {/* Clear Cart */}
          <button
            disabled={cart.length === 0}
            onClick={onClearCart}
            className="py-2 px-3 bg-slate-800 hover:bg-rose-900/60 active:bg-slate-900 border border-slate-700 hover:border-rose-700 text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>إلغاء (F8)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
