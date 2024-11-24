// components/app/room/empty-state.tsx

import { ImageSquare, Plus } from '@/components/icons';
import { Button } from '@/components/ui/button';
import React, { useRef } from 'react';

interface EmptyStateProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ handleImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center min-w-0 w-full h-full">
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-10 w-10">
          <ImageSquare size="md" className="text-gray-700" />
        </div>
        <p className="text-gray-800 text-[16px]">No image selected</p>
        <p className="text-gray-400 text-[14px]">Select an image below to view it</p>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button size="sm" prefix={Plus} onClick={handleUploadClick}>
            Upload Image
          </Button>
        </div>
      </div>
    </div>
  );
};