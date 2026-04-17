import React from 'react';

const FlatCards = () => {
  const crops = [
    { name: 'Tomato', diseases: 9, icon: '\ud83c\udf45' },
    { name: 'Potato', diseases: 3, icon: '\ud83e\udd54' },
    { name: 'Pepper', diseases: 2, icon: '\ud83c\udf36\ufe0f' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-3 gap-3">
        {crops.map((crop, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-3xl text-center mb-2">{crop.icon}</div>
            <h3 className="font-semibold text-sm text-center text-gray-800 mb-1">
              {crop.name}
            </h3>
            <p className="text-xs text-center text-gray-600">
              {crop.diseases} conditions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlatCards;
