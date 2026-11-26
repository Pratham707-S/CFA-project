"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Clock,
  BookOpen,
} from "@/components/ui/icons";

interface VideoPlayerProps {
  title?: string;
  duration?: string;
  videoSrc?: string;
  youtubeVideoId?: string;
  onEnded?: () => void;
}

export function VideoPlayer({
  title = "Time Value of Money",
  duration = "18 min",
  videoSrc,
  youtubeVideoId,
  onEnded,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(324); // e.g. 5m 24s preview
  const [totalDuration, setTotalDuration] = useState(1080); // 18m
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds -> mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handlePlayToggle = () => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (videoRef.current) videoRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      if (videoRef.current) videoRef.current.volume = 0;
    }
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mock progress simulation if no native videoSrc is provided
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !videoSrc) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            onEnded?.();
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoSrc, totalDuration, playbackSpeed, onEnded]);

  return (
    <div className="cfa-video-card" ref={containerRef}>
      {/* Top Tag Header */}
      <div className="cfa-video-top-tag-row">
        <div className="cfa-video-lesson-badge">
          <span className="cfa-video-badge-icon">
            <BookOpen size={13} color="#ffffff" />
          </span>
          <span>Video Lesson</span>
        </div>

        <div className="cfa-video-duration-tag">
          <Clock size={13} className="cfa-video-clock-icon" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        className="cfa-video-viewport"
        onMouseEnter={() => setShowControls(true)}
      >
        {youtubeVideoId ? (
          <iframe
            className="cfa-youtube-frame"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeVideoId)}`}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="cfa-native-video-elem"
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setTotalDuration(videoRef.current.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              onEnded?.();
            }}
            onClick={handlePlayToggle}
          />
        ) : (
          /* High-Fidelity Conceptual Poster / Graphic matching reference screenshot */
          <div
            className={`cfa-video-poster-art ${isPlaying ? "is-playing-simulation" : ""}`}
            onClick={handlePlayToggle}
          >
            {/* Background subtle mesh gradients */}
            <div className="cfa-video-art-gradient-bg" />

            {/* Left title and description */}
            <div className="cfa-video-art-overlay-text">
              <h2 className="cfa-video-art-title">{title}</h2>
            </div>

            {/* Centered Play Button (large round white pill with green accent) */}
            <div className="cfa-video-central-play-wrap">
              <button
                type="button"
                className="cfa-video-central-play-btn"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause size={28} fill="#0d7b5f" color="#0d7b5f" />
                ) : (
                  <Play size={28} fill="#0d7b5f" color="#0d7b5f" />
                )}
              </button>
            </div>

            {/* 3D Isometric Bar Chart Artwork with Trend Arrow */}
            <div className="cfa-video-art-chart-wrap" aria-hidden="true">
              <svg
                width="240"
                height="150"
                viewBox="0 0 240 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cfa-video-chart-svg"
              >
                {/* 3D Column 1 */}
                <g transform="translate(10, 85)">
                  <path d="M0 10 L14 2 L28 10 L14 18 Z" fill="#34d399" opacity="0.9" />
                  <path d="M0 10 L14 18 L14 48 L0 40 Z" fill="#10b981" />
                  <path d="M14 18 L28 10 L28 40 L14 48 Z" fill="#059669" />
                </g>

                {/* 3D Column 2 */}
                <g transform="translate(44, 70)">
                  <path d="M0 10 L14 2 L28 10 L14 18 Z" fill="#34d399" opacity="0.95" />
                  <path d="M0 10 L14 18 L14 63 L0 55 Z" fill="#10b981" />
                  <path d="M14 18 L28 10 L28 55 L14 63 Z" fill="#059669" />
                </g>

                {/* 3D Column 3 */}
                <g transform="translate(78, 55)">
                  <path d="M0 10 L14 2 L28 10 L14 18 Z" fill="#34d399" />
                  <path d="M0 10 L14 18 L14 78 L0 70 Z" fill="#10b981" />
                  <path d="M14 18 L28 10 L28 70 L14 78 Z" fill="#059669" />
                </g>

                {/* 3D Column 4 */}
                <g transform="translate(112, 38)">
                  <path d="M0 10 L14 2 L28 10 L14 18 Z" fill="#6ee7b7" />
                  <path d="M0 10 L14 18 L14 95 L0 87 Z" fill="#10b981" />
                  <path d="M14 18 L28 10 L28 87 L14 95 Z" fill="#047857" />
                </g>

                {/* 3D Cylinder / Column 5 (Tallest) */}
                <g transform="translate(146, 20)">
                  <path d="M0 12 L16 3 L32 12 L16 21 Z" fill="#a7f3d0" />
                  <path d="M0 12 L16 21 L16 115 L0 106 Z" fill="#0d9488" />
                  <path d="M16 21 L32 12 L32 106 L16 115 Z" fill="#0f766e" />
                </g>

                {/* Upward Growth Arrow ↗ */}
                <path
                  d="M16 95 C 60 85, 100 55, 175 14"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                <polygon points="175,9 180,18 168,16" fill="#059669" />
              </svg>
            </div>
          </div>
        )}

        {/* Video Control Bar */}
        {!youtubeVideoId && <div className={`cfa-video-controls ${showControls ? "visible" : ""}`}>
          {/* Progress Timeline Slider */}
          <div className="cfa-video-progress-bar-wrap">
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={handleSeek}
              className="cfa-video-scrubber"
              style={{
                background: `linear-gradient(to right, #0d7b5f ${(currentTime / totalDuration) * 100}%, #e2e8f0 ${(currentTime / totalDuration) * 100}%)`,
              }}
            />
          </div>

          <div className="cfa-video-controls-row">
            {/* Left Controls: Play/Pause, Rewind, Time */}
            <div className="cfa-video-controls-left">
              <button
                type="button"
                className="cfa-video-ctrl-btn"
                onClick={handlePlayToggle}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>

              <button
                type="button"
                className="cfa-video-ctrl-btn"
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                title="Rewind 10 seconds"
              >
                <RotateCcw size={15} />
              </button>

              <div className="cfa-video-time-display">
                <span>{formatTime(currentTime)}</span>
                <span className="cfa-video-time-divider">/</span>
                <span className="cfa-video-time-total">{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Right Controls: Volume, Speed, Fullscreen */}
            <div className="cfa-video-controls-right">
              {/* Volume */}
              <div className="cfa-video-volume-group">
                <button
                  type="button"
                  className="cfa-video-ctrl-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="cfa-video-volume-slider"
                />
              </div>

              {/* Speed Menu */}
              <div className="cfa-video-speed-wrapper">
                <button
                  type="button"
                  className="cfa-video-speed-btn"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="cfa-video-speed-dropdown">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        className={`cfa-video-speed-option ${playbackSpeed === spd ? "active" : ""}`}
                        onClick={() => handleSpeedSelect(spd)}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                type="button"
                className="cfa-video-ctrl-btn"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
              </button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
