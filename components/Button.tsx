import React from 'react';
import { JSX } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-gray-900 hover:shadow-yellow-400/20",
    secondary: "bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300",
    danger: "bg-red-500 text-white border-2 border-red-700 hover:bg-red-600",
    ghost: "bg-transparent text-black hover:bg-black/5 shadow-none",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span>Loading...</span>}
      {children}
    </button>
  );
};
