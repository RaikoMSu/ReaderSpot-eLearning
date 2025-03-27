'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LanguageCardProps {
  code: string
  name: string
  learners: number
  flagUrl: string
  selected: boolean
  onClick: () => void
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  code,
  name,
  learners,
  flagUrl,
  selected,
  onClick
}) => {
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
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={flagUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold">{name}</h3>
          <p className={`text-sm ${selected ? 'text-black/70' : 'text-gray-400'}`}>
            {learners.toLocaleString()} learners
          </p>
        </div>
      </div>
    </motion.button>
  )
}

export default LanguageCard