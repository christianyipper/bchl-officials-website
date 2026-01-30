'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  // Custom stagger order: 2, 4, 1, 6, 3, 5
  // Column 2 (idx 1) = 0s, Column 4 (idx 3) = 0.1s, Column 1 (idx 0) = 0.2s,
  // Column 6 (idx 5) = 0.3s, Column 3 (idx 2) = 0.4s, Column 5 (idx 4) = 0.5s
  const delayOrder = [0.2, 0, 0.4, 0.1, 0.5, 0.3]

  // White line stagger order: 10,4,9,1,6,3,12,2,7,5,8,11
  // Convert positions (1-12) to delay multipliers (0-11)
  const whiteLineDelayOrder = [9, 3, 8, 0, 5, 2, 11, 1, 6, 4, 7, 10]

  return (
    <>
      {/* Page transition overlay - 6 columns */}
      <div className="fixed inset-0 z-[100] pointer-events-none flex">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="w-1/6 h-full bg-orange-600"
            initial={{ y: '-100%' }}
            animate={{ y: ['-100%', '0%', '0%', '100%'] }}
            transition={{
              duration: 2.0,
              times: [0, 0.25, 0.5, 1],
              ease: [0.22, 1, 0.36, 1] as any,
              delay: delayOrder[i],
            }}
          />
        ))}
      </div>

      {/* White accent lines - 12 thin divs */}
      <div className="fixed inset-0 z-[102] pointer-events-none flex justify-between px-8">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-full bg-white"
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1] as any,
              delay: whiteLineDelayOrder[i] * 0.1,
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
          duration: 1.8,
          times: [0, 0.3, 0.4, 0.8, 1],
          delay: 0
        }}
      >
        <div className="text-center">
          <img src="/assets/logos/bchl-officials-logo-white.png" alt="BCHL Officials Logo"
            className="w-72 mx-auto mb-4" />
          {/* <div className="font-[zuume] text-6xl font-bold italic text-white mb-2">
            BCHL officiating
          </div> */}
        </div>
      </motion.div>

      {/* Page content fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {children}
      </motion.div>
    </>
  )
}
