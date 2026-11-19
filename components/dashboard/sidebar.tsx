"use client";

import React from "react";
import {
  CfaBarsLogo,
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileChartColumn,
  Layers,
  Bookmark,
  Newspaper,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Target,
  Settings,
} from "@/components/ui/icons";

interface SidebarProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  examDaysLeft?: number;
  levelName?: string;
  examDateLabel?: string;
}

export function Sidebar({
  currentRoute = "Dashboard",
  onNavigate,
  examDaysLeft = 124,
  levelName = "CFA Level I",
  examDateLabel = "Aug 2026 Exam",
}: SidebarProps) {
  const primaryNav = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "My CFA Plan", icon: CalendarDays },
    { name: "Learn", icon: BookOpen },
    { name: "Practice", icon: ClipboardList },
    { name: "Mock Exams", icon: FileChartColumn },
    { name: "Flashcards", icon: Layers },
    { name: "Mistake Book", icon: Bookmark },
  ];

  const exploreNav = [
    { name: "Market News", icon: Newspaper },
    { name: "AI Tutor", icon: Bot },
    { name: "Career Prep", icon: BriefcaseBusiness },
  ];

  const progressNav = [
    { name: "Analytics", icon: ChartNoAxesCombined },
    { name: "Goals", icon: Target },
    { name: "Settings", icon: Settings },
  ];

  const handleNavClick = (name: string) => {
    if (onNavigate) {
      onNavigate(name);
    }
  };

  return (
    <aside className="cfa-sidebar">
      {/* Brand Logo */}
      <div className="cfa-sidebar-brand">
        <span className="cfa-sidebar-logo-icon">
          <CfaBarsLogo size={22} />
        </span>
        <span className="cfa-sidebar-brand-name">CFA Prep</span>
      </div>

      {/* Navigation */}
      <nav className="cfa-sidebar-nav">
        <div className="cfa-sidebar-nav-section">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`cfa-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.name)}
              >
                <Icon size={18} className="cfa-nav-item-icon" />
                <span className="cfa-nav-item-label">{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="cfa-sidebar-divider" />

        <div className="cfa-sidebar-nav-section">
          {exploreNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`cfa-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.name)}
              >
                <Icon size={18} className="cfa-nav-item-icon" />
                <span className="cfa-nav-item-label">{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="cfa-sidebar-divider" />

        <div className="cfa-sidebar-nav-section">
          {progressNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`cfa-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.name)}
              >
                <Icon size={18} className="cfa-nav-item-icon" />
                <span className="cfa-nav-item-label">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer Cards */}
      <div className="cfa-sidebar-footer">
        <div className="cfa-sidebar-plan-card">
          <div className="cfa-plan-card-header">
            <span className="cfa-plan-card-icon">
              <CfaBarsLogo size={18} />
            </span>
            <div className="cfa-plan-card-text">
              <span className="cfa-plan-card-title">{levelName}</span>
              <span className="cfa-plan-card-sub">{examDateLabel}</span>
            </div>
          </div>
          <div className="cfa-plan-card-progress">
            <div className="cfa-plan-card-progress-fill" style={{ width: "52%" }} />
          </div>
          <div className="cfa-plan-card-days">{examDaysLeft} days left</div>
        </div>

        <div className="cfa-sidebar-quote-card">
          <p className="cfa-sidebar-quote-text">
            “Discipline today.
            <br />
            A stronger tomorrow.”
          </p>
        </div>
      </div>
    </aside>
  );
}
