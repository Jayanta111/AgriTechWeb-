import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  const slides = [
    {
      title: t('slider.1.title'),
      description: t('slider.1.desc'),
      color: 'bg-slate-800',
      image: '/images/Banner.png'
    },
    {
      title: t('slider.2.title'),
      description: t('slider.2.desc'),
      color: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    },
    {
      title: t('slider.3.title'),
      description: t('slider.3.desc'),
      color: 'bg-gradient-to-br from-sky-400 to-blue-600',
    },
    {
      title: t('slider.4.title'),
      description: t('slider.4.desc'),
      color: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-44 overflow-hidden rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 group">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {slide.image ? (
            <div className="w-full h-full relative">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-contain bg-black/10 dark:bg-black/30" />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-6">
                <h3 className="text-xl font-bold text-center mb-2 tracking-wide drop-shadow-md">{slide.title}</h3>
                <p className="text-sm sm:text-base text-center font-medium text-white/90 max-w-[80%] drop-shadow-md">{slide.description}</p>
              </div>
            </div>
          ) : (
            <div className={`${slide.color} h-full flex flex-col justify-center items-center text-white p-6`}>
              <h3 className="text-xl font-bold text-center mb-2 tracking-wide drop-shadow-sm">{slide.title}</h3>
              <p className="text-sm sm:text-base text-center font-medium text-white/90 max-w-[80%]">{slide.description}</p>
            </div>
          )}
        </div>
      ))}
      
      {/* Dots indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-20">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70 cursor-pointer'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
