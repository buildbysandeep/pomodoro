"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 280,
  stroke = 12,
  color = "hsl(var(--primary))",
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring__circle drop-shadow-sm"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
