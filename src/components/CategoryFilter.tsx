import React from 'react';
import { CATEGORIES } from '../data/initialProducts';
import { CategoryId } from '../types/pos';
import { 
  Grid, 
  CupSoda, 
  Milk, 
  UtensilsCrossed, 
  Cookie, 
  Apple, 
  Sparkles, 
  Heart 
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  categoryCounts: Record<string, number>;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Grid,
  CupSoda,
  Milk,
  UtensilsCrossed,
  Cookie,
  Apple,
  Sparkles,
  Heart
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts
}) => {
  return (
    <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
      {CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Grid;
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
              isSelected
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
            }`}
          >
            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isSelected
                  ? 'bg-emerald-800/80 text-emerald-100'
                  : 'bg-slate-900 text-slate-400 border border-slate-700/50'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
