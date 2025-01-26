'use client';

import React from 'react';

export default function NoRooms() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <h1 className="text-xl font-semibold">No Rooms Found</h1>
      <p className="text-gray-600">You don&apos;t have any rooms yet.</p>
      <p className="text-gray-600">Click the + button in the top left to create a room.</p>
    </div>
  );
}