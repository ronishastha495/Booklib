import React from "react";

const QuickActionButton = ({ icon, text, color }) => {
  return (
    <button className="flex flex-col items-center p-4 bg-white border border-stone-200 rounded-lg hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${color} text-white mb-3`}>
        {icon}
      </div>
      <span className="text-stone-700 font-medium text-sm text-center">{text}</span>
    </button>
  );
};

export default QuickActionButton;