import React from 'react';

const FlatCards = () => {
  const crops = [
    { name: 'Tomato', diseases: 9, icon: '\ud83c\udf45' },
    { name: 'Potato', diseases: 3, icon: '\ud83e\udd54' },
    { name: 'Pepper', diseases: 2, icon: '\ud83c\udf36\ufe0f' },
    { name: 'Lemon', diseases: 4, imageUrl: '/images/lenom.png' },
  ];

  return (
    <div className="py-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {crops.map((crop, index) => (
          <div
            key={index}
            className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center group"
          >
            <div className="text-3xl sm:text-4xl mb-3 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 h-10 w-10 flex items-center justify-center">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.name} className="w-full h-full object-contain" />
              ) : (
                crop.icon
              )}
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-1 transition-colors duration-300">
              {crop.name}
            </h3>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full transition-colors duration-300">
              {crop.diseases} conditions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlatCards;
