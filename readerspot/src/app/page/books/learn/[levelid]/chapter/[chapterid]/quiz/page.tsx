"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/(components)/ui/button"
import { Card, CardContent } from "@/app/(components)/ui/card"
import { ChevronLeft, Check, X } from "lucide-react"

interface QuizPageProps {
  params: {
    levelId: string
    chapterId: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter()
  const levelId = Number.parseInt(params.levelId)
  const chapterId = Number.parseInt(params.chapterId)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  // Mock quiz data
  const quizQuestions = [
    {
      id: 1,
      question: "おそれるべきものはもう何もない。",
      translation: "There's nothing to be afraid of anymore.",
      options: [
        { id: "a", text: "なにもない" },
        { id: "b", text: "たべるもない" },
        { id: "c", text: "いくもない" },
        { id: "d", text: "わかるもない" },
      ],
      correctAnswer: "a",
    },
    {
      id: 2,
      question: "私の名前は田中です。",
      translation: "My name is Tanaka.",
      options: [
        { id: "a", text: "名前" },
        { id: "b", text: "学生" },
        { id: "c", text: "先生" },
        { id: "d", text: "友達" },
      ],
      correctAnswer: "a",
    },
    {
      id: 3,
      question: "今日は天気がいいですね。",
      translation: "The weather is nice today, isn't it?",
      options: [
        { id: "a", text: "明日" },
        { id: "b", text: "昨日" },
        { id: "c", text: "今日" },
        { id: "d", text: "毎日" },
      ],
      correctAnswer: "c",
    },
  ]

  const currentQuizQuestion = quizQuestions[currentQuestion]

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswerChecked) return
    setSelectedAnswer(answerId)
  }

  const checkAnswer = () => {
    if (!selectedAnswer) return

    setIsAnswerChecked(true)
    if (selectedAnswer === currentQuizQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setIsAnswerChecked(false)

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswerChecked(false)
    setScore(0)
    setQuizCompleted(false)
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/page/books/learn/${levelId}`)}
          className="mr-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chapter {chapterId} Quiz</h1>
      </div>

      {!quizCompleted ? (
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Guess the reading</h2>

            <div className="mb-6">
              <p className="text-2xl mb-2 text-gray-900 dark:text-white">{currentQuizQuestion.question}</p>
              <p className="text-gray-500 dark:text-gray-400">{currentQuizQuestion.translation}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuizQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  variant={
                    selectedAnswer === option.id
                      ? isAnswerChecked
                        ? option.id === currentQuizQuestion.correctAnswer
                          ? "default"
                          : "destructive"
                        : "default"
                      : "outline"
                  }
                  className={`h-16 text-lg ${
                    isAnswerChecked && option.id === currentQuizQuestion.correctAnswer
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : selectedAnswer === option.id
                        ? "bg-yellow-400 text-black"
                        : "border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  }`}
                  onClick={() => handleAnswerSelect(option.id)}
                >
                  {option.text}
                  {isAnswerChecked && option.id === currentQuizQuestion.correctAnswer && (
                    <Check className="ml-2 h-5 w-5" />
                  )}
                  {isAnswerChecked &&
                    selectedAnswer === option.id &&
                    option.id !== currentQuizQuestion.correctAnswer && <X className="ml-2 h-5 w-5" />}
                </Button>
              ))}
            </div>

            {!isAnswerChecked ? (
              <Button
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                onClick={checkAnswer}
                disabled={!selectedAnswer}
              >
                Check
              </Button>
            ) : (
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600" onClick={nextQuestion}>
                {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Completed!</h2>
            <p className="text-xl mb-6 text-gray-900 dark:text-white">
              Your score: {score} out of {quizQuestions.length}
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={restartQuiz}
                className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Restart Quiz
              </Button>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500"
                onClick={() => router.push(`/page/books/learn/${levelId}`)}
              >
                Back to Roadmap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

