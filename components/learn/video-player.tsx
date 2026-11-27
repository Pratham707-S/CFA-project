"use client";

import React from "react";
import { BookOpen, Clock } from "@/components/ui/icons";

interface VideoPlayerProps {
  title?: string;
  duration?: string;
  videoSrc?: string;
  youtubeVideoId?: string;
  embedUrl?: string;
  watchUrl?: string;
  onEnded?: () => void;
}

export function VideoPlayer({
  title = "Lesson video",
  duration,
  videoSrc,
  youtubeVideoId,
  embedUrl,
  watchUrl,
  onEnded,
}: VideoPlayerProps) {
  return (
    <div className="cfa-video-card">
      <div className="cfa-video-top-tag-row">
        <div className="cfa-video-lesson-badge">
          <span className="cfa-video-badge-icon">
            <BookOpen size={13} color="#ffffff" />
          </span>
          <span>Video Lesson</span>
        </div>
        {duration && (
          <div className="cfa-video-duration-tag">
            <Clock size={13} className="cfa-video-clock-icon" />
            <span>{duration}</span>
          </div>
        )}
      </div>

      <div className="cfa-video-viewport">
        {youtubeVideoId ? (
          <iframe
            className="cfa-youtube-frame"
            src={embedUrl || `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeVideoId)}?controls=1&playsinline=1`}
            title={title}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : videoSrc ? (
          <video
            className="cfa-native-video-elem"
            src={videoSrc}
            controls
            playsInline
            onEnded={onEnded}
            aria-label={title}
          />
        ) : (
          <div className="cfa-video-unavailable" role="status">
            <BookOpen size={24} />
            <strong>Video is not available for this lesson yet.</strong>
            <span>No playback timeline is shown until a real video is connected.</span>
          </div>
        )}
      </div>
      {youtubeVideoId && (
        <a
          className="cfa-youtube-open-link"
          href={watchUrl || `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeVideoId)}`}
          target="_blank"
          rel="noreferrer"
        >
          Open this lecture on YouTube
        </a>
      )}
    </div>
  );
}
