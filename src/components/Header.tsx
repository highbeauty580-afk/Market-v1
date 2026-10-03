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
    <header className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
      {/* Zone 1: Store Brand & Cashier Shift */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide leading-none">
              {storeConfig.storeName}
            </h1>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-700">
              POS v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <User className="w-3 h-3 text-emerald-400" />
            <span>الكاشير: <strong className="text-slate-200">{cashierName}</strong></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{storeConfig.storeSubtitle}</span>
          </p>
        </div>
      </div>

      {/* Zone 2: Digital Clock & Date */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 text-xs font-mono">
        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm tracking-wider">{time}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{date}</span>
        </div>
      </div>

      {/* Zone 3: Quick POS Function Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Supabase Connection Status Button */}
        <button
          onClick={onOpenSupabase}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border flex items-center gap-1.5 cursor-pointer ${
            isSupabaseConfigured
              ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400 hover:bg-emerald-900'
              : 'bg-amber-950/80 border-amber-700/60 text-amber-400 hover:bg-amber-900'
          }`}
          title="ربط سوبا بيز (Supabase)"
        >
          <Database className="w-4 h-4" />
          <span>{isSupabaseConfigured ? 'سوبا بيز متصل' : 'ربط Supabase'}</span>
        </button>

        {/* Held Orders Button */}
        <button
          onClick={onOpenHeldOrders}
          className="relative px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          title="الطلبات المعلقة (F4)"
        >
          <PauseCircle className="w-4 h-4 text-amber-400" />
          <span>المعلقة</span>
          {heldOrdersCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {heldOrdersCount}
            </span>
          )}
        </button>

        {/* Daily Sales Report */}
        <button
          onClick={onOpenReport}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          title="تقرير المبيعات اليومية"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>التقرير اليومي</span>
        </button>

        {/* Product Inventory Manager */}
        <button
          onClick={onOpenProductManager}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          title="إدارة أصناف المخزون"
        >
          <Package className="w-4 h-4 text-cyan-400" />
          <span>الأصناف</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
          }`}
          title={soundEnabled ? 'إيقاف الأصوات' : 'تفعيل الأصوات'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          title="اختصارات لوحة المفاتيح"
        >
          <Keyboard className="w-4 h-4 text-slate-400" />
        </button>

        {/* Store Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          title="إعدادات المتجر والرقم الضريبي"
        >
          <Settings className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
};
