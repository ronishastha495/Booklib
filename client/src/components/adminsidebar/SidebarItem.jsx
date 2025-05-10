import React from 'react';

const SidebarItem = ({ icon, text, active, onClick, collapsed }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center p-3 mb-1 rounded-lg transition-colors ${
          active ? 'bg-amber-500 text-white' : 'text-stone-300 hover:bg-stone-700'
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && <span className="ml-3">{text}</span>}
      </button>
    );
  };
  
  export default SidebarItem;