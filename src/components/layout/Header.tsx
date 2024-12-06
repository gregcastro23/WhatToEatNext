// src/components/layout/Header.tsx
"use client";

import React, { useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  Users, 
  ChefHat, 
  Sparkles,
  Clock,
  CalendarDays 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  setNumberOfPeople: (num: number) => void;
  astroData: {
    sun: string;
    moon: string;
    ascendant?: string;
    phase?: string;
  };
}

export default function Header({ setNumberOfPeople, astroData }: HeaderProps) {
  const { state } = useAlchemical();
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour >= 18;

  const getCurrentTimeOfDay = () => {
    if (currentHour < 12) return "Morning";
    if (currentHour < 17) return "Afternoon";
    if (currentHour < 21) return "Evening";
    return "Night";
  };

  const handlePeopleUpdate = (value: number) => {
    setPeopleCount(value);
    setNumberOfPeople(value);
  };

  return (
    <div className="relative">
      <header className="border-b bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 space-y-4 md:space-y-0">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <ChefHat className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">What To Eat Next</h1>
                <div className="flex items-center text-sm space-x-2 opacity-90">
                  <Clock className="h-4 w-4" />
                  <span>Good {getCurrentTimeOfDay()}</span>
                </div>
              </div>
            </div>

            {/* Center Section - Astrological Info */}
            <div className="flex items-center space-x-6 bg-white/10 rounded-lg p-3">
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <span>{astroData.sun}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <span>{astroData.moon}</span>
                </div>
                {astroData.ascendant && (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{astroData.ascendant}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20">
                    <Users className="h-4 w-4 mr-2" />
                    {peopleCount} {peopleCount === 1 ? 'Person' : 'People'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adjust Serving Size</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4">
                    <p className="text-sm text-gray-500">
                      How many people are you cooking for?
                    </p>
                    <Input 
                      type="number" 
                      min="1"
                      value={peopleCount}
                      onChange={(e) => handlePeopleUpdate(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm">{state.season}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}