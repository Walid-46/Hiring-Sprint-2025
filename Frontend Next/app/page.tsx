"use client";

import { useRef, useState } from "react";

interface Props {
  before: string;
  after: string;
}

export default function ImageCompare({ before, after }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    let x = clientX - left;
    let percent = (x / width) * 100;

    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    setPosition(percent);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden shadow-lg border border-gray-300 bg-black"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* Before (Pick-up) */}
      <img
        src={before}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      {/* After (Return) */}
      <img
        src={after}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-xl cursor-ew-resize"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-white rounded-full shadow-md border flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded text-sm">
        Pick-up
      </div>
      <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded text-sm">
        Return
      </div>
    </div>
  );
}
