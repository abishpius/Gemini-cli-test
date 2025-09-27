import React from 'react';

interface InboxIconProps {
  onClick: () => void;
  unreadCount: number;
}

const InboxIcon: React.FC<InboxIconProps> = ({ onClick, unreadCount }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 bg-gray-800/80 backdrop-blur-sm border-2 border-gold text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-300 z-40"
      aria-label="Open Messages Inbox"
      title="Open Messages Inbox"
    >
      <span className="text-3xl" role="img" aria-label="envelope emoji">✉️</span>
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-gray-900">
          {unreadCount}
        </div>
      )}
    </button>
  );
};

export default InboxIcon;
