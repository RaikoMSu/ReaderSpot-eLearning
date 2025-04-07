import React from 'react';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isPrimary?: boolean;
  [key: string]: any; // Allow for custom attributes
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  isPrimary = true,
  ...rest // Capture remaining props
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isPrimary
          ? disabled
            ? 'bg-amber-500/50 text-black/70 cursor-not-allowed focus:ring-amber-300'
            : 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20 focus:ring-amber-500'
          : disabled
            ? 'bg-white/5 text-white/50 cursor-not-allowed' 
            : 'glass-card hover:bg-white/10 focus:ring-white/30'
      } ${className}`}
      {...rest} // Spread remaining props including data attributes
    >
      {children}
    </motion.button>
  );
};

export default ActionButton;