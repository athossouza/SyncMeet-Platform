import { useState, useRef, useEffect } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface CustomVideoPlayerProps {
    videoId: string
    className?: string
}

export default function CustomVideoPlayer({ videoId, className }: CustomVideoPlayerProps) {
    const [player, setPlayer] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(100)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,
            controls: 0, // Hide native controls
            disablekb: 1, // Disable keyboard controls
            fs: 0, // Hide fullscreen button
            iv_load_policy: 3, // Hide annotations
            modestbranding: 1,
            rel: 0, // Show related videos from same channel only (but we hide them locally)
            showinfo: 0, // Deprecated but good to keep
            ecver: 2
        },
    }

    // --- Event Handlers ---

    const onReady = (event: any) => {
        setPlayer(event.target)
        setDuration(event.target.getDuration())
        setVolume(event.target.getVolume())
    }

    const onStateChange = (event: any) => {
        // PlayerState.PLAYING = 1, PAUSED = 2
        setIsPlaying(event.data === 1)
    }

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!player) return
        if (isPlaying) {
            player.pauseVideo()
        } else {
            player.playVideo()
        }
    }

    // Sync Timer
    useEffect(() => {
        if (!player || !isPlaying) return

        const interval = setInterval(() => {
            setCurrentTime(player.getCurrentTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [player, isPlaying])

    // Format Time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    // Seek
    const handleSeek = (value: number[]) => {
        if (!player) return
        const newTime = value[0]
        setCurrentTime(newTime)
        player.seekTo(newTime, true)
    }

    // Volume
    const handleVolume = (value: number[]) => {
        if (!player) return
        const newVol = value[0]
        setVolume(newVol)
        player.setVolume(newVol)
        if (newVol > 0 && isMuted) {
            setIsMuted(false)
            player.unMute()
        }
    }

    const toggleMute = () => {
        if (!player) return
        if (isMuted) {
            player.unMute()
            player.setVolume(volume)
            setIsMuted(false)
        } else {
            player.mute()
            setIsMuted(true)
        }
    }

    // Fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`)
            })
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 2500)
    }

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false)
        }
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative group bg-black overflow-hidden select-none", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* The YouTube Player */}
            {/* Pointer events none on the iframe container ensures clicks go to our overlay? 
                Actually, we need pointer-events-auto for Youtube to register 'views' if needed 
                BUT masking title requires blocking top interaction. 
                Let's use a BLOCKER div for the top area, but leave center clickable? 
                Actually, Moodle example blocks EVERYTHING and handles clicks via overlay? 
                Let's block everything and click-to-play via the overlay. 
            */}

            <div className="absolute inset-0 pointer-events-none">
                <YouTube
                    videoId={videoId}
                    title={undefined} // Attempt to reduce title rendering
                    opts={opts}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
            </div>

            {/* INTENTIONAL BLOCKER: Captures ALL clicks to prevent YouTube UI interaction (Title, Share, Profile) */}
            {/* We will delegate clicks on this overlay to Play/Pause */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={togglePlay}
            />

            {/* Custom Control Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 transition-opacity duration-300 flex flex-col gap-2 z-10",
                    showControls ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Progress Bar */}
                <div className="w-full cursor-pointer group/slider" onClick={(e) => e.stopPropagation()}>
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolume}
                                    className="w-20"
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <span className="text-sm text-slate-300 font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Big Play Button (Centered) - Only when paused/not started */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    )
}
