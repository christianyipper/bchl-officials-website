'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

// Parallax hero component with mouse tracking
function ParallaxHero() {
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for background (slower movement)
  const bgX = useSpring(mouseX, { stiffness: 30, damping: 30 })
  const bgY = useSpring(mouseY, { stiffness: 30, damping: 30 })

  // Smooth spring animation for foreground (follows mouse with smoothing)
  const fgX = useSpring(mouseX, { stiffness: 50, damping: 25 })
  const fgY = useSpring(mouseY, { stiffness: 50, damping: 25 })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Force video play for Safari
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay was prevented, will need user interaction
      })
    }

    // Try playing immediately
    tryPlay()

    // Also try when video is ready
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)

    // Retry after a short delay for Safari initial load
    const timeout = setTimeout(tryPlay, 500)

    return () => {
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(x * 25)
      mouseY.set(y * 25)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, isMobile])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background video layer - moves opposite for parallax depth */}
      <motion.div
        className="absolute inset-0 md:inset-[-30px]"
        style={{
          x: isMobile ? 0 : bgX,
          y: isMobile ? 0 : bgY,
          scale: isMobile ? 1 : 1.1,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          className="w-full h-full object-cover object-[90%_center] md:object-center"
        >
          <source src="/assets/bchl-hero-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>
      {/* Foreground layer - follows mouse */}
      <motion.div
        className="absolute inset-0 md:inset-[-30px] bg-no-repeat bg-cover md:bg-[length:100%_auto]"
        style={{
          backgroundImage: 'url(/assets/bchl-hero-main.png)',
          backgroundPosition: isMobile ? '90% top' : 'center top',
          x: isMobile ? 0 : fgX,
          y: isMobile ? 0 : fgY,
        }}
      />
    </div>
  )
}

function RotatingText() {
  const words = ['skills.', 'officiating.', 'game.']
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-bchl-light-orange inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIndex]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Home() {
  return (
    <main className="flex flex-col justify-end relative min-h-screen">
      <ParallaxHero />
      <div className="container mx-auto py-[10vh] h-full z-10">
        <div className="flex flex-col w-min p-4">
          <div className="flex flex-col text-left mb-8 w-max">
            <div className="relative flex">
              <h1 className="font-[zuume] text-8xl font-bold italic text-white z-10">
                Combine 2026
              </h1>
              <p className="font-[zuume] text-8xl font-bold italic text-black absolute blur-lg">
                Combine 2026
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-white font-bold uppercase tracking-wider">
                Showcase your <RotatingText />
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <a href="/team" className="px-4 py-2 font-black flex justify-center items-center uppercase text-sm transition-colors duration-300
            bg-white text-black hover:bg-orange-600 hover:text-white
            ">Learn More</a>
            <a href="/team" className="px-4 py-2 font-black flex justify-center items-center uppercase text-sm transition-colors duration-300
            bg-transparent text-white border-2 border-white hover:bg-orange-600 hover:border-orange-600
            ">Our Team</a>
          </div>
        </div>
      </div>
    </main>
  )
}
