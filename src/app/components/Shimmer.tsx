import React from "react";

const Shimmer = () => {
  return (
    <div className="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4  ">
      <div className="flex items-center gap-4">
        <div className="shimmer w-20 h-20 bg-gray-200 rounded object-cover" />
        <div className="flex flex-col gap-2">
          <div className="shimmer h-4 w-60 bg-gray-200 rounded" />
          <div className="h-5 w-12 bg-blue-100 rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-700 w-full sm:w-auto">
        <div className="flex justify-between items-center gap-2">
          <div className="shimmer h-4 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-22 bg-blue-100 rounded" />
        </div>
        <div className="flex justify-between items-center gap-2">
          <div className="shimmer h-4 w-40 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-green-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
