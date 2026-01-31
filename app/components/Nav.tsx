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
          className="letter-container inline-block relative"
          style={{
            height: '1.2em',
            lineHeight: '1.2em',
            width: char === ' ' ? '0.3em' : 'auto'
          }}
        >
          <span
            className="absolute top-0 left-0 transition-transform duration-300 ease-out"
            style={{
              transitionDelay: `${index * 20}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span
            className="absolute left-0 transition-transform duration-300 ease-out"
            style={{
              top: '1.2em',
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

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/team', label: 'Roster' },
    { href: '/combine', label: 'Combine' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-black/20 backdrop-blur-lg z-50 fixed w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center w-40">
            <span className="font-[zuume] text-3xl font-bold italic text-white">
              BCHL Officiating
            </span>
          </Link>

          <div className="flex h-full justify-center items-center z-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link group relative flex h-full justify-center items-center px-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive(link.href)
                    ? 'border-t-4 border-orange-600 text-white'
                    : 'text-white group'
                }`}
              >
                <p className={`relative flex h-full justify-center items-center text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
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
          <div className="flex items-center w-40">

          </div>
        </div>
      </div>
    </nav>
  )
}
