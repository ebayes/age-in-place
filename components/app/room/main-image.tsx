import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import HoverCard from './hover-card';
import { MainImageDisplayProps } from '@/types/types';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAnnotationIndex, setHoveredAnnotationIndex] = useState<number | null>(null);

  const getScaledPositions = () => {
    if (!annotations || !annotations.frameWidth || !annotations.frameHeight)
      return [];

    const { frameWidth, frameHeight, boundingBoxes, modifications } = annotations;

    const positions: {
      left: number;
      top: number;
      productId: string;
      modificationText: string;
      location: string;
      bboxes: [number, number, number, number][];
    }[] = [];

    useEffect(() => {
      if (hoveredProductId) {
        const index = positions.findIndex((pos) => pos.productId === hoveredProductId);
        if (index !== -1) {
          setHoveredAnnotationIndex(index);
        } else {
          setHoveredAnnotationIndex(null);
        }
      } else {
        setHoveredAnnotationIndex(null);
      }
    }, [hoveredProductId, positions]);

    boundingBoxes.forEach((box) => {
      const modification = modifications.find(
        (mod) =>
          mod.location.trim().toLowerCase() === box.phrase.trim().toLowerCase()
      );

      if (!modification) return; 

      const productId = modification.product_id || '';
      const modificationText = modification.modification || '';
      const location = modification.location || '';

      const bboxArray = box.bboxes; 

      const [x, y, width, height] = bboxArray[0];

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      const left = (centerX / frameWidth) * 100;
      const top = (centerY / frameHeight) * 100;

      positions.push({ left, top, productId, modificationText, location, bboxes: bboxArray });
    });

    return positions;
  };

  const positions = getScaledPositions();

  return (
    <div className="h-full w-full p-4 relative" ref={containerRef}>
      <AspectRatio ratio={maxWidth / maxHeight} className="w-full h-full">
        {/* Main Image */}
        <Image
          src={imageSrc}
          alt="Main Image"
          layout="fill"
          objectFit="contain"
          className={`rounded-[8px] transition-opacity duration-300 ${
            mainImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          priority
          quality={85}
          style={{ zIndex: 0 }} 
          onLoadingComplete={() => setMainImageLoading(false)}
          onError={(e) => {
            console.error(`Failed to load image: ${imageSrc}`);
            // @ts-ignore
            e.target.src = fallbackImageUrl;
            setMainImageLoading(false);
          }}
        />

        {/* Annotations with Hover Cards */}
        {positions.map((pos, index) => {
          const isHovered = hoveredAnnotationIndex === index;

          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                zIndex: 2,
              }}
              onMouseEnter={() => {
                onAnnotationHover?.(pos.productId);
                setHoveredAnnotationIndex(index);
              }}
              onMouseLeave={() => {
                onAnnotationHover?.(null);
                setHoveredAnnotationIndex(null);
              }}
            >
              {/* Dot */}
              <div
                className={`absolute bg-purple-500 rounded-full transition-all duration-300 ${
                  isHovered
                    ? 'animate-none ring-2 ring-purple-500 scale-110'
                    : 'animate-pulse'
                }`}
                style={{
                  width: '16px',
                  height: '16px',
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center center',
                  zIndex: 3,
                }}
              />

              {/* HoverCard Component */}
              {isHovered && (
                <HoverCard
                  left="calc(100% + 10px)" // Positions to the right of the dot
                  top="50%" // Vertically centers with the dot
                  productId={pos.productId}
                  modificationText={pos.modificationText}
                  location={pos.location}
                />
              )}
            </div>
          );
        })}
      </AspectRatio>
    </div>
  );
};