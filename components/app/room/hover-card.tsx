import React from 'react';

type HoverCardProps = {
  left: string;
  top: string;
  productId: string;
  modificationText: string;
  location: string;
};

const HoverCard: React.FC<HoverCardProps> = ({
  left,
  top,
  productId,
  modificationText,
  location,
}) => {
  return (
    <div
      className="absolute bg-white p-2 rounded shadow-md w-[300px]"
      style={{
        left: left,
        top: top,
        transform: 'translateY(-50%)',
        pointerEvents: 'none', 
        zIndex: 4,
      }}
    >
      <p className="text-sm text-gray-700">
        <strong>Location:</strong> {location}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Recommended modification:</strong> {modificationText}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Recommended product:</strong> {productId}
      </p>
    </div>
  );
};

export default HoverCard;