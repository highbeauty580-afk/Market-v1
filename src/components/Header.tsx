import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Volume2, 
  VolumeX, 
  PauseCircle, 
  BarChart3, 
  Package, 
  Keyboard, 
  Settings,
  Clock
} from 'lucide-react';
import { StoreConfig } from '../types/pos';
import { posAudio } from '../utils/audio';

interface HeaderProps {
  storeConfig: StoreConfig;
  cashierName: string;
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  onOpenReport: () => void;
  onOpenProductManager: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenSupabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  heldOrdersCount,
  onOpenHeldOrders,
  onOpenReport,
  onOpenProductManager,
  onOpenShortcuts,
  onOpenSettings
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    posAudio.enabled = next;
    if (next) posAudio.playBeep();
  };

  return (
    <header className="bg-white/95 border border-slate-200/90 shadow-sm rounded-2xl mx-3 mt-3 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none will-change-transform">
      {/* Zone 1: Store Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              {storeConfig.storeName}
            </h1>
            <span className="bg-emerald-100/80 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200/80">
              POS v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Digital Clock & Date */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-700 text-xs font-mono shadow-inner">
        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="text-slate-900 font-bold text-sm tracking-wider">{time}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{date}</span>
        </div>
      </div>

      {/* Zone 3: Quick POS Function Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Held Orders Button */}
        <button
          onClick={onOpenHeldOrders}
          className="relative px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all duration-150 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="الطلبات المعلقة (F4)"
        >
          <PauseCircle className="w-4 h-4 text-amber-500" />
          <span>المعلقة</span>
          {heldOrdersCount > 0 && (
            <span className="bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-xs">
              {heldOrdersCount}
            </span>
          )}
        </button>

        {/* Daily Sales Report */}
        <button
          onClick={onOpenReport}
          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all duration-150 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="تقرير المبيعات اليومية"
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>التقرير اليومي</span>
        </button>

        {/* Product Inventory Manager */}
        <button
          onClick={onOpenProductManager}
          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all duration-150 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="إدارة أصناف المخزون"
        >
          <Package className="w-4 h-4 text-cyan-600" />
          <span>الأصناف</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border text-xs active:scale-95 transition-all duration-150 cursor-pointer shadow-xs ${
            soundEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
          }`}
          title={soundEnabled ? 'إيقاف الأصوات' : 'تفعيل الأصوات'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
          title="اختصارات لوحة المفاتيح"
        >
          <Keyboard className="w-4 h-4 text-slate-500" />
        </button>

        {/* Store Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
          title="إعدادات المتجر والرقم الضريبي"
        >
          <Settings className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
