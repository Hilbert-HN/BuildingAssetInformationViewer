import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} HelloWorld. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
              <span className="sr-only">Github</span>
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
              <span className="sr-only">Twitter</span>
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
              <span className="sr-only">LinkedIn</span>
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;