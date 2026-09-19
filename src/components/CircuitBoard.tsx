"use client"

/**
 * CircuitBoard from Componentry (https://componentry.dev, MIT).
 * Local changes: imports from "motion/react" and clsx; a fixed dark palette in
 * place of theme detection; no glow, box-shadow, dot grid or rounded corners;
 * the drawing and pulses start when the board scrolls into view and stay
 * still for reduced-motion visitors; the pattern presets were dropped.
 */

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { clsx as cn } from "clsx"

interface CircuitNode {
  id: string
  x: number
  y: number
  label?: string
  icon?: React.ReactNode
  status?: "active" | "inactive" | "processing" | "error"
  size?: "sm" | "md" | "lg"
}

interface CircuitConnection {
  from: string
  to: string
  animated?: boolean
  bidirectional?: boolean
  color?: string
  pulseColor?: string
}

interface CircuitBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  nodes: CircuitNode[]
  connections: CircuitConnection[]
  width?: number
  height?: number
  gridSize?: number
  showGrid?: boolean
  gridColor?: string
  traceColor?: string
  pulseColor?: string
  nodeColor?: string
  pulseSpeed?: number
  traceWidth?: number
}

export function CircuitBoard({
  nodes,
  connections,
  width = 600,
  height = 400,
  gridSize = 20,
  showGrid = false,
  gridColor,
  traceColor,
  pulseColor,
  nodeColor,
  pulseSpeed = 2,
  traceWidth = 2,
  className,
  ...props
}: CircuitBoardProps) {
  // Site palette (dark canvas). Each colour can still be overridden by a prop.
  const computedGridColor = gridColor || "rgba(237, 237, 243, 0.08)"
  const computedTraceColor = traceColor || "rgba(237, 237, 243, 0.28)"
  const computedPulseColor = pulseColor || "#5266eb"
  const computedNodeColor = nodeColor || "rgba(237, 237, 243, 0.55)"

  // Draw and pulse once the board scrolls into view; static for reduced motion.
  const boardRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(boardRef, { once: true, amount: 0.3 })
  const reduceMotion = useReducedMotion() ?? false
  const show = inView || reduceMotion
  const nodeMap = React.useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]))
  }, [nodes])

  const getNodeSize = React.useCallback((size?: CircuitNode["size"]) => {
    switch (size) {
      case "sm":
        return 24
      case "lg":
        return 48
      default:
        return 36
    }
  }, [])

  const calculatePath = React.useCallback(
    (from: CircuitNode, to: CircuitNode): string => {
      const fromSize = getNodeSize(from.size) / 2 + 4
      const toSize = getNodeSize(to.size) / 2 + 4

      const dx = to.x - from.x
      const dy = to.y - from.y

      // Calculate start and end points offset from node centers
      let startX = from.x
      let startY = from.y
      let endX = to.x
      let endY = to.y

      // Create circuit-like paths with right angles
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal first, then vertical
        startX = from.x + (dx > 0 ? fromSize : -fromSize)
        endX = to.x + (dx > 0 ? -toSize : toSize)
        const midX = from.x + dx / 2
        return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`
      } else {
        // Vertical first, then horizontal
        startY = from.y + (dy > 0 ? fromSize : -fromSize)
        endY = to.y + (dy > 0 ? -toSize : toSize)
        const midY = from.y + dy / 2
        return `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`
      }
    },
    [getNodeSize]
  )

  const getStatusColor = (status?: CircuitNode["status"]) => {
    switch (status) {
      case "active":
        return "rgba(237, 237, 243, 0.9)"
      case "processing":
        return "rgba(237, 237, 243, 0.7)"
      case "error":
        return "rgba(195, 195, 204, 0.6)"
      default:
        return computedNodeColor
    }
  }

  return (
    <div
      ref={boardRef}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
      {...props}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Grid pattern */}
          {showGrid && (
            <pattern
              id="circuitGrid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={gridSize / 2} cy={gridSize / 2} r="0.5" fill={computedGridColor} />
            </pattern>
          )}

          {/* Animated gradient for electricity effect */}
          {connections.map((conn, i) => (
            <linearGradient
              key={`gradient-${i}`}
              id={`electricGradient-${i}`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="transparent" />
              <stop offset="50%" stopColor={conn.pulseColor || computedPulseColor} />
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid background */}
        {showGrid && (
          <rect width={width} height={height} fill="url(#circuitGrid)" />
        )}

        {/* Connection traces */}
        {connections.map((conn, i) => {
          const fromNode = nodeMap.get(conn.from)
          const toNode = nodeMap.get(conn.to)
          if (!fromNode || !toNode) return null

          const path = calculatePath(fromNode, toNode)
          const pathLength = 500 // Approximate path length for animation

          return (
            <g key={`connection-${i}`}>
              {/* Base trace */}
              <motion.path
                d={path}
                fill="none"
                stroke={conn.color || computedTraceColor}
                strokeWidth={traceWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: show ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: i * 0.2 }}
              />

              {/* Animated electricity pulse */}
              {show && !reduceMotion && conn.animated !== false && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={conn.pulseColor || computedPulseColor}
                  strokeWidth={traceWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${pathLength * 0.1} ${pathLength * 0.9}`}
                  initial={{ strokeDashoffset: pathLength }}
                  animate={{ strokeDashoffset: -pathLength }}
                  transition={{
                    duration: pulseSpeed,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                />
              )}

              {/* Bidirectional pulse */}
              {show && !reduceMotion && conn.bidirectional && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={conn.pulseColor || computedPulseColor}
                  strokeWidth={traceWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${pathLength * 0.1} ${pathLength * 0.9}`}
                  initial={{ strokeDashoffset: -pathLength }}
                  animate={{ strokeDashoffset: pathLength }}
                  transition={{
                    duration: pulseSpeed,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3 + pulseSpeed / 2,
                  }}
                />
              )}


            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const size = getNodeSize(node.size)
        const statusColor = getStatusColor(node.status)

        return (
          <motion.div
            key={node.id}
            className="absolute flex items-center justify-center"
            style={{
              left: node.x - size / 2,
              top: node.y - size / 2,
              width: size,
              height: size,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: i * 0.1 + 0.5, type: "spring" }}
          >
            {/* Node background with pulse */}
            <motion.div
              className="absolute inset-0 rounded-card"
              style={{ backgroundColor: statusColor }}
              animate={
                node.status === "processing" && !reduceMotion
                  ? { opacity: [0.2, 0.5, 0.2] }
                  : { opacity: 0.2 }
              }
              transition={
                node.status === "processing" && !reduceMotion
                  ? { duration: 1.5, repeat: Infinity }
                  : {}
              }
            />

            {/* Node border */}
            <div
              className="absolute inset-0 rounded-card border-2"
              style={{ borderColor: statusColor }}
            />

            {/* Node content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {node.icon && (
                <div style={{ color: statusColor }}>{node.icon}</div>
              )}
            </div>

            {/* Label */}
            {node.label && (
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
                style={{ color: "#ededf3" }}
              >
                {node.label}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
