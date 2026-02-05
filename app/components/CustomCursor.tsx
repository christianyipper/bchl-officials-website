'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Motion values for the delayed orange circle
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring animation for smooth rebound effect
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [mouseX, mouseY])

  return (
    <>
      {/* Delayed orange circle with rebound */}
      <motion.div
        className="custom-cursor-follower"
        style={{
          left: springX,
          top: springY,
          opacity: isHovering ? 0 : 0.25,
        }}
      />

      {/* Main cursor crosshair */}
      <div
        className="custom-cursor-crosshair"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovering ? '0px' : '16px',
          height: isHovering ? '0px' : '16px',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical line */}
          <line x1="8" y1="0" x2="8" y2="16" stroke="white" strokeWidth="2" />
          {/* Horizontal line */}
          <line x1="0" y1="8" x2="16" y2="8" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Static white dot that appears on hover */}
      {isHovering && (
        <div
          className="custom-cursor-static"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        />
      )}

      {/* Pulsing dot that appears on hover */}
      {isHovering && (
        <div
          className="custom-cursor-pulse"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        />
      )}
    </>
  )
}
