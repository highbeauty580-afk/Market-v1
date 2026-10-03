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
    <div className="bg-slate-50/60 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
      {CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Grid;
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
              isSelected
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-white hover:text-indigo-600 hover:border-indigo-300 shadow-sm'
            }`}
          >
            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
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
