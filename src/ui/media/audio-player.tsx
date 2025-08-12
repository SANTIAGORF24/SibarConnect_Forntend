'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 bg-gray-100 rounded-lg p-3 min-w-[280px] max-w-sm ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="flex-shrink-0 w-10 h-10 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress and Controls */}
      <div className="flex-1 min-w-0">
        {/* Waveform/Progress Bar */}
        <div className="relative mb-2">
          <div className="h-8 flex items-center space-x-1">
            {/* Simulated waveform bars */}
            {[...Array(20)].map((_, i) => {
              const height = Math.random() * 20 + 8; // Random height between 8-28px
              const isActive = (i / 20) * 100 <= progressPercentage;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-colors ${
                    isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
          
          {/* Invisible range input for seeking */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </div>

        {/* Time and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Rewind Button */}
            <button
              onClick={() => skip(-5)}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                <path d="M10.5 12.5v3l2.5-1.5z"/>
              </svg>
            </button>

            {/* Time Display */}
            <span className="text-xs text-gray-600 font-mono min-w-[3rem]">
              {formatTime(currentTime)}
            </span>

            {/* Fast Forward Button */}
            <button
              onClick={() => skip(5)}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                <path d="M13.5 12.5v3l2.5-1.5z"/>
              </svg>
            </button>
          </div>

          {/* Duration */}
          <span className="text-xs text-gray-500 font-mono">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Audio Icon */}
      <div className="flex-shrink-0 text-gray-500">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
      </div>
    </div>
  );
}
