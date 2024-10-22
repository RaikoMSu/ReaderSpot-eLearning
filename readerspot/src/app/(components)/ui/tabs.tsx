import React, { ReactNode, useState } from 'react'

interface TabsProps {
  defaultValue: string
  children: ReactNode
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className="tabs">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab })
        }
        return child
      })}
    </div>
  )
}

export const TabsList: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="flex mb-4 border-b">{children}</div>
}

export const TabsTrigger: React.FC<{ value: string; children: ReactNode }> = ({ value, children, ...props }) => {
  const { activeTab, setActiveTab } = props as any
  return (
    <button
      className={`px-4 py-2 ${
        activeTab === value ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

export const TabsContent: React.FC<{ value: string; children: ReactNode }> = ({ value, children, ...props }) => {
  const { activeTab } = props as any
  if (activeTab !== value) return null
  return <div>{children}</div>
}