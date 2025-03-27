'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface GenreButtonProps {
  genre: string;
  selected: boolean;
  onClick: () => void;
}

const GenreButton: React.FC<GenreButtonProps> = ({ genre, selected, onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
        selected
          ? 'bg-amber-500 text-black font-medium shadow-md'
          : 'border-2 border-foreground/20 bg-background/20 backdrop-blur-sm text-foreground hover:border-foreground/40 hover:bg-background/40'
      }`}
    >
      {genre}
    </motion.button>
  );
};

export default GenreButton;