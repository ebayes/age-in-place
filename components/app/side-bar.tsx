'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { getIcon, formatRoomName } from '@/utils/utils';
import NewRoom from '@/components/app/room/new-room-modal';
import { useAssessmentsContext } from '@/contexts/assessments';
import { useUser } from '@clerk/nextjs'; 
import { CookingPot } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboard';
import {
  HoverCard as OnboardingHoverCard,
  HoverCardContent as OnboardingHoverCardContent,
  HoverCardTrigger as OnboardingHoverCardTrigger,
} from "@/components/ui/onboarding-hover";

function SideNavbar() {
  const { assessments, loading } = useAssessmentsContext();
  const { user, isLoaded } = useUser();
  const currentPath = usePathname();
  const currentRoom = currentPath.split('/').pop();
  const { onboardingStep, setOnboardingStep, shouldShowOnboarding } = useOnboarding();

return (
    <nav className="h-full w-[52px] border-r bg-background flex flex-col items-center py-[16px] px-[12px]">
      <div className="flex flex-col items-center gap-[12px]">
      {isLoaded && ( // Only render once user state is loaded
        <OnboardingHoverCard 
          open={shouldShowOnboarding && onboardingStep === 1 && !user}
          onOpenChange={() => {}}
        >
          <OnboardingHoverCardTrigger asChild>
            <div>
              <NewRoom />
            </div>
          </OnboardingHoverCardTrigger>
          <OnboardingHoverCardContent side="right" align="center">
            <div className="max-w-xs text-center">
              <p className="font-medium text-[13px]">
                Click here to add a new room
                <br />
                to your assessment
              </p>
              <div className="mt-2 w-full flex justify-between items-center">
                <p className="text-[12px] text-gray-500">1/5</p>
                <Button 
                  size="sm" 
                  onClick={() => setOnboardingStep && setOnboardingStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>
          </OnboardingHoverCardContent>
        </OnboardingHoverCard>
        )}

        {user ? (
          <>
            {loading ? (
              <div />
            ) : (
              assessments.map((assessment) => {
                const isActive = currentRoom === assessment.id.toString();
                const Icon = getIcon(assessment.room_name);

                return (
                  <TooltipProvider key={assessment.id}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link href={`/app/${assessment.id}`}>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="square"
                          >
                            <Icon className="text-gray-700 w-5 h-5" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        <p>{formatRoomName(assessment.room_name)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })
            )}
          </>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/app/0">
                  <Button
                    variant={currentRoom === '0' ? 'secondary' : 'ghost'}
                    size="square"
                  >
                    <CookingPot className="text-gray-700 w-5 h-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Kitchen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </nav>
  );
}

export default SideNavbar;