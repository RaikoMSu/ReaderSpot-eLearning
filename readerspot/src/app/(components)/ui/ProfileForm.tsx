'use client'

import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { User } from 'lucide-react';

interface ProfileFormProps {
  onProfileUpdate: (profileData: {
    name: string;
    bio: string;
    avatar?: File;
  }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdate }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setAvatarPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onProfileUpdate({
      name,
      bio,
      ...(avatarFile && { avatar: avatarFile })
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-amber-500">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar preview" />
            ) : (
              <AvatarFallback className="bg-black text-white">
                <User className="w-12 h-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 bg-amber-500 text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sr-only">Upload avatar</span>
          </label>
          
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        
        <p className="text-muted-foreground text-sm">Upload a profile picture</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Your name</Label>
        <Input 
          id="name"
          type="text" 
          placeholder="Enter your name" 
          className="border-2 border-foreground/20 bg-background/20 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-foreground">Your bio</Label>
        <Textarea 
          id="bio"
          placeholder="Tell us about yourself..." 
          className="border-2 border-foreground/20 bg-background/20 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500 min-h-[120px]"
          value={bio}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
        />
      </div>
    </motion.div>
  );
};

export default ProfileForm;