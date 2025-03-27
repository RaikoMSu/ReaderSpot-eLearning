'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProgressBar from '../(components)/ProgressBar';
import LanguageCard from '../(components)/LanguageCard';
import GenreButton from '../(components)/ui/GenreButton';
import GenderOption from '../(components)/GenderOption';
import BackButton from '../(components)/BackButton';
import ActionButton from '../(components)/ActionButton';
import ProfileForm from '../(components)/ui/ProfileForm';
import AnimatedBackground from '../(components)/AnimatedBackground';
import { toast } from 'sonner';

// Types
type Language = {
  code: string
  name: string
  learners: number
  flag: string
}

const languages: Language[] = [
  { code: "es", name: "Spanish", learners: 125000, flag: "/lovable-uploads/6d2bafd0-99ee-44d6-b5aa-81a716b93aef.png" },
  { code: "fr", name: "French", learners: 120000, flag: "/lovable-uploads/1c18b515-cdd4-4b9c-ae9a-515e8e3a10fb.png" },
  { code: "ja", name: "Japanese", learners: 100000, flag: "/lovable-uploads/4e72be17-8ddc-4f7c-a347-35a03922154a.png" },
  { code: "ko", name: "Korean", learners: 90000, flag: "/lovable-uploads/c597432e-71fc-45d4-a260-8bb98d086a86.png" },
  { code: "de", name: "German", learners: 80000, flag: "/flags/de.png" },
  { code: "hi", name: "Hindi", learners: 70000, flag: "/flags/in.png" },
  { code: "it", name: "Italian", learners: 65000, flag: "/flags/it.png" },
  { code: "zh", name: "Chinese", learners: 60000, flag: "/flags/cn.png" },
  { code: "ru", name: "Russian", learners: 50000, flag: "/flags/ru.png" },
  { code: "ar", name: "Arabic", learners: 45000, flag: "/flags/sa.png" },
  { code: "en", name: "English", learners: 40000, flag: "/flags/gb.png" },
  { code: "pt", name: "Portuguese", learners: 35000, flag: "/flags/pt.png" },
]

const genres = [
  "Romance", "Comedy", "Comics", "Biography", "Sci-Fi",
  "Psychology", "Arts and Photography", "Adventure", "Travel",
  "Science and Technology", "Children's", "Horror", "Thriller",
  "Fantasy", "Action", "Inspiration", "Mystery", "Instructional",
  "Literature", "Business and Economics", "Poetry", "Reference",
  "Society", "Politics", "Philosophy", "Sports", "Self-Help"
]

const genders = [
  "Male",
  "Female",
  "Non-binary",
  "Something else",
  "Prefer not to say"
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    } 
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 } 
  }
}

const OnboardingPage = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<string>("")
  const [profileData, setProfileData] = useState<{
    name: string
    bio: string
    avatar?: File
  } | null>(null)
  const [progress, setProgress] = useState(25)
  const [previousProgress, setPreviousProgress] = useState(0)
  const [titleWords, setTitleWords] = useState<string[]>([])

  useEffect(() => {
    switch(step) {
      case 1:
        setTitleWords("Please select your target language".split(" "))
        break
      case 2:
        setTitleWords("Please select the literary genre you prefer".split(" "))
        break
      case 3:
        setTitleWords("What is your gender".split(" "))
        break
      case 4:
        setTitleWords("Complete your profile".split(" "))
        break
      default:
        setTitleWords([])
    }
  }, [step])

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code)
  }

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre)
      }
      return [...prev, genre]
    })
  }

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender)
  }

  const handleProfileUpdate = (data: {
    name: string
    bio: string
    avatar?: File
  }) => {
    setProfileData(data)
  }

  const handleContinue = () => {
    setPreviousProgress(progress)
    
    if (step === 1 && selectedLanguage) {
      setStep(2)
      setProgress(50)
    } else if (step === 2 && selectedGenres.length >= 3) {
      setStep(3)
      setProgress(75)
    } else if (step === 3 && selectedGender) {
      setStep(4)
      setProgress(100)
    } else if (step === 4 && profileData && profileData.name) {
      console.log("Onboarding complete with:", { 
        selectedLanguage, 
        selectedGenres, 
        selectedGender,
        profileData 
      })
      
      toast.success("Profile successfully created!", {
        description: "Welcome to your learning journey!"
      })
      
      setTimeout(() => {
        router.push('/library')
      }, 1500)
    }
  }

  const handleBack = () => {
    setPreviousProgress(progress)
    
    if (step === 2) {
      setStep(1)
      setProgress(25)
    } else if (step === 3) {
      setStep(2)
      setProgress(50)
    } else if (step === 4) {
      setStep(3)
      setProgress(75)
    }
  }

  const handleSkip = () => {
    if (step === 2) {
      setPreviousProgress(progress)
      setStep(3)
      setProgress(75)
    } else if (step === 4) {
      console.log("Skipped profile completion. Onboarding complete with:", { 
        selectedLanguage, 
        selectedGenres, 
        selectedGender
      })
      
      toast.success("Onboarding complete!", {
        description: "You can update your profile later in settings."
      })
      
      setTimeout(() => {
        router.push('/library')
      }, 1500)
    }
  }

  const isButtonDisabled = () => {
    if (step === 1) return !selectedLanguage
    if (step === 2) return selectedGenres.length < 3
    if (step === 3) return !selectedGender
    if (step === 4) return !(profileData && profileData.name)
    return false
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      <ProgressBar progress={progress} previousProgress={previousProgress} />
      
      {step > 1 && <BackButton onClick={handleBack} />}
      
      <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen flex flex-col justify-center relative z-10">
        <motion.div
          key={`step-${step}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-10 md:mb-16">
            <div className="mb-2 flex flex-wrap justify-center gap-x-2 gap-y-1">
              {titleWords.map((word: string, i: number) => (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            
            {step === 2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mt-3"
              >
                We use your preferences to help personalize our content recommendations for you
              </motion.p>
            )}
            
            {step === 2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground/60 text-sm mt-2"
              >
                Please select at least 3 genres
              </motion.p>
            )}
            
            {step === 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mt-3"
              >
                We use your gender to help personalize our content recommendations for you
              </motion.p>
            )}
            
            {step === 4 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mt-3"
              >
                Let others know who you are
              </motion.p>
            )}
          </div>

          {/* Step 1: Language Selection */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {languages.map((lang) => (
                <LanguageCard
                  key={lang.code}
                  code={lang.code}
                  name={lang.name}
                  learners={lang.learners}
                  flagUrl={lang.flag}
                  selected={selectedLanguage === lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                />
              ))}
            </div>
          )}

          {/* Step 2: Genre Selection */}
          {step === 2 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {genres.map((genre) => (
                <GenreButton
                  key={genre}
                  genre={genre}
                  selected={selectedGenres.includes(genre)}
                  onClick={() => handleGenreSelect(genre)}
                />
              ))}
            </div>
          )}

          {/* Step 3: Gender Selection */}
          {step === 3 && (
            <div className="max-w-md mx-auto w-full space-y-3">
              {genders.map((gender) => (
                <GenderOption
                  key={gender}
                  gender={gender}
                  selected={selectedGender === gender}
                  onClick={() => handleGenderSelect(gender)}
                />
              ))}
            </div>
          )}
          
          {/* Step 4: Profile Completion */}
          {step === 4 && (
            <ProfileForm onProfileUpdate={handleProfileUpdate} />
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center space-x-4">
            {(step === 2 || step === 4) && (
              <ActionButton 
                onClick={handleSkip}
                isPrimary={false}
              >
                Skip
              </ActionButton>
            )}
            
            <ActionButton
              onClick={handleContinue}
              disabled={isButtonDisabled()}
            >
              {step === 4 ? 'Complete' : 'Continue'}
            </ActionButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OnboardingPage 