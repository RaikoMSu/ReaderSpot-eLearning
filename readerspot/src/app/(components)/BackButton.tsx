'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BackButtonProps {
  onClick: () => void
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ x: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full glass-card"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </motion.button>
  )
}

export default BackButton
