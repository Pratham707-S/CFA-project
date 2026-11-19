"use client";

import * as React from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function DropdownMenu({ children, isOpen, onClose, className = "" }: DropdownMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className={`cfa-dropdown-menu ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  icon,
  children,
  onClick,
  className = "",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`cfa-dropdown-item ${className}`}
      onClick={onClick}
    >
      {icon && <span className="cfa-dropdown-item-icon">{icon}</span>}
      <span className="cfa-dropdown-item-text">{children}</span>
    </button>
  );
}
