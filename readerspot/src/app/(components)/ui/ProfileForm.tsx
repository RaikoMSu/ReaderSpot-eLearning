'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Label } from "@/app/(components)/ui/label";
import { Input } from "@/app/(components)/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/(components)/ui/avatar";
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select";

interface ProfileFormProps {
  onProfileUpdate: (data: {
    dateOfBirth: string;
    country: string;
    avatar?: File;
  }) => void;
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Japan", "China", "India", "Brazil",
  "Mexico", "South Korea", "Russia", "Philippines", "Nigeria", "South Africa"
];

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdate }) => {
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call onProfileUpdate with new data
      onProfileUpdate({
        dateOfBirth,
        country,
        avatar: file
      });
    }
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDateOfBirth(newValue);
    
    // Call onProfileUpdate with new data
    onProfileUpdate({
      dateOfBirth: newValue,
      country,
      ...(avatar && { avatar })
    });
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    
    // Call onProfileUpdate with new data
    onProfileUpdate({
      dateOfBirth,
      country: value,
      ...(avatar && { avatar })
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary/20">
            <AvatarImage src={previewUrl} alt="Profile avatar" />
            <AvatarFallback className="bg-muted text-xl" aria-label="Default profile avatar">
              ?
            </AvatarFallback>
          </Avatar>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md text-white hover:bg-primary/80 transition-colors"
            aria-label="Upload avatar"
          >
            +
            <input 
              id="avatar-upload"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              aria-label="Upload profile picture"
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground">Upload a profile picture (optional)</p>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
            className="mt-1"
            aria-required="false"
            aria-describedby="dateOfBirthHint"
          />
          <p id="dateOfBirthHint" className="text-xs text-muted-foreground mt-1">This information is used for age-appropriate content</p>
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger id="country" className="mt-1" aria-required="false" aria-describedby="countryHint">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p id="countryHint" className="text-xs text-muted-foreground mt-1">Used for regional content recommendations</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileForm;