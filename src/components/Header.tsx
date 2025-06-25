import React from 'react';
import { Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed w-full top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-blue-500 mr-2" />
            <span className="font-semibold text-lg text-gray-800">Neuron Asset Tools</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {['Dashboard', 'Assets', 'Reports', 'Settings'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>
          <button className="md:hidden focus:outline-none">
            <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;