import React, { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';

const Hero: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex flex-col items-center justify-center pt-32 pb-24 px-4 sm:px-6 lg:px-8"
    >
      <div 
        className={`transition-all duration-1000 ease-out transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-6xl sm:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
          Hello World
        </h1>
      </div>
      
      <div 
        className={`mt-8 max-w-2xl mx-auto text-center transition-all duration-1000 delay-300 ease-out transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <p className="text-xl text-gray-600 leading-relaxed">
          A beautiful, minimal design with subtle animations and responsive layout.
          Crafted with React, TypeScript, and Tailwind CSS.
        </p>
      </div>
      
      <div 
        className={`mt-10 transition-all duration-1000 delay-500 ease-out transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;