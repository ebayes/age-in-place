   import React from 'react';
   import { Button } from '@/components/ui/button';
   import { Delete } from '@/components/icons';
   import { formatRoomName } from '@/utils/utils';
   import { HeaderProps } from '@/types/types';
   import { SignedIn } from '@clerk/nextjs';

   export const Header: React.FC<HeaderProps> = ({
     currentRoomName,
     loading,
     image,
     handleSubmit,
     onDeleteClick,
   }) => {
     return (
       <div className="flex-shrink-0 flex items-center justify-between h-[48px] bg-gray-50 border-b px-[12px]">
         <p className="text-[14px] font-medium">
           {formatRoomName(currentRoomName)}
         </p>
         <div className="flex gap-2">
           {/* 
           <Button onClick={handleSubmit} disabled={!image || loading}>
             {loading ? 'Analyzing...' : 'Analyze Image'}
           </Button>
           */}
           <SignedIn>
             <Button variant="secondary" size="sm" onClick={onDeleteClick}>
               <Delete size="xs" className="text-red-500 mr-1" />
               Delete room
             </Button>
           </SignedIn>
         </div>
       </div>
     );
   };