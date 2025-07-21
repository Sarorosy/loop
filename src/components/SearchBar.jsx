// components/SearchBar.jsx
import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="max-w-sm">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
      />
    </div>
  );
};

export default SearchBar;
