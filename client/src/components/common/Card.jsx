import React from 'react';

const Card = ({ children, className = '', padding = true, onClick, ...rest }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${padding ? 'p-6' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
