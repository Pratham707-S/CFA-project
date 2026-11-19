"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface MotivationalBannerProps {
  studentName?: string;
  headline?: string;
  subtitle?: string;
  backgroundImageUrl?: string;
}

export function MotivationalBanner({
  studentName = "Pratham",
  headline = "Consistency compounds.",
  subtitle,
  backgroundImageUrl = "/dashboard-mountain.png",
}: MotivationalBannerProps) {
  const resolvedSubtitle =
    subtitle ?? `Keep going, ${studentName}. You're building something great.`;

  return (
    <Card
      className="cfa-motivational-banner"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="cfa-motivational-overlay">
        <div className="cfa-motivational-content">
          <h2 className="cfa-motivational-headline">{headline}</h2>
          <p className="cfa-motivational-subtitle">{resolvedSubtitle}</p>
          <div className="cfa-motivational-accent-line" />
        </div>
      </div>
    </Card>
  );
}
