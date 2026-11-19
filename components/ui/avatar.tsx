import * as React from "react";

export function Avatar({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`cfa-avatar ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AvatarFallback({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`cfa-avatar-fallback ${className}`} {...props}>
      {children}
    </span>
  );
}
