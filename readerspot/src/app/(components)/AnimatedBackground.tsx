'use client'

import React from 'react'
import { motion } from 'framer-motion'

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Animated gradient blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, 100, 0],
          y: [0, -50, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        className="absolute top-0 -left-1/2 w-full h-full rounded-full bg-amber-500/30 blur-[100px]"
      />

      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
          x: [0, -100, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        className="absolute bottom-0 -right-1/2 w-full h-full rounded-full bg-purple-500/30 blur-[100px]"
      />

      <motion.div
        animate={{ 
          scale: [1.1, 0.9, 1.1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-blue-500/20 blur-[100px]"
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-50 mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  )
}

export default AnimatedBackground