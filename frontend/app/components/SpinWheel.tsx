"use client";

import "@/app/styles/style.css";

interface SpinWheelProps {
  rotation: number;
  isSpinning: boolean;
}

const SpinWheel = ({ rotation }: SpinWheelProps) => {
  return (
    <div className="container" style={{ width: "500px", height: "500px" }}>
        <div className="spinBtn" >
        Spin
      </div>
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

const wheelNumbers = [
  { label: "0", color: "#db7003" },
  { label: "1X", color: "#20b2aa" },
  { label: "2X", color: "#db63e9" },
  { label: "0X", color: "#daa520" },
  { label: "5X", color: "#ff340f" },
  { label: "10X", color: "#ff7f50" },
  { label: "0", color: "#3cb371" },
  { label: "1X", color: "#4169e1" },
];

export default SpinWheel;
