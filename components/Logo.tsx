import React from 'react';
import logo from './image/logo.jpg'; // Assuming you have a logo image in the assets folder
export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-start gap-3 ${className}`}>
      <img
        src={logo}
        alt="Colb Finance Logo"
        className="w-12 h-12 rounded-full object-cover shadow-lg"
      />
      <div className="flex flex-col">
        <span className="text-xl  text-[25px]  font-extrabold text-black leading-none">COLB</span>
        <span className="text-sm font-bold text-yellow-900 tracking-wider uppercase">Finance</span>
      </div>
    </div>
  );
};
