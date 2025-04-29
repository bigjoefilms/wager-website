"use client";

import "@/app/styles/style.css";

export const wheelNumbers = [
  { label: "0", color: "#db7003", multiplier: 0 },
  { label: "1x", color: "#20b2aa", multiplier: 1 },
  { label: "2x", color: "#db63e9", multiplier: 2 },
  { label: "4x", color: "#daa520", multiplier: 4 },
  { label: "5x", color: "#ff340f", multiplier: 5 },
  { label: "10x", color: "#ff7f50", multiplier: 10 },
  { label: "3x", color: "#3cb371", multiplier: 3 },
  { label: "1x", color: "#4169e1", multiplier: 1 },
];

interface SpinWheelProps {
  rotation: number;
  isSpinning: boolean;
}

const SpinWheel = ({ rotation }: SpinWheelProps) => {
  return (
    <div className="container " style={{ width: "250px", height: "250px" }}>
      <div className="spinBtn">Spin</div>
      <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
        {wheelNumbers.map((item, index) => (
          <div
            key={index}
            className="number"
            style={{ "--clr": item.color, "--i": index } as React.CSSProperties}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;
