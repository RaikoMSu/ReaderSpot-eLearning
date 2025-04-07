'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LanguageCardProps {
  code: string
  name: string
  flagUrl: string | any // Allow for imported SVG
  selected: boolean
  onClick: () => void
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  code,
  name,
  flagUrl,
  selected,
  onClick
}) => {
  // Handle both string URLs and imported SVGs
  const flagSrc = typeof flagUrl === 'string' ? flagUrl : flagUrl.src;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full p-4 rounded-xl transition-colors duration-200 ${
        selected
          ? 'bg-amber-500 text-black'
          : 'bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm'
      }`}
      aria-pressed={selected}
      aria-label={`Select ${name} language`}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={flagSrc}
            alt={`${name} flag`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 24px, 48px"
            loading="eager"
          />
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold">{name}</h3>
        </div>
      </div>
    </motion.button>
  )
}

export default LanguageCard