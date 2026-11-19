import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
  height?: number | string;
}

export function Progress({
  value = 0,
  indicatorColor,
  height = 6,
  className = "",
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`cfa-progress-root ${className}`}
      style={{ height }}
      {...props}
    >
      <div
        className="cfa-progress-indicator"
        style={{
          width: `${percentage}%`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
        }}
      />
    </div>
  );
}
