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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-2xl shadow-lg">
      <div className="flex justify-around items-center h-14 sm:h-16">
        {buttons.map(({ name, Icon }) => {
          const color = active === name ? '#4CAF50' : '#555';
          return (
            <button
              key={name}
              onClick={() => onPress(name)}
              className="flex flex-col items-center justify-center p-1 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Icon color={color} size={16} />
              <span className="text-xs mt-0.5 sm:mt-1 hidden sm:inline" style={{ color }}>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
