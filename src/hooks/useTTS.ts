import { useState, useCallback } from "react";
import { TTSService } from "../lib/tts-service";

interface UseTTSOptions {
  voice_id?: string;
  speed?: "x-slow" | "slow" | "medium" | "fast" | "x-fast";
  pitch?: "x-low" | "low" | "medium" | "high" | "x-high";
  autoPlay?: boolean;
  preload?: boolean;
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  const ttsService = TTSService.getInstance();

  const playAudio = useCallback(
    async (url?: string) => {
      const audioSrc = url || audioUrl;
      if (!audioSrc) {
        setError("No audio URL available");
        return;
      }

      try {
        // Stop current audio if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        const audio = new Audio(audioSrc);
        setCurrentAudio(audio);

        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          setError("Audio playback failed");
          setIsPlaying(false);
          setCurrentAudio(null);
        };

        await audio.play();
      } catch (err) {
        setError("Failed to play audio");
        console.error("Audio playback error:", err);
      }
    },
    [audioUrl, currentAudio],
  );

  const synthesize = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setError("Text is required");
        return null;
      }

      setIsLoading(true);
      setError("");
      setAudioUrl("");

      try {
        const result = await ttsService.synthesizeText({
          text: text.trim(),
          voice_id: options.voice_id,
          speed: options.speed,
          pitch: options.pitch,
        });

        if (result.success && result.audio_url) {
          setAudioUrl(result.audio_url);
          setDuration(result.duration || 0);

          if (options.preload) {
            await ttsService.preloadAudio(result.audio_url);
          }

          if (options.autoPlay) {
            await playAudio(result.audio_url);
          }

          return result;
        }

        throw new Error(result.error || "TTS synthesis failed");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("TTS Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options, playAudio, ttsService],
  );

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const pauseAudio = useCallback(() => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
    }
  }, [currentAudio, isPlaying]);

  const resumeAudio = useCallback(() => {
    if (currentAudio && !isPlaying) {
      currentAudio.play().catch((err) => {
        console.error("Resume playback error:", err);
        setError("Failed to resume audio");
      });
    }
  }, [currentAudio, isPlaying]);

  return {
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
    clearError: () => setError(""),
  };
}
