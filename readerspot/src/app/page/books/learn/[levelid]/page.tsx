"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/(components)/ui/button"
import { ChevronLeft, Trophy, Lock } from "lucide-react"

interface LevelPageProps {
  params: {
    levelId: string
  }
}

export default function LevelPage({ params }: LevelPageProps) {
  const router = useRouter()
  const levelId = Number.parseInt(params.levelId)

  const [level, setLevel] = useState({
    id: levelId,
    title: `Book ${levelId}: ${getLevelName(levelId)}`,
    chapters: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Chapter ${i + 1}`,
      description: `Explore ${getLevelName(levelId)} concepts and vocabulary.`,
      unlocked: i === 0 || i < 1, // Only first chapter unlocked initially
      completed: i < 1,
      hasQuiz: true,
    })),
  })

  function getLevelName(id: number) {
    const names = ["Novice", "Intermediate", "Advanced", "Expert", "Fluent"]
    return names[id - 1] || "Unknown"
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/page/books/learn")}
          className="mr-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{level.title}</h1>
      </div>

      <div className="relative">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5 z-0"></div>

        {/* Path lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 -translate-x-1/2 z-0"></div>

        <div className="relative z-10 py-8">
          {level.chapters.map((chapter, index) => (
            <div key={chapter.id} className="mb-16 relative">
              {/* Chapter node */}
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  chapter.completed
                    ? "bg-yellow-400"
                    : chapter.unlocked
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-gray-300 dark:bg-gray-800"
                }`}
              >
                {chapter.completed ? (
                  <span className="text-black font-bold">{chapter.id}</span>
                ) : chapter.unlocked ? (
                  <span className="text-gray-700 dark:text-white font-bold">{chapter.id}</span>
                ) : (
                  <Lock className="h-6 w-6 text-gray-500" />
                )}
              </div>

              {/* Chapter content */}
              <div
                className={`max-w-md mx-auto p-6 rounded-lg ${
                  chapter.unlocked
                    ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    : "bg-gray-100 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50"
                }`}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{chapter.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{chapter.description}</p>

                {chapter.unlocked && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      onClick={() => router.push(`/page/books/learn/${levelId}/chapter/${chapter.id}`)}
                    >
                      {chapter.completed ? "Review" : "Start"}
                    </Button>

                    {chapter.hasQuiz && (
                      <Button
                        className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                        onClick={() => router.push(`/page/books/learn/${levelId}/chapter/${chapter.id}/quiz`)}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Quiz
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

