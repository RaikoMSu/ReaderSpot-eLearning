import React, { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
}

export const CardContent: React.FC<CardProps> = ({ className = '', children }) => {
  return <div className={`p-4 ${className}`}>{children}</div>
}