import { useState, useRef, useEffect } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import {
    Slider,
    Box,
    IconButton,
    Typography,
    Fade
} from '@mui/material'
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material'

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
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            ecver: 2
        },
    }

    const onReady = (event: any) => {
        setPlayer(event.target)
        setDuration(event.target.getDuration())
        setVolume(event.target.getVolume())
    }

    const onStateChange = (event: any) => {
        setIsPlaying(event.data === 1)
    }

    const togglePlay = () => {
        if (!player) return
        if (isPlaying) {
            player.pauseVideo()
        } else {
            player.playVideo()
        }
    }

    useEffect(() => {
        if (!player || !isPlaying) return

        const interval = setInterval(() => {
            setCurrentTime(player.getCurrentTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [player, isPlaying])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const handleSeek = (_: Event, newValue: number | number[]) => {
        if (!player) return
        const newTime = newValue as number
        setCurrentTime(newTime)
        player.seekTo(newTime, true)
    }

    const handleVolume = (_: Event, newValue: number | number[]) => {
        if (!player) return
        const newVol = newValue as number
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
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                bgcolor: 'black',
                overflow: 'hidden',
                userSelect: 'none',
                ...(!className ? { width: '100%', height: '100%' } : {})
            }}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    style={{ width: '100%', height: '100%' }}
                    iframeClassName=""
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
            </Box>

            <Box
                onClick={togglePlay}
                sx={{
                    position: 'absolute',
                    inset: 0,
                    cursor: 'pointer'
                }}
            />

            <Fade in={showControls}>
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        p: 2,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    {/* Progress Bar */}
                    <Box onClick={(e) => e.stopPropagation()} sx={{ px: 1 }}>
                        <Slider
                            value={currentTime}
                            max={duration}
                            onChange={handleSeek}
                            size="small"
                            sx={{
                                color: 'primary.main',
                                height: 4,
                                '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                    '&:before': { boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)' },
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0px 0px 0px 8px rgb(44 116 179 / 16%)'
                                    },
                                    '&.Mui-active': { width: 14, height: 14 }
                                },
                                '& .MuiSlider-rail': { opacity: 0.28 }
                            }}
                        />
                    </Box>

                    {/* Controls Row - Reusing Box flex instead of Stack for safety */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 140 }}>
                                <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                                    {isMuted || volume === 0 ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                                </IconButton>
                                <Slider
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolume}
                                    size="small"
                                    sx={{ color: 'white', width: 80 }}
                                />
                            </Box>

                            <Typography variant="caption" sx={{ color: 'grey.300', fontFamily: 'monospace' }}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </Typography>
                        </Box>

                        <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </Fade>

            {/* Big Play Button Overlay */}
            {!isPlaying && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <PlayIcon sx={{ fontSize: 40, color: 'white', ml: 0.5 }} />
                    </Box>
                </Box>
            )}
        </Box>
    )
}
