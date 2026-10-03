import React from 'react';
import { Order, StoreConfig } from '../types/pos';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  PlusCircle, 
  QrCode, 
  Share2 
} from 'lucide-react';
import { formatCurrency, formatPosDate, generateZatcaQrString } from '../utils/receiptGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeConfig: StoreConfig;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  storeConfig,
  onNewOrder
}) => {
  if (!isOpen || !order) return null;

  const { date, time } = formatPosDate(order.createdAt);
  const qrString = generateZatcaQrString(order, storeConfig);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">تم إتمام الفاتورة بنجاح</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Screen Display */}
        <div className="p-4 overflow-y-auto bg-slate-950 flex justify-center">
          <div
            id="thermal-receipt-printable"
            className="w-full max-w-[320px] bg-white text-slate-900 font-mono text-xs p-4 rounded-xl shadow-xl border border-slate-200 select-text leading-relaxed"
          >
            {/* Header / Store details */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
              <h2 className="text-base font-extrabold text-black font-sans">{storeConfig.storeName}</h2>
              <p className="text-[11px] font-sans text-slate-600">{storeConfig.storeSubtitle}</p>
              <div className="text-[10px] text-slate-700 pt-1 space-y-0.5">
                <p>الرقم الضريبي: <strong>{storeConfig.taxNumber}</strong></p>
                <p>السجل التجاري: <strong>{storeConfig.crNumber}</strong></p>
                <p>الهاتف: {storeConfig.phone}</p>
              </div>
              <div className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-sans font-bold text-[11px] mt-1 border border-slate-300">
                فاتورة ضريبية مبسطة
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>رقم الفاتورة:</span>
                <strong className="text-black">#{order.orderNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>التاريخ والوقت:</span>
                <span>{date} - {time}</span>
              </div>
              <div className="flex justify-between">
                <span>الكاشير:</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل:</span>
                <span>{order.customerName || 'عميل عام'}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-right my-2.5 text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-sans">
                  <th className="py-1 text-right">الصنف</th>
                  <th className="py-1 text-center">الكمية</th>
                  <th className="py-1 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, i) => {
                  const price = item.customPrice ?? item.product.price;
                  const total = price * item.quantity;
                  return (
                    <tr key={i} className="align-top">
                      <td className="py-1 pr-0 pl-1 font-sans font-semibold text-slate-900">
                        {item.product.name}
                        <div className="text-[9px] text-slate-500 font-mono">
                          {formatCurrency(price, storeConfig.currency)}
                        </div>
                      </td>
                      <td className="py-1 text-center font-mono">{item.quantity}</td>
                      <td className="py-1 text-left font-mono font-bold text-black">
                        {formatCurrency(total, storeConfig.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>المجموع غير شامل الضريبة:</span>
                <span>{formatCurrency(order.subtotal - order.discountAmount, storeConfig.currency)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>إجمالي الخصم:</span>
                  <span>-{formatCurrency(order.discountAmount, storeConfig.currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{formatCurrency(order.taxAmount, storeConfig.currency)}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-black pt-1 border-t border-black">
                <span>المجموع الإجمالي:</span>
                <span>{formatCurrency(order.totalAmount, storeConfig.currency)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2 mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>طريقة الدفع:</span>
                <strong className="text-black">
                  {order.paymentMethod === 'cash' ? 'نقدي (كاش)' : order.paymentMethod === 'card' ? 'شبكة (مدى)' : 'دفع مشترك'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المدفوع:</span>
                <span>{formatCurrency(order.amountPaid, storeConfig.currency)}</span>
              </div>
              {order.changeGiven > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>المتبقي للعميل (الباقي):</span>
                  <span>{formatCurrency(order.changeGiven, storeConfig.currency)}</span>
                </div>
              )}
            </div>

            {/* ZATCA QR Code & Barcode Simulation */}
            <div className="mt-3 text-center space-y-2 pt-2 border-t border-dashed border-slate-400">
              <div className="w-24 h-24 mx-auto bg-slate-900 text-white flex flex-col items-center justify-center p-2 rounded border border-slate-800">
                <QrCode className="w-16 h-16 text-white stroke-[1.5]" />
                <span className="text-[7px] text-slate-300 mt-0.5">ZATCA QR CODE</span>
              </div>

              <p className="text-[10px] text-slate-600 font-sans">{storeConfig.receiptFooter}</p>

              {/* Barcode representation */}
              <div className="pt-1">
                <div className="h-7 w-48 mx-auto bg-slate-900 flex items-center justify-center tracking-widest text-[9px] text-white font-mono rounded">
                  ||||| | ||||| |||| |||||| |||
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                  INV-{order.orderNumber}-{date.replace(/\//g, '')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewOrder();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>فاتورة جديدة</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
