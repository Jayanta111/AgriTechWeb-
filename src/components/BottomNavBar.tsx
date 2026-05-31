import React from 'react';
import { Home, Camera, ShoppingCart, Cloud } from 'lucide-react';

type BottomNavBarProps = {
  active: string;
  onPress: (tabName: string) => void;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ active, onPress }) => {
  const buttons: { name: string; Icon: any }[] = [
    { name: 'Home', Icon: Home },
    { name: 'Scan', Icon: Camera },
    { name: 'Market', Icon: ShoppingCart },
    { name: 'Weather', Icon: Cloud },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-300 z-50">
      <div className="flex justify-around items-center h-16 sm:h-20">
        {buttons.map(({ name, Icon }) => {
          const isActive = active === name;
          return (
            <button
              key={name}
              onClick={() => onPress(name)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-agri-green dark:text-emerald-400 scale-110' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={20} className={isActive ? 'drop-shadow-sm' : ''} />
              <span className={`text-[10px] sm:text-xs mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
