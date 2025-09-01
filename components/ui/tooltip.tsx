"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
}

export const Tooltip = ({ children, content, position = "top", delay = 300 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()

      let x = 0
      let y = 0

      switch (position) {
        case "top":
          x = rect.left + rect.width / 2
          y = rect.top - 5
          break
        case "bottom":
          x = rect.left + rect.width / 2
          y = rect.bottom + 5
          break
        case "left":
          x = rect.left - 5
          y = rect.top + rect.height / 2
          break
        case "right":
          x = rect.right + 5
          y = rect.top + rect.height / 2
          break
      }

      setTooltipPosition({ x, y })
    }
  }, [isVisible, position, isMounted])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsVisible(false)
  }

  const getTooltipStyles = () => {
    switch (position) {
      case "top":
        return {
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: "translate(-50%, -100%)",
        }
      case "bottom":
        return {
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: "translate(-50%, 0)",
        }
      case "left":
        return {
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: "translate(-100%, -50%)",
        }
      case "right":
        return {
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: "translate(0, -50%)",
        }
    }
  }

  return (
    <>
      <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline-block">
        {children}
      </div>

      {isMounted && (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{
                ...getTooltipStyles(),
                position: "fixed",
                zIndex: 100,
                pointerEvents: "none",
              }}
              className="whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 shadow-md"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}
