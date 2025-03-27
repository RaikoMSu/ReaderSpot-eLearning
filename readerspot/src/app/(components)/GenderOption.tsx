'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface GenderOptionProps {
  gender: string;
  selected: boolean;
  onClick: () => void;
}

const GenderOption: React.FC<GenderOptionProps> = ({ gender, selected, onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full p-4 rounded-xl text-left transition-all duration-300 ${
        selected 
          ? 'bg-amber-500 text-black font-medium' 
          : 'border-2 border-foreground/20 bg-background/20 backdrop-blur-sm hover:border-foreground/40 hover:bg-background/40'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
          selected ? 'border-black bg-black' : 'border-foreground'
        }`}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-2 h-2 rounded-full bg-amber-500"
            />
          )}
        </div>
        <span className={selected ? 'text-black' : 'text-foreground'}>{gender}</span>
      </div>
    </motion.button>
  );
};

export default GenderOption;