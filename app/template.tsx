'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Desktop: 6 columns with custom stagger
  const desktopDelayOrder = [0, 0.1, 0.2, 0.3, 0.4, 0.5]
  // Mobile: 3 columns with faster stagger
  const mobileDelayOrder = [0, 0.05, 0.1]

  // Desktop: 12 white lines
  const desktopWhiteLineDelayOrder = [9, 3, 8, 0, 5, 2, 11, 1, 6, 4, 7, 10]
  // Mobile: 4 white lines
  const mobileWhiteLineDelayOrder = [2, 0, 3, 1]

  const columnCount = isMobile ? 3 : 6
  const whiteLineCount = isMobile ? 4 : 12
  const delayOrder = isMobile ? mobileDelayOrder : desktopDelayOrder
  const whiteLineDelayOrder = isMobile ? mobileWhiteLineDelayOrder : desktopWhiteLineDelayOrder
  const duration = isMobile ? 1.2 : 2.0
  const whiteLineDuration = isMobile ? 0.6 : 1.0

  return (
    <>
      {/* Initial full-screen drop */}
      <motion.div
        className="fixed inset-0 z-[99] pointer-events-none bg-orange-600"
        initial={{ y: '-100%' }}
        animate={{ y: ['-100%', '0%', '0%', '100%'] }}
        transition={{
          duration: duration,
          times: [0, 0.25, 0.5, 1],
          ease: [0.22, 1, 0.36, 1] as any,
          delay: 0,
        }}
      />

      {/* Page transition overlay - columns */}
      <div className="fixed inset-0 z-[100] pointer-events-none flex">
        {Array.from({ length: columnCount }, (_, i) => (
          <motion.div
            key={i}
            className={`h-full bg-orange-600 ${isMobile ? 'w-1/3' : 'w-1/6'}`}
            initial={{ y: '-100%' }}
            animate={{ y: ['-100%', '0%', '0%', '100%'] }}
            transition={{
              duration: duration,
              times: [0, 0.25, 0.5, 1],
              ease: [0.22, 1, 0.36, 1] as any,
              delay: delayOrder[i],
            }}
          />
        ))}
      </div>

      {/* White accent lines */}
      <div className="fixed inset-0 z-[102] pointer-events-none flex justify-between px-8">
        {Array.from({ length: whiteLineCount }, (_, i) => (
          <motion.div
            key={i}
            className="w-1 h-full bg-white"
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: whiteLineDuration,
              ease: [0.22, 1, 0.36, 1] as any,
              delay: whiteLineDelayOrder[i] * (isMobile ? 0.05 : 0.1),
            }}
          />
        ))}
      </div>

      {/* Text overlay */}
      <motion.div
        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 1, 1, 0],
          scale: [0.8, 1, 1, 1, 1]
        }}
        transition={{
          duration: isMobile ? 1.0 : 1.8,
          times: [0, 0.3, 0.4, 0.8, 1],
          delay: 0
        }}
      >
        <div className="text-center">
          <img src="/assets/logos/bchl-officials-logo-white.png" alt="BCHL Officials Logo"
            className="w-72 mx-auto mb-4" />
        </div>
      </motion.div>

      {/* Page content fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: isMobile ? 0.5 : 0.8 }}
      >
        {children}
      </motion.div>
    </>
  )
}
