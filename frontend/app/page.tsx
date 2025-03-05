"use client";
import { useState } from "react";
import SpinWheel from "@/app/components/SpinWheel";

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const wheelNumbers = ["0", "1X", "2X", "0X", "5X", "10X", "0", "1X"]; 

  const handleSpin = () => {
    if (isSpinning || selectedBet === null) return; // Ensure a bet is selected

    setIsSpinning(true);
    const randomDegree = Math.floor(Math.random() * 3600) + 360; // Ensures multiple spins
    setRotation((prevRotation) => prevRotation + randomDegree);

    setTimeout(() => {
      const spinResult = getSpinResult(randomDegree); // Get the spin result
      const multiplier = parseMultiplier(spinResult); // Extract multiplier
      const winnings = selectedBet * multiplier; // Calculate winnings

      setResult(winnings);
      setShowModal(true);
      setIsSpinning(false);
    }, 5000); // Match animation duration
  };

  // Extracts the spin result based on rotation
  const getSpinResult = (angle: number) => {
    const sectionSize = 360 / wheelNumbers.length;
    const normalizedAngle = angle % 360; 
    const index = Math.floor(normalizedAngle / sectionSize);
    return wheelNumbers[index];
  };

  // Parses the multiplier from result
  const parseMultiplier = (label: string) => {
    const match = label.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  return (
    <main className="flex min-h-screen justify-center items-center">
      <div className="flex-1 flex justify-center items-center flex-col p-24">
        <div>
        <h1 className="text-[#ea4c89] font-bold text-[24px]">Wager Wise</h1>
        <h3 className="text-[54px] font-medium">Spin and Win</h3>
        <p className="text-[#6c6b6b] text-[18px]">
          Get a chance to win $SONIC rewards of up to $100! Try your luck now! 🎰✨
        </p>

        <div className="text-[#6c6b6b] text-[18px] pt-3">
          <h4>Just keep in mind:</h4>
          <ul>- You must have at least 0.01 SOL</ul>
          <ul>- Some $SONIC in your wallet to play</ul>
        </div>

        {/* Bet Selection */}
        <div className="flex mt-10">
          {[1, 5, 10, 100].map((bet) => (
            <button
              key={bet}
              onClick={() => setSelectedBet(bet)}
              className={`px-[35px] py-[15px] border-2 rounded-3xl text-[18px] font-bold mr-3 ${
                selectedBet === bet ? "bg-[#ea4c89] text-white" : "border-black"
              }`}
            >
              {bet} $Sonic
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <button
          className="px-[35px] py-[15px] rounded-3xl text-[18px] text-white font-bold bg-[#ea4c89] mt-10 w-full"
          onClick={handleSpin}
          disabled={isSpinning || selectedBet === null}
        >
          {isSpinning ? "Spinning..." : "Spin the wheel"}
        </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-24">
        <SpinWheel rotation={rotation} isSpinning={isSpinning} />
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold">🎉 Congratulations! 🎉</h2>
            <p className="text-lg mt-2">
              You just won <span className="text-[#ea4c89] font-bold">{result} $Sonic</span> tokens!
            </p>
            <button
              className="mt-4 px-6 py-2 bg-[#ea4c89] text-white rounded-lg"
              onClick={() => setShowModal(false)}
            >
              Spin Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
