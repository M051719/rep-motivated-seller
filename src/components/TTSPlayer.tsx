import React, { useState } from "react";
import { useTTS } from "@/hooks/useTTS";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface TTSPlayerProps {
  initialText?: string;
  voice_id?: string;
  speed?: "x-slow" | "slow" | "medium" | "fast" | "x-fast";
  pitch?: "x-low" | "low" | "medium" | "high" | "x-high";
  className?: string;
}

export function TTSPlayer({
  initialText = "",
  voice_id = "Joanna",
  speed = "medium",
  pitch = "medium",
  className = "",
}: TTSPlayerProps) {
  const [text, setText] = useState(initialText);
  const [showSettings, setShowSettings] = useState(false);
  const [currentVoice, setCurrentVoice] = useState(voice_id);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [currentPitch, setCurrentPitch] = useState(pitch);

  const {
    synthesize,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    isLoading,
    error,
    audioUrl,
    duration,
    isPlaying,
    clearError,
  } = useTTS({
    voice_id: currentVoice,
    speed: currentSpeed,
    pitch: currentPitch,
  });

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    clearError();
    await synthesize(text);
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      pauseAudio();
    } else {
      if (audioUrl) {
        resumeAudio();
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Text-to-Speech</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-md p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={currentVoice}
                onChange={(e) => setCurrentVoice(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Joanna">Joanna (US Female)</option>
                <option value="Matthew">Matthew (US Male)</option>
                <option value="Ivy">Ivy (US Child)</option>
                <option value="Kendra">Kendra (US Female)</option>
                <option value="Joey">Joey (US Male)</option>
                <option value="Emma">Emma (British Female)</option>
                <option value="Brian">Brian (British Male)</option>
                <option value="Nicole">Nicole (Australian Female)</option>
              </select>
            </div>

            {/* Speed Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed
              </label>
              <select
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="x-slow">Very Slow</option>
                <option value="slow">Slow</option>
                <option value="medium">Normal</option>
                <option value="fast">Fast</option>
                <option value="x-fast">Very Fast</option>
              </select>
            </div>

            {/* Pitch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pitch
              </label>
              <select
                value={currentPitch}
                onChange={(e) => setCurrentPitch(e.target.value as any)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="x-low">Very Low</option>
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
                <option value="x-high">Very High</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text to Convert
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          maxLength={3000}
        />
        <div className="mt-1 text-sm text-gray-500">
          {text.length}/3000 characters
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Synthesize Button */}
          <button
            onClick={handleSynthesize}
            disabled={!text.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Converting..." : "Convert to Speech"}
          </button>

          {/* Playback Controls */}
          {audioUrl && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={stopAudio}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Duration Display */}
        {duration > 0 && (
          <div className="text-sm text-gray-500">
            Duration: {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Audio Element (hidden) */}
      {audioUrl && (
        <audio src={audioUrl} className="hidden" controls preload="metadata" />
      )}
    </div>
  );
}
