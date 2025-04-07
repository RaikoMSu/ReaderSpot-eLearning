"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/app/(components)/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronRight, FileText, Lock, Globe, Bell, Eye, Sliders, Accessibility, Database, Camera } from "lucide-react"
import placeholder from "@/app/assets/Logo.png"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/app/(components)/ui/use-toast"
import { v4 as uuidv4 } from 'uuid'

export default function ProfileSettingsPage() {
  const { user, userMetadata } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [username, setUsername] = useState("")
  const [language, setLanguage] = useState("English")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [country, setCountry] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Countries list
  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Spain", "Italy", "Japan", "China", "India", "Brazil",
    "Mexico", "South Korea", "Russia", "Philippines", "Nigeria", "South Africa"
  ]

  // Languages list - matches the languages in onboarding
  const languages = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
    { code: "ru", name: "Russian" },
    { code: "ar", name: "Arabic" },
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" }
  ]
  
  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      
      setIsLoading(true)
      try {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('username, avatar_url, has_completed_onboarding')
          .eq('user_id', user.id)
          .single()
          
        // Get preferences data - Use maybeSingle() in case row doesn't exist yet
        const { data: prefData, error: prefError } = await supabase
          .from('user_preferences')
          .select('date_of_birth, country, language, target_language')
          .eq('user_id', user.id)
          .maybeSingle()
          
        // Check for errors after both fetches
        if (profileError) throw profileError
        if (prefError) throw prefError // Still throw if there's a DB error, but not for missing row
        
        // Set data from profile
        if (profileData) {
          setUsername(profileData.username || '')
          setAvatarUrl(profileData.avatar_url || null)
        }
        
        // Set data from preferences (prefData will be null if row doesn't exist)
        if (prefData) {
          setDateOfBirth(prefData.date_of_birth || '')
          setCountry(prefData.country || '')
          setLanguage(prefData.language || 'en')
          setTargetLanguage(prefData.target_language || 'es')
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error loading settings",
          description: "Could not load your current settings. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, toast])

  const handleFileUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }
      
      setAvatarFile(file)
      
      // Create a temporary preview
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      let newAvatarUrl = avatarUrl
      
      // Upload the new avatar if one was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${uuidv4()}.${fileExt}`
        const filePath = `avatars/${fileName}`
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase
          .storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          throw new Error(`Error uploading avatar: ${uploadError.message}`)
        }
        
        // Get the public URL
        const { data } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        if (data) {
          newAvatarUrl = data.publicUrl
        }
      }
      
      // Update the profile with new avatar URL and other data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          username: username,
          avatar_url: newAvatarUrl
        })
        .eq('user_id', user.id)
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`)
      }
      
      // Update preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .update({
          date_of_birth: dateOfBirth,
          country: country,
          language: language,
          target_language: targetLanguage
        })
        .eq('user_id', user.id)
      
      if (prefError) {
        throw new Error(`Error updating preferences: ${prefError.message}`)
      }

      // Force reload user metadata in auth context
      if (typeof window !== 'undefined') {
        // Create an event to notify components to refresh user data
        const refreshEvent = new CustomEvent('auth:profileUpdated', {
          detail: { username, avatarUrl: newAvatarUrl }
        })
        window.dispatchEvent(refreshEvent)
      }

      toast({
        title: "Success",
        description: "Your profile settings have been updated.",
      })
      
      router.push("/page/profile")
    } catch (error) {
      console.error("Error saving changes:", error)
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "Failed to save your changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/page/profile")
  }

  const settingsCategories = [
    { id: "profile", name: "Profile", icon: <FileText className="h-5 w-5" />, active: true },
    { id: "login", name: "Login & Security", icon: <Lock className="h-5 w-5" /> },
    { id: "language", name: "Language Preferences", icon: <Globe className="h-5 w-5" /> },
    { id: "learning", name: "Learning Preferences", icon: <Sliders className="h-5 w-5" /> },
    { id: "notifications", name: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { id: "privacy", name: "Privacy & Sharing", icon: <Eye className="h-5 w-5" /> },
    { id: "global", name: "Global Preferences", icon: <Globe className="h-5 w-5" /> },
    { id: "accessibility", name: "Accessibility", icon: <Accessibility className="h-5 w-5" /> },
    { id: "data", name: "Data and Account Management", icon: <Database className="h-5 w-5" /> },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          onClick={() => router.push("/page/profile")}
          variant="ghost"
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 pl-0"
        >
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
          Back to Profile
        </Button>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <button
            onClick={() => router.push("/page/profile")}
            className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
          >
            Account
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-600 dark:text-gray-400" />
          <span className="text-yellow-600 dark:text-yellow-400">Profile</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column - Settings Categories */}
        <div className="md:col-span-1">
          <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardContent className="p-0">
              <ul className="">
                {settingsCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        category.active
                          ? "bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                      onClick={() => {
                        // In a real app, this would navigate to the specific settings page
                      }}
                    >
                      <span className="mr-3">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Settings Form */}
        <div className="md:col-span-3">
          <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardHeader>
              <div className="flex items-center">
                <div className="relative mr-4 cursor-pointer" onClick={handleFileUpload}>
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    <Image
                      src={avatarUrl || placeholder}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1.5 cursor-pointer shadow">
                    <Camera className="h-3.5 w-3.5 text-black" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div>
                  <CardTitle>{username || "Username"}</CardTitle>
                  <p className="text-sm text-gray-500">Update your profile picture</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={handleSaveChanges}
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" className="ml-auto">
                    Delete Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

