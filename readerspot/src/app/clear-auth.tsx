'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/(components)/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClearAuth() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  const clearAuth = async () => {
    setMessage('Clearing authentication data...')
    
    try {
      // Sign out to clear session
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear local storage
      localStorage.clear()
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
      
      setMessage('Authentication data cleared! You will be redirected to login...')
      
      // Redirect to login page after a brief delay
      setTimeout(() => {
        router.push('/page/login')
      }, 2000)
    } catch (error) {
      console.error('Error clearing auth:', error)
      setMessage('Error clearing authentication data. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Troubleshooter</h1>
      
      <p className="mb-4 text-center max-w-md">
        If you're experiencing login issues, click the button below to clear your authentication data and reset your session.
      </p>
      
      <Button 
        onClick={clearAuth} 
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4"
      >
        Reset Authentication
      </Button>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-100 border rounded max-w-md text-center">
          {message}
        </div>
      )}
    </div>
  )
} 