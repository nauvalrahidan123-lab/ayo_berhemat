import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[var(--bg-secondary)] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;