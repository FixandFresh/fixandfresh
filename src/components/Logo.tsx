import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { userType, isAuthenticated } = useAppContext();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      className={`flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          <span className="text-white font-bold text-lg relative z-10">F</span>
          <span className="text-white font-bold text-lg relative z-10 -ml-1">&</span>
          <span className="text-white font-bold text-lg relative z-10 -ml-1">F</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Fix & Fresh Services
          </span>
        </div>
        {/* Mobile version - shorter text */}
        <div className="block sm:hidden">
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            F&F Services
          </span>
        </div>
      </div>
    </button>
  );
};

export default Logo;