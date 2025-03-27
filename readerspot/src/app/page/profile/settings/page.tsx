"use client"

import { useState } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/app/(components)/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronRight, FileText, Lock, Globe, Bell, Eye, Sliders, Accessibility, Database } from "lucide-react"
import logo from "@/app/assets/Logo.png"

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState("Raiko Mystic Squad")
  const [language, setLanguage] = useState("English")
  const [targetLanguage, setTargetLanguage] = useState("Japanese")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [country, setCountry] = useState("Philippines")

  const handleSaveChanges = () => {
    // Save changes logic would go here
    router.push("/page/profile")
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
                <div className="relative mr-4">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    <Image
                      src={logo || "/placeholder.svg"}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <CardTitle>Update</CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mt-1">
                    Remove
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
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
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
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
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Philippines">Philippines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={handleSaveChanges}
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400"
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

