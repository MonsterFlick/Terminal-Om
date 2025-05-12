"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/context/ThemeContext"
import ResourceMonitor from "./ResourceMonitor"
import {
  TerminalIcon,
  HelpCircle,
  Info,
  Star,
  Cpu,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Github,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  Command,
  BarChart3,
  Coffee,
  Award,
  Code,
  Cloud,
  Sparkles,
} from "lucide-react"
import { getRandomJoke, getRandomCatFact } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Tooltip } from "./ui/Tooltip"

// Command history persistence
const STORAGE_KEY = "terminal_history"

type CommandOutput = {
  id: number
  type: "command" | "response" | "error" | "system" | "ascii" | "resource" | "help" | "loading"
  content: string | React.ReactNode
  timestamp: Date
}

const Terminal = () => {
  const { theme, toggleTheme } = useTheme()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<CommandOutput[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showResourceMonitor, setShowResourceMonitor] = useState(false)
  const [isSuperMode, setIsSuperMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [cursorBlink, setCursorBlink] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [terminalMinimized, setTerminalMinimized] = useState(false)

  // Welcome message with ASCII art
  const welcomeMessage = [
    "┌─────────────────────────────────────────────────────────────────────────┐",
    "│                                                                         │",
    "│   ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗         │",
    "│   ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║         │",
    "│      ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║         │",
    "│      ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║         │",
    "│      ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗    │",
    "│      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝    │",
    "│                                                                         │",
    "└─────────────────────────────────────────────────────────────────────────┘",
    "",
    "Welcome to Terminal Pro. Type 'help' to see available commands.",
    "Version 2.0.0 - Professional Edition",
  ].join("\n")

  // Initialize with welcome message
  useEffect(() => {
    if (showWelcome) {
      setHistory([
        {
          id: Date.now(),
          type: "ascii",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ])
      setShowWelcome(false)
    }
  }, [showWelcome, welcomeMessage])

  // Load command history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY)
    if (savedHistory) {
      try {
        setCommandHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse command history", e)
      }
    }
  }, [])

  // Save command history to localStorage
  useEffect(() => {
    if (commandHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(commandHistory))
    }
  }, [commandHistory])

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Focus input on click
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current && !terminalMinimized) {
        inputRef.current.focus()
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [terminalMinimized])

  // Handle fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isFullscreen])

  // Play sound effect
  const playSound = useCallback(
    (soundType: "command" | "error" | "success") => {
      if (isMuted) return

      const sounds = {
        command: new Audio("/sounds/key-press.mp3"),
        error: new Audio("/sounds/error.mp3"),
        success: new Audio("/sounds/success.mp3"),
      }

      const sound = sounds[soundType]
      sound.volume = 0.2
      sound.play().catch((e) => console.error("Failed to play sound", e))
    },
    [isMuted],
  )

  // Add command to history
  const addToHistory = useCallback((output: CommandOutput) => {
    setHistory((prev) => [...prev, output])
  }, [])

  // Add loading indicator
  const addLoadingIndicator = useCallback(() => {
    const loadingId = Date.now()
    addToHistory({
      id: loadingId,
      type: "loading",
      content: "Processing...",
      timestamp: new Date(),
    })
    return loadingId
  }, [addToHistory])

  // Remove loading indicator
  const removeLoadingIndicator = useCallback((loadingId: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== loadingId))
  }, [])

  // Process command
  const processCommand = useCallback(
    async (cmd: string) => {
      const command = cmd.trim().toLowerCase()
      const args = command.split(" ")
      const mainCommand = args[0]

      // Add command to history
      addToHistory({
        id: Date.now(),
        type: "command",
        content: `${isSuperMode ? "# " : "$ "}${cmd}`,
        timestamp: new Date(),
      })

      playSound("command")

      // Update command history for up/down navigation
      if (command) {
        setCommandHistory((prev) => {
          // Don't add duplicate consecutive commands
          if (prev.length > 0 && prev[prev.length - 1] === command) {
            return prev
          }
          // Limit history to 50 commands
          const newHistory = [...prev, command]
          if (newHistory.length > 50) {
            return newHistory.slice(newHistory.length - 50)
          }
          return newHistory
        })
        setHistoryIndex(-1)
      }

      // Process commands
      switch (mainCommand) {
        case "help":
          displayHelp()
          break

        case "clear":
        case "cls":
          setHistory([])
          break

        case "about":
          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="space-y-3 p-3 bg-slate-800/50 rounded-md border border-slate-700">
                <h3 className="text-slate-100 font-semibold text-lg flex items-center gap-2">
                  <Info size={16} className="text-cyan-400" />
                  About Terminal Pro
                </h3>
                <p className="text-slate-300">
                  Terminal Pro is a sophisticated, browser-based terminal interface designed for professionals. Built
                  with modern web technologies, it provides a seamless and intuitive command-line experience.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <p className="text-slate-400 font-medium">Version</p>
                    <p className="text-slate-300">2.0.0 Professional</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Framework</p>
                    <p className="text-slate-300">Next.js + React</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">UI Library</p>
                    <p className="text-slate-300">Framer Motion</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Deployment</p>
                    <p className="text-slate-300">Vercel</p>
                  </div>
                </div>
              </div>
            ),
            timestamp: new Date(),
          })
          break

        case "joke":
          const loadingId = addLoadingIndicator()
          try {
            const joke = await getRandomJoke()
            removeLoadingIndicator(loadingId)
            addToHistory({
              id: Date.now(),
              type: "response",
              content: (
                <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                  <p className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                    <Sparkles size={16} />
                    Random Joke
                  </p>
                  <p className="text-slate-300">{joke}</p>
                </div>
              ),
              timestamp: new Date(),
            })
            playSound("success")
          } catch (error) {
            removeLoadingIndicator(loadingId)
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: Failed to fetch joke data. Please try again later.",
              timestamp: new Date(),
            })
            playSound("error")
          }
          break

        case "catfacts":
        case "catfact":
          const catLoadingId = addLoadingIndicator()
          try {
            const fact = await getRandomCatFact()
            removeLoadingIndicator(catLoadingId)
            addToHistory({
              id: Date.now(),
              type: "response",
              content: (
                <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                  <p className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <Sparkles size={16} />
                    Cat Fact
                  </p>
                  <p className="text-slate-300">{fact}</p>
                </div>
              ),
              timestamp: new Date(),
            })
            playSound("success")
          } catch (error) {
            removeLoadingIndicator(catLoadingId)
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: Failed to fetch cat fact data. Please try again later.",
              timestamp: new Date(),
            })
            playSound("error")
          }
          break

        case "resource_monitor":
        case "resources":
        case "monitor":
          setShowResourceMonitor(!showResourceMonitor)
          addToHistory({
            id: Date.now(),
            type: "system",
            content: `System resource monitor ${showResourceMonitor ? "hidden" : "displayed"}.`,
            timestamp: new Date(),
          })
          break

        case "super":
          setIsSuperMode(!isSuperMode)
          addToHistory({
            id: Date.now(),
            type: "system",
            content: (
              <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                <p
                  className={cn(
                    "font-medium mb-2 flex items-center gap-2",
                    isSuperMode ? "text-red-400" : "text-emerald-400",
                  )}
                >
                  <Star size={16} />
                  {isSuperMode ? "Advanced Mode Deactivated" : "Advanced Mode Activated"}
                </p>
                <p className="text-slate-300">
                  {isSuperMode
                    ? "Returning to standard operation mode."
                    : "Advanced features are now available. Type 'help' to see additional commands."}
                </p>
              </div>
            ),
            timestamp: new Date(),
          })
          playSound("success")
          break

        case "theme":
          toggleTheme()
          addToHistory({
            id: Date.now(),
            type: "system",
            content: `Theme switched to ${theme === "dark" ? "light" : "dark"} mode.`,
            timestamp: new Date(),
          })
          break

        case "mute":
          setIsMuted(!isMuted)
          addToHistory({
            id: Date.now(),
            type: "system",
            content: `Sound effects ${isMuted ? "unmuted" : "muted"}.`,
            timestamp: new Date(),
          })
          break

        case "weather":
          const cities = ["New York", "London", "Tokyo", "Sydney", "Moscow", "Rio de Janeiro"]
          const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorms", "Snow", "Fog"]
          const temperatures = Array.from({ length: 50 }, (_, i) => i - 10) // -10 to 39°C

          const randomCity = cities[Math.floor(Math.random() * cities.length)]
          const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
          const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)]

          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                <p className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                  <Cloud size={16} />
                  Weather Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="text-slate-200">{randomCity}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Condition</p>
                    <p className="text-slate-200">{randomCondition}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Temperature</p>
                    <p className="text-slate-200">
                      {randomTemp}°C / {Math.round((randomTemp * 9) / 5 + 32)}°F
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Updated</p>
                    <p className="text-slate-200">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">
                  Note: This is simulated weather data for demonstration purposes.
                </p>
              </div>
            ),
            timestamp: new Date(),
          })
          break

        case "github":
          window.open("https://github.com/yourusername/terminal-pro", "_blank")
          addToHistory({
            id: Date.now(),
            type: "system",
            content: "Opening GitHub repository in a new tab...",
            timestamp: new Date(),
          })
          break

        case "fullscreen":
          setIsFullscreen(!isFullscreen)
          addToHistory({
            id: Date.now(),
            type: "system",
            content: `Fullscreen mode ${isFullscreen ? "disabled" : "enabled"}.`,
            timestamp: new Date(),
          })
          break

        // Super mode commands
        case "matrix":
          if (!isSuperMode) {
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: This command requires advanced mode. Type 'super' to activate it.",
              timestamp: new Date(),
            })
            playSound("error")
            break
          }

          addToHistory({
            id: Date.now(),
            type: "ascii",
            content: Array.from({ length: 15 }, () =>
              Array.from({ length: 50 }, () => (Math.random() > 0.5 ? "1" : "0")).join(" "),
            ).join("\n"),
            timestamp: new Date(),
          })

          addToHistory({
            id: Date.now(),
            type: "system",
            content: "Matrix simulation initialized.",
            timestamp: new Date(),
          })
          break

        case "coffee":
          if (!isSuperMode) {
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: This command requires advanced mode. Type 'super' to activate it.",
              timestamp: new Date(),
            })
            playSound("error")
            break
          }

          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 flex items-center gap-4">
                <div className="text-amber-400 text-4xl">
                  <Coffee size={48} />
                </div>
                <div>
                  <h3 className="text-slate-100 font-medium">Coffee Break Initiated</h3>
                  <p className="text-slate-300">Productivity optimization in progress...</p>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </div>
              </div>
            ),
            timestamp: new Date(),
          })

          setTimeout(() => {
            addToHistory({
              id: Date.now(),
              type: "system",
              content: "Coffee break complete. Productivity increased by 42%.",
              timestamp: new Date(),
            })
          }, 3000)
          break

        case "visualize":
          if (!isSuperMode) {
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: This command requires advanced mode. Type 'super' to activate it.",
              timestamp: new Date(),
            })
            playSound("error")
            break
          }

          document.body.classList.add("visualize-mode")
          setTimeout(() => {
            document.body.classList.remove("visualize-mode")
          }, 5000)

          addToHistory({
            id: Date.now(),
            type: "system",
            content: "Data visualization mode activated.",
            timestamp: new Date(),
          })
          break

        case "award":
          if (!isSuperMode) {
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: This command requires advanced mode. Type 'super' to activate it.",
              timestamp: new Date(),
            })
            playSound("error")
            break
          }

          const awards = [
            "Excellence in Terminal Operations",
            "Distinguished Command Line Expert",
            "Advanced System Navigation Specialist",
            "Premier Interface Utilization Award",
            "Command Execution Mastery",
            "Terminal Proficiency Certification",
            "Advanced User Recognition",
          ]

          const randomAward = awards[Math.floor(Math.random() * awards.length)]

          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-center">
                <div className="inline-block p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-3">
                  <Award size={32} className="text-white" />
                </div>
                <h3 className="text-slate-100 font-semibold text-lg">Certificate of Achievement</h3>
                <p className="text-amber-400 font-medium my-2">"{randomAward}"</p>
                <p className="text-slate-300 text-sm">
                  This certificate recognizes your exceptional proficiency in terminal operations.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-700 text-slate-400 text-xs">
                  Certificate ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </div>
              </div>
            ),
            timestamp: new Date(),
          })
          break

        default:
          if (command === "") {
            // Just add a new line for empty commands
            break
          }

          addToHistory({
            id: Date.now(),
            type: "error",
            content: `Error: Command not found: ${command}. Type 'help' to see available commands.`,
            timestamp: new Date(),
          })
          playSound("error")
          break
      }
    },
    [
      addLoadingIndicator,
      addToHistory,
      isMuted,
      isSuperMode,
      isFullscreen,
      playSound,
      removeLoadingIndicator,
      showResourceMonitor,
      theme,
      toggleTheme,
    ],
  )

  // Display help
  const displayHelp = useCallback(() => {
    const standardCommands = [
      { command: "help", description: "Display available commands", icon: <HelpCircle size={14} /> },
      { command: "clear", description: "Clear the terminal", icon: <Trash2 size={14} /> },
      { command: "about", description: "About Terminal Pro", icon: <Info size={14} /> },
      { command: "joke", description: "Display a random joke", icon: <Sparkles size={14} /> },
      { command: "catfacts", description: "Learn a random cat fact", icon: <Sparkles size={14} /> },
      { command: "resource_monitor", description: "Toggle system resource monitor", icon: <BarChart3 size={14} /> },
      { command: "weather", description: "Get weather information", icon: <Cloud size={14} /> },
      { command: "theme", description: "Toggle light/dark theme", icon: <Sun size={14} /> },
      { command: "mute", description: "Toggle sound effects", icon: <Volume2 size={14} /> },
      { command: "fullscreen", description: "Toggle fullscreen mode", icon: <Maximize2 size={14} /> },
      { command: "github", description: "Visit the GitHub repository", icon: <Github size={14} /> },
      { command: "super", description: "Toggle advanced mode", icon: <Star size={14} /> },
    ]

    const superCommands = [
      { command: "matrix", description: "Display matrix simulation", icon: <Code size={14} /> },
      { command: "coffee", description: "Take a coffee break", icon: <Coffee size={14} /> },
      { command: "visualize", description: "Activate visualization mode", icon: <BarChart3 size={14} /> },
      { command: "award", description: "Generate achievement certificate", icon: <Award size={14} /> },
    ]

    addToHistory({
      id: Date.now(),
      type: "help",
      content: (
        <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
          <h3 className="text-slate-100 font-semibold mb-3 flex items-center gap-2">
            <Command size={16} className="text-cyan-400" />
            Available Commands
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-slate-300 font-medium text-sm mb-2 border-b border-slate-700 pb-1">
                Standard Commands
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {standardCommands.map((cmd) => (
                  <div key={cmd.command} className="flex items-center gap-2">
                    <div className="text-slate-500">{cmd.icon}</div>
                    <span className="text-cyan-400 font-mono text-sm w-32 truncate">{cmd.command}</span>
                    <span className="text-slate-300 text-sm">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {isSuperMode && (
              <div>
                <h4 className="text-slate-300 font-medium text-sm mb-2 border-b border-slate-700 pb-1">
                  Advanced Commands
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {superCommands.map((cmd) => (
                    <div key={cmd.command} className="flex items-center gap-2">
                      <div className="text-slate-500">{cmd.icon}</div>
                      <span className="text-purple-400 font-mono text-sm w-32 truncate">{cmd.command}</span>
                      <span className="text-slate-300 text-sm">{cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
            <ChevronRight size={12} />
            Use up/down arrows to navigate command history and Tab for command completion.
          </p>
        </div>
      ),
      timestamp: new Date(),
    })
  }, [addToHistory, isSuperMode])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isTyping) return

    const command = input.trim()
    processCommand(command)
    setInput("")
  }

  // Handle key navigation through command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "")
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "")
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple tab completion
      const commands = [
        "help",
        "clear",
        "about",
        "joke",
        "catfacts",
        "resource_monitor",
        "weather",
        "theme",
        "mute",
        "github",
        "super",
        "fullscreen",
        "matrix",
        "coffee",
        "visualize",
        "award",
      ]

      if (input) {
        const matches = commands.filter((cmd) => cmd.startsWith(input.toLowerCase()))
        if (matches.length === 1) {
          setInput(matches[0])
        } else if (matches.length > 1) {
          addToHistory({
            id: Date.now(),
            type: "system",
            content: `Possible completions: ${matches.join(", ")}`,
            timestamp: new Date(),
          })
        }
      }
    }
  }

  // Toggle terminal minimize state
  const toggleMinimize = () => {
    setTerminalMinimized(!terminalMinimized)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        height: terminalMinimized ? "auto" : "auto",
        width: isFullscreen ? "100%" : "100%",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 50 : 10,
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-slate-700/50 backdrop-blur-sm",
        theme === "dark" ? "bg-slate-900/90" : "bg-white/90",
      )}
    >
      {/* Terminal header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <Tooltip content="Close">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" />
            </Tooltip>
            <Tooltip content={terminalMinimized ? "Expand" : "Minimize"}>
              <div
                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"
                onClick={toggleMinimize}
              />
            </Tooltip>
            <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <div
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </Tooltip>
          </div>
          <div
            className={cn(
              "font-medium flex items-center gap-2",
              theme === "dark" ? "text-slate-300" : "text-slate-700",
            )}
          >
            <TerminalIcon size={14} className="text-cyan-500" />
            <span>terminal-pro</span>
            {isSuperMode && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                Advanced
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={isMuted ? "Unmute" : "Mute"}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-700",
              )}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </Tooltip>
          <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
            <button
              onClick={toggleTheme}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-700",
              )}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </Tooltip>
          <Tooltip content="Settings">
            <button
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-700",
              )}
            >
              <Settings size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Clear terminal">
            <button
              onClick={() => setHistory([])}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-700",
              )}
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
          <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-700",
              )}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Terminal content */}
      {!terminalMinimized && (
        <div className="flex flex-col md:flex-row">
          <div
            ref={terminalRef}
            className={cn(
              "flex-1 p-4 overflow-y-auto font-mono text-sm h-[70vh] md:h-[60vh]",
              theme === "dark" ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800",
            )}
          >
            <AnimatePresence mode="popLayout">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "mb-3",
                    item.type === "command" && (theme === "dark" ? "text-cyan-400" : "text-cyan-600"),
                    item.type === "error" && "text-red-400",
                    item.type === "system" && (theme === "dark" ? "text-slate-400" : "text-slate-600"),
                    item.type === "ascii" && "whitespace-pre font-mono text-cyan-400",
                    item.type === "loading" && "text-slate-500 animate-pulse",
                    item.type === "help" && "text-slate-200",
                    item.type === "resource" && "w-full",
                  )}
                >
                  {item.type === "loading" ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{item.content}</span>
                    </div>
                  ) : (
                    item.content
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex items-center mt-2">
              <span className={cn("mr-2", isSuperMode ? "text-purple-400" : "text-cyan-400")}>
                {isSuperMode ? "#" : "$"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "flex-1 bg-transparent border-none outline-none",
                  theme === "dark" ? "text-slate-200 caret-cyan-400" : "text-slate-800 caret-cyan-600",
                )}
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
              <span
                className={cn(
                  "w-2 h-5 ml-px transition-opacity duration-150",
                  cursorBlink ? "opacity-100" : "opacity-0",
                  isSuperMode ? "bg-purple-400" : "bg-cyan-400",
                )}
              ></span>
            </form>
          </div>

          {/* Resource monitor */}
          {showResourceMonitor && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "350px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "border-l p-4 overflow-hidden",
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200",
              )}
            >
              <ResourceMonitor />
            </motion.div>
          )}
        </div>
      )}

      {/* Terminal footer */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 text-xs border-t",
          theme === "dark"
            ? "bg-slate-800 border-slate-700 text-slate-400"
            : "bg-slate-100 border-slate-200 text-slate-600",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-cyan-500" />
            Terminal Pro v2.0.0
          </span>
          {isSuperMode && (
            <span className="flex items-center gap-1 text-purple-400">
              <Star size={12} />
              Advanced Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => processCommand("help")}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <HelpCircle size={12} />
            Help
          </button>
          <button
            onClick={() => processCommand("about")}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Info size={12} />
            About
          </button>
          <button
            onClick={() => processCommand("github")}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Github size={12} />
            GitHub
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Terminal

