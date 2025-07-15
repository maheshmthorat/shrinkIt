import React from "react";

const Shimmer = () => {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default Shimmer;
