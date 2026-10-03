import React from 'react';
import { Product } from '../types/pos';
import { Plus, PackageX, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/receiptGenerator';

interface ProductGridProps {
  products: Product[];
  currency: string;
  onAddToCart: (product: Product) => void;
  onOpenCustomItem: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = React.memo(({
  products,
  currency,
  onAddToCart,
  onOpenCustomItem
}) => {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <PackageX className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800">لم يتم العثور على أية أصناف</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
          جرّب كتابة كلمة بحث أخرى أو امسح البارکود مرة أخرى أو أضف صنف مخصص.
        </p>
        <button
          onClick={onOpenCustomItem}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all duration-150 cursor-pointer shadow-md shadow-emerald-600/20"
        >
          إضافة صنف مخصص جديد
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 align-content-start">
      {products.map((product) => {
        const isLowStock = product.stock <= 5;
        const isOutOfStock = product.stock <= 0;

        return (
          <button
            key={product.id}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-right transition-all duration-100 ease-out transform-gpu cursor-pointer select-none h-36 ${
              isOutOfStock
                ? 'bg-slate-100/70 border-slate-200/80 opacity-60 cursor-not-allowed'
                : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-400/80 hover:-translate-y-0.5 active:scale-[0.98]'
            }`}
          >
            {/* Top Row: Barcode indicator / Stock badge */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-mono border border-slate-200/80">
                #{product.barcode.slice(-4)}
              </span>

              {isLowStock && !isOutOfStock && (
                <span className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                  متبقي {product.stock}
                </span>
              )}

              {isOutOfStock && (
                <span className="text-[10px] text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-lg border border-rose-200 font-bold">
                  نفذ المخزون
                </span>
              )}
            </div>

            {/* Middle: Product Name */}
            <div className="my-auto py-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                {product.name}
              </h4>
              {product.nameEn && (
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono dir-ltr text-right">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* Bottom Row: Price & Add Button */}
            <div className="flex items-end justify-between w-full pt-1.5 border-t border-slate-100">
              <div>
                <span className="text-sm sm:text-base font-black text-emerald-600 font-mono tracking-tight">
                  {formatCurrency(product.price, currency)}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">/ {product.unit}</span>
              </div>

              <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});
