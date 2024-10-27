'use client'

import { useState, useEffect, useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

interface BookCardProps {
  cover: string | StaticImageData
  title: string
  progress?: number
}

export function BookCard({ cover, title, progress = 0 }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    if (isHovered) {
      controls.start({ opacity: 1, y: 0 })
      setAnimatedProgress(0)
      const timer = setTimeout(() => setAnimatedProgress(progress), 100)
      return () => clearTimeout(timer)
    } else {
      controls.start({ opacity: 0, y: 20 })
    }
  }, [isHovered, controls, progress])

  return (
    <div 
      className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={cover}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-300 group-hover:scale-110"
      />
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0  flex flex-col bg-gradient-to-t from-gray-50 to-transparent justify-end p-5"
          >
            <motion.h4 
              initial={{ opacity: 0, x: 2 }}
              animate={controls}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-gray-900 text-xl font-semibold mb-2"
            >
              {title}
            </motion.h4>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"
            >
              <motion.div 
                ref={progressRef}
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${animatedProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}