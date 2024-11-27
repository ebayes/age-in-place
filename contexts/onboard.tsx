"use client"

import { createContext, useContext, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface OnboardingContextType {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  shouldShowOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const { isSignedIn } = useUser();

  // Only show onboarding when user is not signed in
  const shouldShowOnboarding = !isSignedIn;

  return (
    <OnboardingContext.Provider value={{ onboardingStep, setOnboardingStep, shouldShowOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}