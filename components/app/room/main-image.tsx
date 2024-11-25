import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import PulseDot from 'react-pulse-dot';
import 'react-pulse-dot/dist/index.css';
import { MainImageDisplayProps } from '@/types/types';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ShoppingCart } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

export const MainImageDisplay: React.FC<MainImageDisplayProps> = ({
  imageSrc,
  mainImageLoading,
  setMainImageLoading,
  fallbackImageUrl,
  maxWidth,
  maxHeight,
  annotations,
  onAnnotationHover,
  hoveredProductId,
}) => {
  const [hoveredAnnotationIndex, setHoveredAnnotationIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        const imageAspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let displayedImageWidth = containerWidth;
        let displayedImageHeight = containerHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imageAspectRatio > containerAspectRatio) {
          // Image is wider than container
          displayedImageWidth = containerWidth;
          displayedImageHeight = containerWidth / imageAspectRatio;
          offsetY = (containerHeight - displayedImageHeight) / 2;
        } else {
          // Image is taller than container
          displayedImageHeight = containerHeight;
          displayedImageWidth = containerHeight * imageAspectRatio;
          offsetX = (containerWidth - displayedImageWidth) / 2;
        }

        setImageDimensions({
          width: displayedImageWidth,
          height: displayedImageHeight,
          offsetX,
          offsetY,
        });
      }
    };

    window.addEventListener('resize', updateImageDimensions);
    updateImageDimensions();

    return () => {
      window.removeEventListener('resize', updateImageDimensions);
    };
  }, [imageLoaded]);

  const positions = useMemo(() => {
    if (
      !annotations ||
      !annotations.frameWidth ||
      !annotations.frameHeight ||
      !imageLoaded ||
      !imageDimensions
    )
      return [];

    const { frameWidth, frameHeight, boundingBoxes, modifications } = annotations;

    const scaleX = imageDimensions.width / frameWidth;
    const scaleY = imageDimensions.height / frameHeight;

    return boundingBoxes
      .map((box) => {
        const modification = modifications.find(
          (mod) => mod.location.trim().toLowerCase() === box.phrase.trim().toLowerCase()
        );

        if (!modification) return;

        const [x, y, width, height] = box.bboxes[0];

        // Calculate actual positions in pixels
        const centerX = x * scaleX + (width * scaleX) / 2 + imageDimensions.offsetX;
        const centerY = y * scaleY + (height * scaleY) / 2 + imageDimensions.offsetY;

        // Convert to percentages relative to the container
        const left = (centerX / containerRef.current!.clientWidth) * 100;
        const top = (centerY / containerRef.current!.clientHeight) * 100;

        // Calculate bounding box positions in percentages
        const boxLeft = ((x * scaleX + imageDimensions.offsetX) / containerRef.current!.clientWidth) * 100;
        const boxTop = ((y * scaleY + imageDimensions.offsetY) / containerRef.current!.clientHeight) * 100;
        const boxWidth = ((width * scaleX) / containerRef.current!.clientWidth) * 100;
        const boxHeight = ((height * scaleY) / containerRef.current!.clientHeight) * 100;

        return {
          left,
          top,
          productId: modification.product_id || '',
          modificationText: modification.modification || '',
          location: modification.location || '',
          boxLeft,
          boxTop,
          boxWidth,
          boxHeight,
        };
      })
      .filter(Boolean);
  }, [annotations, imageLoaded, imageDimensions]);

  useEffect(() => {
    if (hoveredProductId) {
      const index = positions.findIndex((pos) => pos?.productId === hoveredProductId);
      if (index !== -1) {
        setHoveredAnnotationIndex(index);
      } else {
        setHoveredAnnotationIndex(null);
      }
    } else {
      setHoveredAnnotationIndex(null);
    }
  }, [hoveredProductId, positions]);

  return (
    <div className="h-full w-full relative">
      <AspectRatio ratio={maxWidth / maxHeight} className="w-full h-full">
        <div ref={containerRef} className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                ref={imageRef}
                src={imageSrc}
                alt="Main Image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'contain' }}
                className={`rounded-[8px] transition-opacity duration-300 ${
                  mainImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                priority
                quality={85}
                onLoadingComplete={() => {
                  setMainImageLoading(false);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImageUrl;
                  setMainImageLoading(false);
                }}
              />

              {/* Render the dots and bounding boxes */}
              {positions.map((pos, index) => {
                const isHovered = hoveredAnnotationIndex === index;
                return (
                  <React.Fragment key={index}>
                    {/* Dot */}
                    <div
                      className="absolute"
                      style={{
                        left: `${clamp(pos?.left || 0, 0, 100)}%`,
                        top: `${clamp(pos?.top || 0, 0, 100)}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                      }}
                    >
                      <HoverCard
                        open={isHovered}
                        onOpenChange={(open) => {
                          if (open) {
                            onAnnotationHover?.(pos?.productId || '');
                            setHoveredAnnotationIndex(index);
                          } else {
                            onAnnotationHover?.(null);
                            setHoveredAnnotationIndex(null);
                          }
                        }}
                      >
                        <HoverCardTrigger asChild>
                          <div>
                            <PulseDot 
                              color="#8B5CF6"
                              size={16}
                              pulseSize={isHovered ? 0 : 24}
                              style={{
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 300ms',
                              }}
                            />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          {/* 
        <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">
              {`${pos?.modificationText.charAt(0).toUpperCase()}${pos?.modificationText.slice(1)}`}
              </h4>
            
            <p className="text-sm text-gray-600">
            <span className="font-semibold">Location:</span> {pos?.location}
            </p>
            
            <div className="flex items-center pt-2">
              <ShoppingCart className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
              {`${pos?.productId.charAt(0).toUpperCase()}${pos?.productId.slice(1)}`}
              </span>
            </div>
          </div>
        </div>
        </HoverCardContent>
                      </HoverCard>
                    </div>

                    {/* Bounding Box */}
                    {isHovered && (
                      <div
                        className="absolute rounded-lg" // Added rounded-lg class
                        style={{
                          left: `${clamp(pos?.boxLeft || 0, 0, 100)}%`,
                          top: `${clamp(pos?.boxTop || 0, 0, 100)}%`,
                          width: `${pos?.boxWidth || 0}%`,
                          height: `${pos?.boxHeight || 0}%`,
                          border: '2px solid rgba(139, 92, 246, 0.8)',
                          backgroundColor: 'rgba(139, 92, 246, 0.3)',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};