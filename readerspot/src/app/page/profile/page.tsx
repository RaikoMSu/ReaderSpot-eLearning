"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/app/(components)/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Edit, Book, Award, Clock, Calendar, Trophy, FlameIcon as Fire, BookOpen, Target, Camera } from "lucide-react"
import logo from "@/app/assets/Logo.png"

export default function ProfilePage() {
  const { user, userMetadata } = useAuth()
  const router = useRouter()

  // Mock data for the profile
  const profileData = {
    username: userMetadata?.username || "User",
    level: "Intermediate",
    progress: 5,
    joinDate: "September 2021",
    stats: {
      wordsLearned: 210,
      wordsChange: "+7%",
      booksRead: 2,
      booksChange: "+1%",
      cardsReviewed: 610,
      cardsChange: "+8%",
      hoursSpent: 6,
      hoursChange: "+2%",
    },
    achievements: [
      {
        id: 1,
        name: "Wildfire",
        icon: <Fire className="h-8 w-8 text-orange-500" />,
        description: "Reached a 7 day streak",
      },
      {
        id: 2,
        name: "Sage",
        icon: <Award className="h-8 w-8 text-blue-500" />,
        description: "Advanced to intermediate level",
      },
      {
        id: 3,
        name: "Scholar",
        icon: <Book className="h-8 w-8 text-yellow-500" />,
        description: "Learned 50 words in a day",
      },
      {
        id: 5,
        name: "Photogenic",
        icon: <Camera className="h-8 w-8 text-gray-400" />,
        description: "Added a profile picture",
      },
      {
        id: 6,
        name: "Weekend Warrior",
        icon: <Award className="h-8 w-8 text-purple-500" />,
        description: "Studied on weekends",
      },
      {
        id: 7,
        name: "Sharpshooter",
        icon: <Target className="h-8 w-8 text-red-500" />,
        description: "Completed an 8h session without mistakes",
      },
      {
        id: 8,
        name: "Timekeeper",
        icon: <Clock className="h-8 w-8 text-yellow-500" />,
        description: "Accumulated a total of 50 hours of study time",
      },
      {
        id: 9,
        name: "Bookworm",
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
        description: "Read a total of 30 books",
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1">
          <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    <Image
                      src={userMetadata?.avatarUrl || logo}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="rounded-full h-full w-full object-cover"
                    />
                  </div>
                  <div 
                    className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-2 cursor-pointer"
                    onClick={() => router.push('/page/profile/settings')}
                  >
                    <Camera className="h-4 w-4 text-black" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1">{profileData.username}</h2>
                <p className="text-gray-400 mb-2">@{profileData.username.toLowerCase()}</p>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
                <Button
                  onClick={() => router.push("/page/profile/settings")}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Proficiency Level Card */}
          <Card className="mt-4 bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">{profileData.level}</CardTitle>
              <p className="text-sm text-gray-400">Proficiency Level</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Keep up the excellent work — you're on the right track to reach new heights in your language skills.
              </p>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-right">
                    <span className="text-xl font-semibold inline-block text-yellow-400">{profileData.progress}%</span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${profileData.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats and Achievements */}
        <div className="md:col-span-2">
          {/* Monthly Progress */}
          <Card className="mb-6 bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Monthly Progress</CardTitle>
                <div className="text-sm text-gray-400">
                  <span>Month</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">Progress Summary</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-yellow-400 text-2xl">あ</div>
                  </div>
                  <div className="text-2xl font-bold">{profileData.stats.wordsLearned}</div>
                  <div className="text-sm text-gray-400">Words Learned</div>
                  <div className="text-xs text-yellow-400 mt-1">{profileData.stats.wordsChange} from last month</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-400 text-2xl">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{profileData.stats.booksRead}</div>
                  <div className="text-sm text-gray-400">Books read</div>
                  <div className="text-xs text-blue-400 mt-1">{profileData.stats.booksChange} from last month</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-purple-400 text-2xl">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{profileData.stats.cardsReviewed}</div>
                  <div className="text-sm text-gray-400">Cards Reviewed</div>
                  <div className="text-xs text-purple-400 mt-1">{profileData.stats.cardsChange} from last month</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-cyan-400 text-2xl">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{profileData.stats.hoursSpent}</div>
                  <div className="text-sm text-gray-400">Average hr spent</div>
                  <div className="text-xs text-cyan-400 mt-1">{profileData.stats.hoursChange} from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profileData.achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                    <div className="flex justify-center mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

