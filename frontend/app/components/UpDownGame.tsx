import Image from "next/image";
import { useState } from "react";

export default function UpDownGame() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<"UP" | "DOWN" | "MIDDLE" | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Randomly determine the result: 0 = UP, 1 = DOWN, 2 = MIDDLE (rare)
    const rand = Math.random();
    let outcome: "UP" | "DOWN" | "MIDDLE";
    let angle: number;

    if (rand < 0.48) {
      outcome = "UP";
      angle = Math.random() * 160 - 80; // -80deg to +80deg
    } else if (rand < 0.96) {
      outcome = "DOWN";
      angle = 180 + (Math.random() * 160 - 80); // 100deg to 260deg
    } else {
      outcome = "MIDDLE";
      angle = 90 + Math.random() * 20 - 10; // 80deg to 100deg (middle line)
    }

    // Add multiple spins for effect
    const totalRotation = 5 * 360 + angle;

    setRotation((prev) => prev + totalRotation);

    setTimeout(() => {
      setResult(outcome);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="max-w-[400px] mx-auto bg-white rounded-2xl p-8 flex flex-col items-center">
      <h2 className="font-bold text-2xl mb-2 text-center">Up & Down</h2>
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* The board */}
        <div className="absolute w-full h-full rounded-full border-4 border-brown-700 overflow-hidden">
          <div className="absolute w-full h-1/2 bg-green-500 top-0 left-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold opacity-60">UP</span>
          </div>
          <div className="absolute w-full h-1/2 bg-orange-400 bottom-0 left-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold opacity-60">DOWN</span>
          </div>
        </div>
        {/* The bottle */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 3s cubic-bezier(.17,.67,.83,.67)" : "none",
            width: "80px",
            height: "200px",
            zIndex: 2,
          }}
        >
          <Image src="/spin.png" alt="bottle" width={80} height={200} />
        </div>
        {/* Center line */}
        <div className="absolute left-1/2 top-0 h-full w-1 bg-white opacity-70" style={{transform: "translateX(-50%)"}} />
      </div>
      <button
        className="mt-8 bg-[#F56CA0] text-white font-bold px-8 py-2 rounded disabled:opacity-50"
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? "Spinning..." : "Spin Bottle"}
      </button>
      {result && (
        <div className="mt-4 text-xl font-bold">
          {result === "UP" && <span className="text-green-600">UP! 🎉</span>}
          {result === "DOWN" && <span className="text-orange-600">DOWN! 🎉</span>}
          {result === "MIDDLE" && <span className="text-gray-600">MIDDLE! 😬</span>}
        </div>
      )}
    </div>
  );
}