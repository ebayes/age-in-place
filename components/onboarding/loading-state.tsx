"use client";

import { useState, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { Star } from '../icons';

interface LoadingItem {
  label: string;
  stars: number;
  budget?: string;
}

interface LoadingStateProps {
  onComplete: () => void;
  answers: {
    overallHealth?: string;
    mobilityIndoors?: string;
    bathingAssistance?: string;
    householdAssistance?: string[];
    medicationAssistance?: string;
    budget?: number[];
    safetyDevices?: string[];
    recentFalls?: string;
    mobilityDevices?: string[];
  };
  stage: 'generating' | 'saving' | 'complete';
}

export function LoadingState({ onComplete, answers, stage }: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState<LoadingItem[]>([]);

  useEffect(() => {
    const analyzeAnswers = () => {
      const items: LoadingItem[] = [];

      const mobilityStars = (() => {
        if (answers.mobilityIndoors === 'With difficulty') return 5;
        if (answers.mobilityIndoors === 'With support') return 4;
        if (answers.mobilityDevices?.length) return 3;
        if (answers.mobilityIndoors === 'Independently') return 2;
        return 3;
      })();
      items.push({
        label: "Evaluating mobility assistance needs...",
        stars: mobilityStars,
      });

      const safetyStars = (() => {
        const hasBasicSafety =
          answers.safetyDevices?.includes('Smoke detectors') &&
          answers.safetyDevices?.includes('Carbon monoxide detectors');
        const hasMedicalAlert = answers.safetyDevices?.includes('Medical alert system');
        const hasFallHistory = answers.recentFalls === 'Yes';

        if (hasFallHistory && !hasMedicalAlert) return 5;
        if (hasFallHistory && hasMedicalAlert) return 4;
        if (!hasBasicSafety) return 4;
        if (!hasMedicalAlert) return 3;
        return 2;
      })();
      items.push({
        label: "Assessing safety requirements...",
        stars: safetyStars,
      });

      const careStars = (() => {
        const needsBathing = answers.bathingAssistance === 'Yes';
        const needsMedication = answers.medicationAssistance === 'Yes';
        const householdTasks = answers.householdAssistance?.length || 0;

        if (needsBathing && needsMedication && householdTasks >= 3) return 5;
        if ((needsBathing || needsMedication) && householdTasks >= 2) return 4;
        if (needsBathing || needsMedication) return 3;
        if (householdTasks >= 1) return 2;
        return 1;
      })();
      items.push({
        label: "Evaluating care requirements...",
        stars: careStars,
      });

      const healthStars = {
        Poor: 5,
        Fair: 4,
        Good: 3,
        Excellent: 2,
      }[answers.overallHealth || 'Good'];
      items.push({
        label: "Analyzing overall care needs...",
        stars: healthStars || 3,
      });

      if (answers.budget && Array.isArray(answers.budget)) {
        const [budgetMin, budgetMax] = answers.budget;
        const budgetStars = budgetMax >= 8000 ? 5 : budgetMax >= 5000 ? 4 : budgetMax >= 3000 ? 3 : 2;
        items.push({
          label: "Calculating budget flexibility...",
          stars: budgetStars,
        });
      }

      return items;
    };

    const items = analyzeAnswers();
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      const maxProgress = stage === 'generating' ? 50 : stage === 'saving' ? 90 : 100;

      if (currentProgress < maxProgress) {
        currentProgress += 1;
        setProgress(currentProgress);

        if (stage === 'generating') {
          const itemIndex = Math.floor((currentProgress / 50) * Math.min(items.length, 5));
          if (itemIndex < items.length && itemIndex > visibleItems.length - 1) {
            setVisibleItems((prev) => [...prev, items[itemIndex]]);
          }
        }
      }

      if (stage === 'complete' && currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(onComplete, 1000);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [answers, onComplete, stage, visibleItems.length]);

  const getStatusText = () => {
    switch (stage) {
      case 'generating':
        return 'Analyzing data and generating your report...';
      case 'saving':
        return 'Saving your report...';
      case 'complete':
        return 'Report ready! Redirecting...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto px-4">
      <div className="w-16 h-16 mb-8">
        <div className="w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>

      <h2 className="text-2xl font-semibold mb-8 text-center">{getStatusText()}</h2>

      <Progress value={progress} className="w-full h-2 mb-8" />

      {stage === 'generating' && (
        <div className="w-full space-y-4">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-100 shadow-sm animate-fadeIn"
              style={{
                animationDelay: `${index * 500}ms`,
                opacity: 0,
                animation: 'fadeIn 1s ease-out forwards',
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-gray-700">{item.label}</span>
                <span className="inline-flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size="sm" className={i < item.stars ? '' : 'opacity-30'} />
                  ))}
                </span>
              </div>
              {item.budget && (
                <div className="text-sm text-gray-500 mt-1">Budget Range: {item.budget}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}