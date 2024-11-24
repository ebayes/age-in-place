   import React from 'react';
   import { Button } from '@/components/ui/button';
   import { Delete } from '@/components/icons';
   import { formatRoomName } from '@/utils/utils';
   import { HeaderProps } from '@/types/types';

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
           <Button variant="destructive" size="square" onClick={onDeleteClick}>
             <Delete size="sm" />
           </Button>
         </div>
       </div>
     );
   };