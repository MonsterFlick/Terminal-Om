"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const links = [
    { name: "Home", href: "https://omi.com", icon: "🏠" },
    { name: "Projects", href: "https://omi.com", icon: "🚀" },
    { name: "About", href: "https://omi.com", icon: "📘" },
    { name: "Contact", href: "https://omi.com", icon: "📧" },
  ]

  return (
    <>
      {/* Mobile navbar toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-zinc-800/80 backdrop-blur p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      {/* Mobile navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          >
            <div className="h-full w-4/5 ml-auto bg-zinc-900 p-8 flex flex-col justify-center">
              <ul className="space-y-6">
                {links.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-3 bg-opacity-80 text-base font-mono text-black rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: getColor(index),
                        clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                      }}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop navbar */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="hidden md:flex fixed top-0 right-0 h-full transition-all duration-300"
        style={{ width: isOpen ? "12rem" : "1.5rem" }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="w-1.5 h-full bg-gradient-to-b from-purple-500/20 to-cyan-500/20 backdrop-blur-sm" />

        <div
          className={`flex-1 flex-col justify-center items-center bg-zinc-900/80 backdrop-blur transition-all duration-300 overflow-hidden ${isOpen ? "flex px-4" : "hidden"}`}
        >
          <ul className="space-y-4 py-4 w-full">
            {links.map((link, index) => (
              <motion.li
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="relative block w-full">
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: getColor(index),
                      clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
                    }}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: hoveredIndex === index ? 1.05 : 1,
                      opacity: hoveredIndex === index ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="relative px-4 py-2 text-sm font-mono text-black flex items-center">
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  )
}

// Function to generate different colors
const getColor = (index: number) => {
  const colors = [
    "#A3E635", // Green
    "#C4B5FD", // Light Purple
    "#FBBF24", // Orange
    "#F472B6", // Pink
    "#FDE68A", // Yellow
    "#7DD3FC", // Light Blue
    "#F9A8D4", // Light Pink
    "#93C5FD", // Blue
  ]
  return colors[index % colors.length]
}

export default Navbar

