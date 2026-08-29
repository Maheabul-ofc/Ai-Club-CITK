import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';
  
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-danger text-white hover:bg-red-600 disabled:bg-red-300',
    ghost: 'bg-transparent text-brand-600 hover:bg-brand-50 disabled:text-brand-300',
    outline: 'bg-transparent text-brand-600 border border-brand-600 hover:bg-brand-50 disabled:border-brand-300 disabled:text-brand-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
