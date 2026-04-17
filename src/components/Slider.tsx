import React, { useState, useEffect } from 'react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Advanced AI Detection',
      description: '95%+ accuracy in identifying plant diseases',
      color: 'bg-green-500',
    },
    {
      title: 'Real-time Analysis',
      description: 'Get instant results with our fast processing',
      color: 'bg-blue-500',
    },
    {
      title: 'Multiple Crops Supported',
      description: 'Tomato, Potato, Pepper and more',
      color: 'bg-orange-500',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-40 mx-4 overflow-hidden rounded-xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`${slide.color} h-full flex flex-col justify-center items-center text-white p-6 rounded-xl`}>
            <h3 className="text-lg font-bold text-center mb-2">{slide.title}</h3>
            <p className="text-sm text-center">{slide.description}</p>
          </div>
        </div>
      ))}
      
      {/* Dots indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
