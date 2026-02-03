'use client'

import { useState, useEffect } from 'react'

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
      <div className="container mx-auto px-4 py-16 h-full flex flex-col justify-end">
        <div className="text-left mb-8">
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
    </main>
  )
}
