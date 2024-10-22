import React, { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {children}
      </div>
    </div>
  )
}

export const DialogTrigger: React.FC<{ asChild?: boolean; children: ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const DialogContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="p-6">{children}</div>
}

export const DialogHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="mb-4">{children}</div>
}

export const DialogTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>
}