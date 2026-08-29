import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-brand-950 text-gray-300 py-8 border-t border-brand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="font-medium text-white text-lg">AI Club © {new Date().getFullYear()}</p>
          <p className="text-sm">Central Institute of Technology, Kokrajhar</p>
        </div>
        <div className="flex items-center text-sm flex-wrap justify-center md:justify-end gap-x-1">
          <span>Crafted with</span>
          <FaHeart className="mx-1 text-red-500" />
          <span>by</span>
          <a href="https://www.linkedin.com/in/mahea-bul/" target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:text-white transition-colors hover:underline font-medium">
            Mahea Bul
          </a>
          <span>&</span>
          <a href="https://www.linkedin.com/in/yuvaraj-dey-0803832b8/" target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:text-white transition-colors hover:underline font-medium">
            Yuvaraj Dey
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
