'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/app/(components)/ProgressBar';
import LanguageCard from '@/app/(components)/LanguageCard';
import GenreButton from '@/app/(components)/ui/GenreButton';
import GenderOption from '@/app/(components)/GenderOption';
import BackButton from '@/app/(components)/BackButton';
import ActionButton from '@/app/(components)/ActionButton';
import ProfileForm from '@/app/(components)/ui/ProfileForm';
import AnimatedBackground from '@/app/(components)/AnimatedBackground';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Import flag SVGs
import flagSpain from '@/app/assets/flags/Flag_of_Spain.svg'
import flagFrance from '@/app/assets/flags/Flag_of_France.svg'
import flagJapan from '@/app/assets/flags/Flag_of_Japan.svg'
import flagKorea from '@/app/assets/flags/Flag_of_South_Korea.svg'
import flagGermany from '@/app/assets/flags/Flag_of_Germany.svg'
import flagIndia from '@/app/assets/flags/Flag_of_India.svg'
import flagItaly from '@/app/assets/flags/Flag_of_Italy.svg'
import flagChina from '@/app/assets/flags/Flag_of_Peoples_Republic_of_China.svg'
import flagRussia from '@/app/assets/flags/Flag_of_Russia.svg'
import flagSaudiArabia from '@/app/assets/flags/Flag_of_Saudi_Arabia.svg'
import flagUSA from '@/app/assets/flags/Flag_of_United_States.svg'
import flagPortugal from '@/app/assets/flags/Flag_of_Portugal.svg'

// Types
type Language = {
  code: string
  name: string
  flag: string | any // Allow for imported SVG
}

const languages: Language[] = [
  { code: "es", name: "Spanish", flag: flagSpain },
  { code: "fr", name: "French", flag: flagFrance },
  { code: "ja", name: "Japanese", flag: flagJapan },
  { code: "ko", name: "Korean", flag: flagKorea },
  { code: "de", name: "German", flag: flagGermany },
  { code: "hi", name: "Hindi", flag: flagIndia },
  { code: "it", name: "Italian", flag: flagItaly },
  { code: "zh", name: "Chinese", flag: flagChina },
  { code: "ru", name: "Russian", flag: flagRussia },
  { code: "ar", name: "Arabic", flag: flagSaudiArabia },
  { code: "en", name: "English", flag: flagUSA },
  { code: "pt", name: "Portuguese", flag: flagPortugal },
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
  const { user, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<string>("")
  // Use a ref to store profile data to avoid render cycles
  const profileDataRef = React.useRef<{
    dateOfBirth: string
    country: string
    avatar?: File
  } | null>(null)
  const [progress, setProgress] = useState(25)
  const [previousProgress, setPreviousProgress] = useState(0)
  const [titleWords, setTitleWords] = useState<string[]>([])
  // Add a state to force re-render when profile data changes
  const [forceUpdate, setForceUpdate] = useState(false)
  // Add state to track if completion is in progress
  const [isCompleteInProgress, setIsCompleteInProgress] = useState(false)

  useEffect(() => {
    console.log("Onboarding page loaded, user:", user?.id, "isLoading:", isLoading);
    
    // Never redirect while loading - this is critical to prevent loops
    if (isLoading) {
      console.log("Auth is still loading, waiting before any redirects...");
      return;
    }
    
    // After loading completes, check for user
    if (!user) {
      console.warn("User not authenticated on onboarding page (after auth loaded)");
      
      // Only redirect if not already in a loop
      const recentLoads = JSON.parse(localStorage.getItem('onboardingPageLoads') || '[]');
      if (recentLoads.length <= 5) {
        // Delay redirect slightly to allow for state to settle
        setTimeout(() => {
          if (!user && !isLoading) {
            console.log("Redirecting to login after auth loaded (no user)");
            // Use direct window.location for a cleaner navigation
            window.location.href = '/page/login?message=Please log in to complete onboarding';
          }
        }, 500);
      } else {
        console.error("Detected potential redirect loop, sending to clear auth");
        window.location.href = '/clear-auth?source=onboarding_loop';
      }
      return;
    }
    
    // Only track page loads if we have a user
    if (user) {
      // Track recent onboarding page loads to detect loops
      const now = Date.now();
      const recentLoads = JSON.parse(localStorage.getItem('onboardingPageLoads') || '[]');
      
      // Add current timestamp
      recentLoads.push(now);
      
      // Only keep loads from the last 10 seconds
      const recentLoadsFiltered = recentLoads.filter((time: number) => now - time < 10000);
      
      // Save back to localStorage
      localStorage.setItem('onboardingPageLoads', JSON.stringify(recentLoadsFiltered));
      
      // Check for potential loop
      if (recentLoadsFiltered.length > 5) {
        console.warn("Rapid onboarding page loads detected, possible loop");
      }
    }
  }, [user, router, isLoading]);

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

  useEffect(() => {
    // Check for navigation failures
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === 4 && isCompleteInProgress) {
        // If onboarding completion is in progress, don't show confirmation dialog
        e.preventDefault();
        return null;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step, isCompleteInProgress]);

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

  const handleProfileUpdate = useCallback((data: {
    dateOfBirth: string
    country: string
    avatar?: File
  }) => {
    // Store in ref instead of state to avoid re-renders
    profileDataRef.current = data
    // Force button re-evaluation by updating a state
    setForceUpdate(prev => !prev)
  }, []);

  const handleContinue = async () => {
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
    } else if (step === 4 && user) {
      // Set flag to indicate completion is in progress
      setIsCompleteInProgress(true)
      
      try {
        // Disable the complete button to prevent multiple submissions
        const completeButton = document.querySelector("[data-complete-button='true']");
        if (completeButton) {
          completeButton.textContent = "Processing...";
          completeButton.setAttribute("disabled", "true");
        }
        
        // Get profile data with fallbacks
        const { dateOfBirth, country } = profileDataRef.current || {
          dateOfBirth: '2000-01-01', 
          country: 'United States'
        };
        
        console.log("Completing onboarding for user:", user.id)
        
        // Process avatar first to get the URL
        let avatarUrl = null;
        if (profileDataRef.current?.avatar) {
          console.log("Processing avatar before updating profile");
          avatarUrl = await processAvatarUpload(user.id, profileDataRef.current.avatar);
          console.log("Avatar processed, URL:", avatarUrl);
        }
        
        // First update the critical profile flag in database
        try {
          console.log("Setting onboarding completion flag in database...");
          const updateData: any = { has_completed_onboarding: true };
          
          // Add avatar URL to update if we have one
          if (avatarUrl) {
            updateData.avatar_url = avatarUrl;
            console.log("Including avatar URL in profile update:", avatarUrl);
          }
          
          const { error: profileUpdateError } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', user.id);
            
          if (profileUpdateError) {
            console.error("Profile update error:", profileUpdateError);
            throw profileUpdateError;
          } else {
            console.log("Successfully marked onboarding as complete in database", updateData);
            
            // Set persistent flag to prevent redirect loops
            localStorage.setItem('hasCompletedOnboarding', 'true');
            localStorage.setItem('onboardingCompletedTime', Date.now().toString());
            
            // Immediately update the context to prevent redirect loops
            window.dispatchEvent(new CustomEvent('auth:profileUpdated', {
              detail: { 
                hasCompletedOnboarding: true,
                ...(avatarUrl && { avatarUrl })
              }
            }));
            
            // Now update preferences (after the critical flag is set)
            try {
              console.log("Updating preferences...");
              const { data: existingPref } = await supabase
                .from('user_preferences')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
                
              if (existingPref) {
                // Update existing record
                await supabase
                  .from('user_preferences')
                  .update({ 
                    date_of_birth: dateOfBirth,
                    country: country,
                    language: selectedLanguage || 'en',
                    target_language: selectedLanguage || 'en',
                    preferred_genres: selectedGenres.length > 0 ? selectedGenres : ['Romance', 'Sci-Fi', 'Adventure'],
                    gender: selectedGender || 'Prefer not to say',
                    has_completed_onboarding: true
                  })
                  .eq('user_id', user.id);
                  
                console.log("Preferences updated successfully");
              } else {
                // Insert new record
                await supabase
                  .from('user_preferences')
                  .insert({ 
                    user_id: user.id,
                    date_of_birth: dateOfBirth,
                    country: country,
                    language: selectedLanguage || 'en',
                    target_language: selectedLanguage || 'en',
                    preferred_genres: selectedGenres.length > 0 ? selectedGenres : ['Romance', 'Sci-Fi', 'Adventure'],
                    gender: selectedGender || 'Prefer not to say',
                    has_completed_onboarding: true
                  });
                  
                console.log("Preferences created successfully");
              }
            } catch (prefError) {
              // Non-critical error, just log it
              console.error("Error updating preferences (non-critical):", prefError);
            }
            
            // Clean up before redirect
            localStorage.removeItem('redirectHistory');
            localStorage.removeItem('onboardingPageLoads');
            localStorage.removeItem('lastRedirect');
            localStorage.removeItem('noRedirect');
            
            // Show success message
            toast.success("Profile created successfully! Redirecting to library...");
            
            // Force immediate navigation to library with a delay to ensure UI update
            setTimeout(() => {
              console.log("Redirecting to library page");
              // Use direct navigation for cleaner page transition
              window.location.href = '/page/library';
            }, 1000);
          }
        } catch (err) {
          console.error("Profile update exception:", err);
          toast.error("Error updating profile. Please try again.");
          setIsCompleteInProgress(false);
          
          // Reset button state
          if (completeButton) {
            completeButton.textContent = "Complete";
            completeButton.removeAttribute("disabled");
          }
          return;
        }
      } catch (error) {
        console.error("Onboarding completion error:", error);
        toast.error("An error occurred. Please try again.");
        setIsCompleteInProgress(false);
        
        // Reset button state
        const completeButton = document.querySelector("[data-complete-button='true']");
        if (completeButton) {
          completeButton.textContent = "Complete";
          completeButton.removeAttribute("disabled");
        }
      }
    }
  }

  // Helper function to process avatar upload separately
  const processAvatarUpload = async (userId: string, avatar?: File): Promise<string | null> => {
    if (!avatar) return null;
    
    try {
      console.log("Processing avatar upload:", avatar.name, avatar.size);
      
      // Add file size check to avoid uploading very large files
      if (avatar.size > 5 * 1024 * 1024) {
        console.error("Avatar file too large:", avatar.size);
        toast.error("Avatar file too large (max 5MB). Using default avatar instead.");
        return null;
      }
      
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      console.log("Uploading avatar to path:", filePath);
      
      // Upload with proper error handling
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        return null;
      }
      
      console.log("Avatar uploaded successfully, getting public URL");
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (!data) {
        console.error("Failed to get public URL for avatar");
        return null;
      }
      
      const avatarUrl = data.publicUrl;
      console.log("Avatar URL generated:", avatarUrl);
      
      return avatarUrl;
    } catch (err) {
      console.error("Avatar processing error:", err);
      return null;
    }
  };

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

  const handleSkip = async () => {
    if (step === 2) {
      setPreviousProgress(progress)
      setStep(3)
      setProgress(75)
    } else if (step === 4 && user) {
      try {
        // Show loading toast
        toast.loading("Finalizing setup...");
        
        // Try to update profile but don't block on errors
        try {
          const { error: skipError } = await supabase
            .from('user_profiles')
            .update({ 
              has_completed_onboarding: true 
            })
            .eq('user_id', user.id);
            
          if (skipError) {
            console.error("Error updating profile on skip:", skipError);
          }
        } catch (err) {
          console.error("Error on skip (non-blocking):", err);
        }

        toast.success("Onboarding complete!");

        // Force immediate navigation without setTimeout
        try {
          router.push('/page/library');
        } catch (error) {
          console.error("Router navigation failed, using window.location as fallback", error);
          // Fallback to window.location if router fails
          window.location.href = '/page/library';
        }
      } catch (error) {
        toast.error("An error occurred. Navigating anyway...");
        
        // Force immediate navigation even on error
        try {
          router.push('/page/library');
        } catch (redirectError) {
          console.error("Router navigation failed, using window.location as fallback", redirectError);
          // Fallback to window.location if router fails
          window.location.href = '/page/library';
        }
      }
    }
  }

  const isButtonDisabled = () => {
    switch (step) {
      case 1: return !selectedLanguage;
      case 2: return selectedGenres.length < 3;
      case 3: return !selectedGender;
      case 4: return false; // Always enable the button in step 4
      default: return false;
    }
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
            {/* Only show Skip button on step 2, not on step 4 */}
            {step === 2 && (
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
              data-complete-button={step === 4 ? "true" : "false"}
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