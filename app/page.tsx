'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Parallax hero component with mouse tracking
function ParallaxHero() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for background (slower movement)
  const bgX = useSpring(mouseX, { stiffness: 30, damping: 30 })
  const bgY = useSpring(mouseY, { stiffness: 30, damping: 30 })

  // Smooth spring animation for foreground (follows mouse with smoothing)
  const fgX = useSpring(mouseX, { stiffness: 50, damping: 25 })
  const fgY = useSpring(mouseY, { stiffness: 50, damping: 25 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(x * 25)
      mouseY.set(y * 25)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background video layer - moves opposite for parallax depth */}
      <motion.div
        className="absolute inset-[-30px]"
        style={{
          x: bgX,
          y: bgY,
          scale: 1.1,
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/bchl-hero-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>
      {/* Foreground layer - follows mouse */}
      <motion.div
        className="absolute inset-[-30px] bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/bchl-hero-main.png)',
          backgroundPosition: 'center top',
          backgroundSize: '100% auto',
          x: fgX,
          y: fgY,
        }}
      />
    </div>
  )
}

// Component to split text into animating letters
function SlidingText({ text }: { text: string }) {
  return (
    <span className="inline-flex">
      {text.split('').map((char, index) => (
        <span
          key={`${text}-${index}`}
          className="letter-container inline-block overflow-hidden align-top relative"
          style={{ height: '1.2em', lineHeight: '1.2em', width: char === ' ' ? '0.3em' : 'auto' }}
        >
          <span
            className="top-letter block transition-transform duration-300 ease-out will-change-transform"
            style={{
              lineHeight: '1.2em',
              transitionDelay: `${index * 20}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span
            className="bottom-letter block transition-transform duration-300 ease-out will-change-transform"
            style={{
              lineHeight: '1.2em',
              position: 'absolute',
              top: '1.2em',
              left: 0,
              transitionDelay: `${index * 20}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </span>
  )
}

function RotatingText() {
  const words = ['skills.', 'officiating.', 'game.']
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`text-bchl-light-orange inline-block rotating-word ${isAnimating ? 'animate' : ''}`}>
      <SlidingText text={words[currentIndex]} />
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
            <h1 className="font-[zuume] text-8xl font-bold italic text-white">
              Combine 2026
            </h1>
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
