import React from 'react';

interface ScrollViewProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollView: React.FC<ScrollViewProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {children}
    </div>
  );
};

export default ScrollView;
