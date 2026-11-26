"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, Sun } from "@/components/ui/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export function Header({
  userName = "Pratham Sharma",
  userEmail = "pratham@cfaprep.io",
  onSearch,
  onLogout,
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  // Compute initials e.g. "Pratham Sharma" -> "PS"
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] ?? "P").toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <header className="cfa-header">
      {/* Search Input */}
      <div className="cfa-header-search">
        <Search size={16} className="cfa-search-icon" />
        <input
          type="text"
          className="cfa-search-input"
          placeholder="Search for topics, questions, or ask AI…"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            onSearch?.(e.target.value);
          }}
        />
        <kbd className="cfa-search-kbd">⌘ K</kbd>
      </div>

      {/* Header Actions */}
      <div className="cfa-header-actions">
        {/* Sun / Theme indicator */}
        <button
          type="button"
          className="cfa-theme-btn"
          aria-label="Theme"
          title="Light theme"
        >
          <Sun size={18} className="cfa-sun-icon" />
        </button>

        {/* Notifications Icon with dot */}
        <button
          type="button"
          className="cfa-bell-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} className="cfa-bell-icon" />
          <span className="cfa-bell-dot" />
        </button>

        {/* User Profile */}
        <div className="cfa-user-profile-wrapper">
          <button
            type="button"
            className="cfa-user-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            <Avatar className="cfa-user-avatar">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="cfa-user-name">{userName}</span>
            <ChevronDown size={14} className="cfa-user-chevron" />
          </button>

          {profileOpen && (
            <div className="cfa-profile-dropdown">
              <div className="cfa-profile-info">
                <span className="cfa-profile-display-name">{userName}</span>
                <span className="cfa-profile-email">{userEmail}</span>
              </div>
              <div className="cfa-profile-divider" />
              <button
                type="button"
                className="cfa-profile-menu-item"
                onClick={() => setProfileOpen(false)}
              >
                Profile & Settings
              </button>
              <button
                type="button"
                className="cfa-profile-menu-item"
                onClick={() => setProfileOpen(false)}
              >
                Study Preferences
              </button>
              <div className="cfa-profile-divider" />
              <button
                type="button"
                className="cfa-profile-menu-item logout"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout?.();
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
