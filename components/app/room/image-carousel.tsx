import React, { useRef } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Plus, Delete } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ImageCarouselProps } from '@/types/types';
import { toBase64, shimmer } from '@/utils/shimmer';
import { useClerk } from '@clerk/nextjs'; 
import { HoverCard, HoverCard as OnboardingHoverCard, HoverCardContent as OnboardingHoverCardContent, HoverCardTrigger as OnboardingHoverCardTrigger } from "@/components/ui/onboarding-hover"
import { useOnboarding } from '@/contexts/onboard';
export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  allImages,
  selectedImageIndex,
  setSelectedImageIndex,
  handleImageUpload,
  handleDeleteImage,
  isSignedIn,
  fallbackImageUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openSignIn } = useClerk();
  const { onboardingStep, setOnboardingStep, shouldShowOnboarding } = useOnboarding();

  const handleAddNewClick = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    // Use the ref instead of getElementById
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-shrink-0 flex flex-col gap-2 p-[12px] bg-gray-50">
      <div
        className="overflow-x-auto"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '160px',
          gap: '12px',
          overflowX: 'auto',
          padding: '4px',
          scrollSnapType: 'x mandatory',
        }}
      >

<input
  id="image-upload" 
  type="file"
  ref={fileInputRef}
  accept="image/*"
  onChange={handleImageUpload}
  className="hidden"
/>

<OnboardingHoverCard 
  open={shouldShowOnboarding && onboardingStep === 2}
  onOpenChange={() => {}}>
          <OnboardingHoverCardTrigger asChild>

        {/* Add New Image Button */}
        <div
        className="flex-shrink-0"
        style={{ scrollSnapAlign: 'start' }}
        onClick={handleAddNewClick}
      >
        <AspectRatio ratio={16 / 9}>
          <div className="h-full w-full rounded-[6px] border border-dashed border-gray-200 flex items-center justify-center flex-col gap-1 bg-background cursor-pointer hover:bg-gray-50 transition-colors">
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Add new</span>
          </div>
        </AspectRatio>
      </div>
      </OnboardingHoverCardTrigger>
          <OnboardingHoverCardContent side="top" align="center">
            <div className="max-w-xs text-center">
              <p className="font-medium text-[13px]">
                Upload an image of your
                <br />
                room by clicking &quot;add new&quot;
              </p>
              <div className="mt-2 w-full flex justify-between items-center">
                <p className="text-[12px] text-gray-500">2/5</p>
                <Button 
                  size="sm" 
                  onClick={() => setOnboardingStep && setOnboardingStep(3)}
                >
                  Next
                </Button>
              </div>
            </div>
          </OnboardingHoverCardContent>
        </OnboardingHoverCard>

        {/* Thumbnails */}
        {allImages.map((imgSrc, index) => (
          <div
            key={index}
            className="flex-shrink-0 cursor-pointer relative group"
            style={{ scrollSnapAlign: 'start' }}
            onClick={() => setSelectedImageIndex(index)}
          >
            {isSignedIn && (
              <Button
                variant="destructive"
                size="squaresm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(index);
                }}
              >
                <Delete size="sm" />
              </Button>
            )}
            <AspectRatio
              ratio={16 / 9}
              className={`rounded-[6px] overflow-hidden ${
                selectedImageIndex === index
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-white'
                  : ''
              }`}
            >
              <Image
                src={imgSrc}
                alt={`Thumbnail ${index}`}
                fill
                className="object-cover transition-opacity opacity-80 hover:opacity-100"
                sizes="160px"
                quality={60}
                loading="lazy"
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(160, 90))}`}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  //  console.error(`Failed to load thumbnail: ${imgSrc}`);
                  // @ts-ignore
                  e.target.src = fallbackImageUrl;
                }}
              />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
};