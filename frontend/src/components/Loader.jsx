// InlineLoader.jsx
import React from "react";

export default function Loader({text="Loading..."}) {
  return (
    <div className="p-4 min-h-screen">
        <div className="flex flex-col items-center justify-center py-6">
      {/* Spinner */}
      <div className="h-12 w-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      
      {/* Optional text */}
      <p className="text-gray-700 mt-2 text-sm font-medium">{text}</p>
    </div>
    </div>
  );
}
