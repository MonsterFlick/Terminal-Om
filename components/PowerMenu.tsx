"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function PowerMenu() {
  const [isVisible, setIsVisible] = useState(false)
  const [time, setTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = () => {
    const hours = time.getHours().toString().padStart(2, "0")
    const minutes = time.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return (
    <>
      {/* Hover Trigger Area with pulsing animation */}
      <motion.div
        className="fixed top-0 left-0 w-full h-6 cursor-pointer z-50 flex justify-center items-center"
        onMouseEnter={() => setIsVisible(true)}
        whileHover={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <motion.div
          initial={{ opacity: 0.5, y: 2 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            y: [2, 4, 2],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "easeInOut",
          }}
          style={{ opacity: isVisible ? 0 : 1 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Power Menu */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-0 left-0 w-full flex justify-center items-start z-40"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseLeave={() => setIsVisible(false)}
          >
            {/* Menu Container */}
            <motion.div
              className="bg-zinc-800/90 backdrop-blur-md p-4 rounded-b-xl shadow-2xl flex items-center gap-4 border border-zinc-700/50"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors group"
                onClick={() => {
                  if (window.opener) {
                    window.close()
                  } else {
                    window.location.href = "about:blank"
                  }
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-red-400 group-hover:text-red-300 transition-colors"
                >
                  <path
                    d="M18.3601 6.64C19.6185 7.89879 20.4754 9.50244 20.8224 11.2482C21.1694 12.9939 20.991 14.8034 20.3098 16.4478C19.6285 18.0921 18.4749 19.4976 16.9949 20.4864C15.515 21.4752 13.775 22.0029 11.9951 22.0029C10.2152 22.0029 8.47527 21.4752 6.99529 20.4864C5.51532 19.4976 4.36176 18.0921 3.68049 16.4478C2.99921 14.8034 2.82081 12.9939 3.16784 11.2482C3.51487 9.50244 4.37174 7.89879 5.63012 6.64"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-1.5 rounded-md text-black font-medium">
                <span className="relative z-10 drop-shadow-sm">Git Fool</span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2,
                    ease: "linear",
                  }}
                />
              </div>

              <span className="text-gray-300 text-sm font-mono">
                <span className="text-gray-500 mr-1">⏱</span>
                {formatUptime()}
              </span>

              <div className="flex gap-2">
                {[
                  { icon: "🔒", tooltip: "Lock" },
                  { icon: "➡️", tooltip: "Logout" },
                  { icon: "🌙", tooltip: "Sleep" },
                  { icon: "⏸️", tooltip: "Pause" },
                  { icon: "🔄", tooltip: "Restart" },
                  { icon: "⏻", tooltip: "Power", highlight: true },
                ].map((btn, index) => (
                  <motion.button
                    key={index}
                    className={`relative p-2 rounded-lg ${
                      btn.highlight ? "bg-blue-500 hover:bg-blue-600" : "bg-zinc-700/80 hover:bg-zinc-600/80"
                    } transition-colors group`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{btn.icon}</span>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {btn.tooltip}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
