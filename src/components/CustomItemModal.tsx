import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Product } from '../types/pos';
import { posAudio } from '../utils/audio';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onAddCustomItem: (product: Product) => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddCustomItem,
}) => {
  const [name, setName] = useState('بضاعة غير مسجلة');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const customProd: Product = {
      id: `custom-${Date.now()}`,
      barcode: `CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim() || 'صنف مخصص',
      category: 'all',
      price: parsedPrice,
      stock: 999,
      unit: 'حبة',
    };

    posAudio.playBeep();
    onAddCustomItem(customProd);
    setName('بضاعة غير مسجلة');
    setPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">إضافة صنف غير مسجل (مخصص)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">اسم الصنف:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              placeholder="مثال: صنف متفرق / قسم المخبوزات"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">
              سعر البيع الإجمالي ({currency}):
            </label>
            <input
              type="number"
              step="0.25"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-lg rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة للفاتورة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
