import { useEffect, useRef, useState } from "react";
import { Channel } from "@/lib/channels";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import 'shaka-player/dist/shaka-player.ui.js';

interface VideoPlayerProps {
  channel: Channel;
}

export const VideoPlayer = ({ channel }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const shakaPlayerRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/shaka-player@4.7.11/dist/shaka-player.compiled.js';
    script.async = true;
    script.onload = initPlayer;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const destroyPlayer = async () => {
    if (shakaPlayerRef.current) {
      try {
        await shakaPlayerRef.current.destroy();
        shakaPlayerRef.current = null;
      } catch (error) {
        console.error("Error destroying player:", error);
      }
    }
  };

  const initPlayer = async () => {
    try {
      // @ts-ignore
      const shaka = window.shaka;
      if (!videoRef.current || !shaka) return;

      shaka.polyfill.installAll();
      if (!shaka.Player.isBrowserSupported()) {
        throw new Error("Browser not supported!");
      }

      // Destroy existing player before creating a new one
      await destroyPlayer();

      const player = new shaka.Player(videoRef.current);
      shakaPlayerRef.current = player;

      // Configure auto quality adjustment
      player.configure({
        abr: {
          enabled: true,
          defaultBandwidthEstimate: 1000000,
          switchInterval: 1,
          bandwidthUpgradeTarget: 0.85,
          bandwidthDowngradeTarget: 0.95
        },
        streaming: {
          bufferingGoal: 10,
          rebufferingGoal: 2,
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2,
            timeout: 30000
          }
        }
      });

      player.addEventListener("error", (event: any) => {
        console.error("Error code", event.detail.code, "object", event.detail);
      });

      if (channel.drmKey) {
        console.log("Configuring DRM with key:", channel.drmKey);
        const [keyId, key] = channel.drmKey.split(':');
        await player.configure({
          drm: {
            clearKeys: {
              [keyId]: key
            },
            retryParameters: {
              maxAttempts: 5,
              baseDelay: 1000,
              backoffFactor: 2
            }
          }
        });
      }

      console.log("Loading URL:", channel.url);
      try {
        await player.load(channel.url);
        console.log("Video loaded successfully");
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error loading video:", error);
      }
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setIsMuted(volume === 0);
    }
  }, [volume]);

  useEffect(() => {
    const initNewChannel = async () => {
      await destroyPlayer();
      await initPlayer();
    };
    
    initNewChannel();
    
    return () => {
      destroyPlayer();
    };
  }, [channel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      setVolume(1);
      videoRef.current.volume = 1;
    } else {
      setVolume(0);
      videoRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
      />

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>

          <div className="w-24">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="cursor-pointer"
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};