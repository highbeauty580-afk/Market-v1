import React, { useState } from 'react';
import { StoreConfig } from '../types/pos';
import { X, Settings, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSaveConfig: (updated: StoreConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<StoreConfig>({ ...config });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">إعدادات المتجر وبيانات الضريبة</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">اسم التجاري للمتجر:</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">اسم الفرع / التفاصيل:</label>
            <input
              type="text"
              value={formData.storeSubtitle}
              onChange={(e) => setFormData({ ...formData, storeSubtitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">الرقم الضريبي (VAT No):</label>
              <input
                type="text"
                required
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">السجل التجاري (CR):</label>
              <input
                type="text"
                value={formData.crNumber}
                onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">رقم الهاتف / التواصل:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">العملة المفضلة:</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">العنوان:</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">رسالة تذييل الفاتورة المطبوعة:</label>
            <input
              type="text"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
