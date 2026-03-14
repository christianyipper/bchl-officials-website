'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Component to split text into animating letters
function SlidingText({ text, isActive }: { text: string; isActive: boolean }) {
  return (
    <span className="flex">
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="letter-container inline-block overflow-hidden align-top relative"
          style={{ height: '1.2em', lineHeight: '1.2em' }}
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

function BarChartIcon({ isActive }: { isActive: boolean }) {
  // Three bars: heights 40%, 70%, 55% of container
  const bars = [
    { height: 40, delay: '0ms' },
    { height: 70, delay: '60ms' },
    { height: 55, delay: '30ms' },
  ]
  return (
    <svg
      viewBox="0 0 18 14"
      fill="none"
      className="w-5 h-4"
      aria-label="Stats"
    >
      {bars.map((bar, i) => {
        const w = 4
        const gap = 1
        const x = i * (w + gap)
        const fullH = 14
        const barH = (bar.height / 100) * fullH
        const y = fullH - barH
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={barH}
            className={`transition-all duration-300 ${isActive ? 'fill-white' : 'fill-white/40 group-hover:fill-white'}`}
            style={{ transitionDelay: bar.delay }}
          />
        )
      })}
    </svg>
  )
}

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/team', label: 'Team' },
    { href: '/combine', label: 'Combine' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const statsActive = pathname.startsWith('/stats')

  return (
    <nav className="bg-black/20 backdrop-blur-lg z-50 fixed w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center w-44">
            <span className="font-[zuume] text-4xl font-bold italic text-white">
              BCHL Officiating
            </span>
          </Link>

          <div className="flex h-full justify-center items-center z-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link group relative flex h-full justify-center items-center px-6 text-md font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive(link.href)
                    ? 'border-t-4 border-orange-600 text-white'
                    : 'text-white group'
                }`}
              >
                <p className={`relative flex h-full justify-center items-center text-md font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive(link.href)
                    ? '-top-0.5'
                    : ''
                }`}>
                  <SlidingText text={link.label} isActive={isActive(link.href)} />
                </p>
                <div className="w-full h-full absolute bg-orange-600 -translate-y-full group-hover:translate-y-0 transition-all duration-300 -z-10"></div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-end w-44">
            <Link
              href="/stats"
              className={`group relative flex w-12 h-12 items-center justify-center transition-colors duration-300 ${
                statsActive ? 'border-t-4 border-orange-600' : ''
              }`}
              aria-label="Stats"
            >
              <BarChartIcon isActive={statsActive} />
              <div className="w-full h-full absolute bg-orange-600 -translate-y-full group-hover:translate-y-0 transition-all duration-300 -z-10"></div>
            </Link>
            <a
              href="https://www.instagram.com/bchlrefs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group relative flex w-12 h-12 items-center justify-center text-white/40 hover:text-white transition-colors duration-300 overflow-hidden"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current relative z-10" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div className="w-full h-full absolute bg-orange-600 -translate-y-full group-hover:translate-y-0 transition-all duration-300 -z-10"></div>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
