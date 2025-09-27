import React from 'react';

interface MinimapIconProps {
  onClick: () => void;
}

const MinimapIcon: React.FC<MinimapIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gray-800/80 backdrop-blur-sm border-2 border-gold text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-300 z-40 animate-pulse-slow"
      aria-label="Open World Map"
      title="Open World Map"
    >
      <span className="text-3xl" role="img" aria-label="map emoji">🗺️</span>
    </button>
  );
};

export default MinimapIcon;
