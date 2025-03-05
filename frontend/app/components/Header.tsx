"use client"
import { useState } from "react";

const Header = () => {
  const [sonicBalance, setSonicBalance] = useState(100); // Example balance

  return (
    <header className="flex items-center justify-between p-4  text-black w-screen">
      {/* Left: Avatar */}
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/150" // Replace with user avatar URL
          alt="User Avatar"
          className="w-14 h-14 rounded-full border-2 border-yellow-500"
        />
        <div className="text-lg font-medium flex flex-col text-[14px]">
            <span className="text-[16px]"> Welcome </span> B3nB6YzJ
            </div>
      </div>

      {/* Right: Sonic Balance & Deposit */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
          {/* <img
            src="/sonic-logo.png" // Replace with actual Sonic token logo
            alt="Sonic"
            className="w-5 h-5"
          /> */}
          <span className="text-yellow-400 font-semibold">{sonicBalance} SONIC</span>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">
          Deposit
        </button>
      </div>
    </header>
  );
};

export default Header;
