import React, { useState, useEffect } from 'react';
import { 
  Store, 
  User, 
  Volume2, 
  VolumeX, 
  PauseCircle, 
  BarChart3, 
  Package, 
  Keyboard, 
  Settings,
  Clock,
  Database
} from 'lucide-react';
import { StoreConfig } from '../types/pos';
import { posAudio } from '../utils/audio';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  storeConfig: StoreConfig;
  cashierName: string;
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  onOpenReport: () => void;
  onOpenProductManager: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenSupabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeConfig,
  cashierName,
  heldOrdersCount,
  onOpenHeldOrders,
  onOpenReport,
  onOpenProductManager,
  onOpenShortcuts,
  onOpenSettings,
  onOpenSupabase
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
    <header className="bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-2xl mx-3 mt-3 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
      {/* Zone 1: Store Brand & Cashier Shift */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 tracking-wide leading-none">
              {storeConfig.storeName}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200">
              POS v2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>الكاشير: <strong className="text-slate-800 font-semibold">{cashierName}</strong></span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{storeConfig.storeSubtitle}</span>
          </p>
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
        {/* Supabase Connection Status Button */}
        <button
          onClick={onOpenSupabase}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
          title="ربط سوبا بيز (Supabase)"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>{isSupabaseConfigured ? 'سوبا بيز متصل' : 'ربط Supabase'}</span>
        </button>

        {/* Held Orders Button */}
        <button
          onClick={onOpenHeldOrders}
          className="relative px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="الطلبات المعلقة (F4)"
        >
          <PauseCircle className="w-4 h-4 text-amber-500" />
          <span>المعلقة</span>
          {heldOrdersCount > 0 && (
            <span className="bg-amber-500 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
              {heldOrdersCount}
            </span>
          )}
        </button>

        {/* Daily Sales Report */}
        <button
          onClick={onOpenReport}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="تقرير المبيعات اليومية"
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>التقرير اليومي</span>
        </button>

        {/* Product Inventory Manager */}
        <button
          onClick={onOpenProductManager}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="إدارة أصناف المخزون"
        >
          <Package className="w-4 h-4 text-cyan-600" />
          <span>الأصناف</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border text-xs transition-all cursor-pointer shadow-sm ${
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
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/90 transition-all cursor-pointer shadow-sm"
          title="اختصارات لوحة المفاتيح"
        >
          <Keyboard className="w-4 h-4 text-slate-500" />
        </button>

        {/* Store Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/90 transition-all cursor-pointer shadow-sm"
          title="إعدادات المتجر والرقم الضريبي"
        >
          <Settings className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
