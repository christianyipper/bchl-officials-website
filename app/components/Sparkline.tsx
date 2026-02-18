'use client'

import { useEffect, useRef, useState } from 'react'

interface SparklineProps {
  data?: number[]
  color?: string
  datasets?: { data: number[]; color: string }[]
  labels?: string[]
  delay?: number
  duration?: number
  className?: string
}

function buildPath(data: number[], viewWidth: number, viewHeight: number, padding: number, scaleMin: number, scaleRange: number) {
  const pts = data.map((value, i) => ({
    x: (i / (data.length - 1)) * viewWidth,
    y: viewHeight - padding - ((value - scaleMin) / scaleRange) * (viewHeight - padding * 2)
  }))

  const tension = 0.3
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return d
}

function niceSteps(max: number, targetTicks: number = 4): number[] {
  if (max <= 0) return [1]
  const roughStep = max / targetTicks
  let step = Math.max(1, Math.ceil(roughStep))
  if (step >= 3) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(step)))
    const residual = step / magnitude
    if (residual <= 2) step = 2 * magnitude
    else if (residual <= 5) step = 5 * magnitude
    else step = 10 * magnitude
  }
  const niceMax = Math.ceil(max / step) * step
  const values: number[] = []
  for (let v = step; v <= niceMax; v += step) values.push(v)
  return values
}

export default function Sparkline({ data, color, datasets, labels, delay = 1200, duration = 2500, className = '' }: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [animated, setAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)

  // Normalize to multi-line format
  const lines = datasets || (data && color ? [{ data, color }] : [])
  const dataKey = lines.map(l => l.data.join(',')).join('|')

  // Observe visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (svgRef.current) {
      observer.observe(svgRef.current)
    }

    return () => {
      if (svgRef.current) {
        observer.unobserve(svgRef.current)
      }
    }
  }, [])

  // Reset and replay animation when data changes or becomes visible
  useEffect(() => {
    if (!isVisible) return
    setAnimated(false)
    const animDelay = hasAnimated.current ? 0 : delay
    const raf = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        setAnimated(true)
        hasAnimated.current = true
      }, animDelay)
    })
    let timer: ReturnType<typeof setTimeout>
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [dataKey, isVisible, delay])

  // Need at least 2 data points and at least 1 line
  const validLines = lines.filter(l => l.data.length >= 2)
  if (validLines.length === 0) return null

  const allValues = validLines.flatMap(l => l.data)
  const globalMax = Math.max(...allValues)
  const globalMin = Math.min(...allValues)

  const isMulti = validLines.length > 1
  const hasLabels = labels && labels.length > 0

  // For labeled charts, use nice y-axis scale from 0; otherwise use data range
  const yTicks = hasLabels ? niceSteps(globalMax) : null
  const scaleMin = hasLabels ? 0 : globalMin
  const scaleMax = hasLabels && yTicks ? yTicks[yTicks.length - 1] : globalMax
  const scaleRange = scaleMax - scaleMin || 1

  const padding = 6
  const viewWidth = 100
  const viewHeight = 40

  const clipId = `sparkline-clip-${dataKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`

  // Simple sparkline (no labels)
  if (!hasLabels) {
    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
        className={className}
      >
        <defs>
          {validLines.map((line, idx) => {
            const gradId = `sparkline-fade-${idx}-${line.color.replace(/[^a-zA-Z0-9]/g, '')}`
            return (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={line.color} stopOpacity={0} />
                <stop offset={isMulti ? "40%" : "60%"} stopColor={line.color} stopOpacity={1} />
                <stop offset="100%" stopColor={line.color} stopOpacity={1} />
              </linearGradient>
            )
          })}
          <clipPath id={clipId}>
            <rect
              x={0}
              y={0}
              width={animated ? viewWidth : 0}
              height={viewHeight}
              style={{
                transition: animated ? `width ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none'
              }}
            />
          </clipPath>
        </defs>
        {!isMulti && (
          <path
            d={`${buildPath(validLines[0].data, viewWidth, viewHeight, padding, scaleMin, scaleRange)} L ${viewWidth},${viewHeight} L 0,${viewHeight} Z`}
            fill="none"
            fillOpacity={0.15}
          />
        )}
        {validLines.map((line, idx) => {
          const gradId = `sparkline-fade-${idx}-${line.color.replace(/[^a-zA-Z0-9]/g, '')}`
          const d = buildPath(line.data, viewWidth, viewHeight, padding, scaleMin, scaleRange)
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={isMulti ? 2 : 3}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              clipPath={`url(#${clipId})`}
            />
          )
        })}
      </svg>
    )
  }

  // Full chart with grid, y-axis, x-axis labels
  const dataLen = validLines[0].data.length

  return (
    <div className={className}>
      <div className="flex">
        {/* Y-axis labels */}
        <div className="relative items-end pr-2 h-36">
          {yTicks!.map((tick) => {
            const yPct = (1 - padding / viewHeight - ((tick - scaleMin) / scaleRange) * (1 - padding * 2 / viewHeight)) * 100
            return (
              <span
                key={tick}
                className="absolute right-2 text-[10px] text-gray-600 font-bold leading-none"
                style={{ top: `${yPct}%`, transform: 'translateY(-50%)' }}
              >
                {tick}
              </span>
            )
          })}
        </div>
        {/* Chart area */}
        <div className="flex-1 min-w-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="none"
            className="w-full h-36"
          >
            <defs>
              {validLines.map((line, idx) => {
                const gradId = `sparkline-fade-${idx}-${line.color.replace(/[^a-zA-Z0-9]/g, '')}`
                return (
                  <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={line.color} stopOpacity={0} />
                    <stop offset={isMulti ? "40%" : "60%"} stopColor={line.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={line.color} stopOpacity={1} />
                  </linearGradient>
                )
              })}
              <clipPath id={clipId}>
                <rect
                  x={0}
                  y={0}
                  width={animated ? viewWidth : 0}
                  height={viewHeight}
                  style={{
                    transition: animated ? `width ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none'
                  }}
                />
              </clipPath>
            </defs>
            {/* Horizontal grid lines */}
            {yTicks!.map((tick) => {
              const y = viewHeight - padding - ((tick - scaleMin) / scaleRange) * (viewHeight - padding * 2)
              return (
                <line
                  key={`h-${tick}`}
                  x1={0}
                  y1={y}
                  x2={viewWidth}
                  y2={y}
                  stroke="#1b263d"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
            {/* Vertical grid lines */}
            {labels.map((_, i) => {
              const x = (i / (dataLen - 1)) * viewWidth
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={viewHeight}
                  stroke="#1b263d"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
            {/* Data lines */}
            {validLines.map((line, idx) => {
              const gradId = `sparkline-fade-${idx}-${line.color.replace(/[^a-zA-Z0-9]/g, '')}`
              const d = buildPath(line.data, viewWidth, viewHeight, padding, scaleMin, scaleRange)
              return (
                <path
                  key={idx}
                  d={d}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={isMulti ? 2 : 3}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  clipPath={`url(#${clipId})`}
                />
              )
            })}
          </svg>
          {/* X-axis labels */}
          <div className="flex justify-between">
            {labels.map((label, i) => (
              <span key={i} className="text-[10px] text-gray-600 font-bold uppercase" style={{ width: 0, display: 'flex', justifyContent: 'center' }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
