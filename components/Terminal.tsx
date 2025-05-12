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
  User,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Linkedin,
  Globe,
  FileText,
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
    "Welcome to Om Thakur's Terminal. Type 'help' to see available commands.",
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

  // Initialize background music
  useEffect(() => {
    const audio = new Audio("/UNDERTALE - Spider Dance.mp3")
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    // Try to play and handle autoplay restrictions
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Autoplay prevented:", error)
      })
    }

    // Cleanup
    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  // Update mute state for background music
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

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
                  About Om Thakur
                </h3>
                <p className="text-slate-300">
                  Research-minded developer with a solid foundation in backend systems and AI/ML. Skilled in
                  experimentation, scalable system design, and collaborative problem-solving. Currently deepening
                  expertise in machine learning and passionate about impactful, real-world innovation through research.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <p className="text-slate-400 font-medium">Location</p>
                    <p className="text-slate-300">Mumbai, Maharashtra, India</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Email</p>
                    <p className="text-slate-300">omthakur2366@gmail.com</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Phone</p>
                    <p className="text-slate-300">7756898550</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Website</p>
                    <p className="text-slate-300">om-thakur.vercel.app</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <a
                    href="https://www.linkedin.com/in/omthakur2366"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </a>
                  <a
                    href="https://om-thakur.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-slate-700 transition-colors"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                </div>
              </div>
            ),
            timestamp: new Date(),
          })
          break

        case "resume":
        case "cv":
          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="space-y-4 p-4 bg-slate-800/50 rounded-md border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Om Thakur</h2>
                    <p className="text-slate-300">Research-minded Developer</p>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <p>Mumbai, Maharashtra, India</p>
                    <p>omthakur2366@gmail.com</p>
                    <p>7756898550</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-cyan-400 border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                    <Briefcase size={16} />
                    Experience
                  </h3>
                  <div className="ml-1 space-y-3">
                    <div>
                      <div className="flex justify-between">
                        <p className="font-medium text-slate-200">SDE (Internship)</p>
                        <p className="text-sm text-slate-400">August 2024 - February 2025</p>
                      </div>
                      <p className="text-sm text-slate-300">
                        Art of Living Digital (Sumeru technology solutions) | Bengaluru
                      </p>
                      <ul className="list-disc list-inside text-sm text-slate-400 mt-1 space-y-1">
                        <li>Conducted in-depth research on Drizzle ORM and Supabase Row-Level Security (RLS)</li>
                        <li>
                          Implemented message queue systems, reducing data synchronization time from 15 minutes to under
                          4 seconds
                        </li>
                        <li>Investigated architectural patterns for scalable notification systems</li>
                        <li>Led research and Root Cause Analysis (RCA) on Supabase database crashes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-cyan-400 border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                    <Code size={16} />
                    Projects
                  </h3>
                  <div className="ml-1 space-y-3">
                    <div>
                      <p className="font-medium text-slate-200">NeuraTalk – AI Chatbot with LLaMA2 on Streamlit</p>
                      <p className="text-sm text-slate-400">Mumbai University | monsterchat.streamlit.app/</p>
                      <ul className="list-disc list-inside text-sm text-slate-400 mt-1">
                        <li>Built an AI chatbot interface using Streamlit with LLaMA2 models</li>
                        <li>Enabled model selection and parameter fine-tuning</li>
                        <li>Engineered a debounce mechanism to optimize GPU usage</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-slate-200">Terminal-based Website</p>
                      <p className="text-sm text-slate-400">Hobby | om-thakur.vercel.app/</p>
                      <ul className="list-disc list-inside text-sm text-slate-400 mt-1">
                        <li>Designed and developed a terminal-style website that mimics command-line interfaces</li>
                        <li>Integrated AI-powered responses using Google Gemini API</li>
                        <li>Utilized Tailwind CSS to build responsive UI components</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-cyan-400 border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                    <GraduationCap size={16} />
                    Education
                  </h3>
                  <div className="ml-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-slate-200">Bachelor of Science - BS, Information Technology</p>
                      <p className="text-sm text-slate-400">April 2024</p>
                    </div>
                    <p className="text-sm text-slate-300">Sonubhau Baswant College | Mumbai, IN</p>
                    <p className="text-sm text-slate-400">GPA: 8.55</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-cyan-400 border-b border-slate-700 pb-1 mb-2 flex items-center gap-2">
                    <Star size={16} />
                    Skills
                  </h3>
                  <div className="ml-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Backend & API Development:</span> Deno, Supabase, PostgreSQL,
                      RESTful APIs
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Research & Experimentation:</span> System bottlenecks, RCA, scalable
                      architecture
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Generative AI & LLMs:</span> LLaMA2, Gemini, prompt engineering
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Web Technologies:</span> React, TypeScript, Tailwind CSS
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href="#"
                    className="px-3 py-1.5 bg-cyan-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-cyan-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      window.open("https://om-thakur.vercel.app", "_blank")
                    }}
                  >
                    <FileText size={14} />
                    View Full Resume
                  </a>
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
          } catch (error) {
            removeLoadingIndicator(loadingId)
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: Failed to fetch joke data. Please try again later.",
              timestamp: new Date(),
            })
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
          } catch (error) {
            removeLoadingIndicator(catLoadingId)
            addToHistory({
              id: Date.now(),
              type: "error",
              content: "Error: Failed to fetch cat fact data. Please try again later.",
              timestamp: new Date(),
            })
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
            content: `Background music ${isMuted ? "unmuted" : "muted"}.`,
            timestamp: new Date(),
          })
          break

        case "contact":
          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
                <h3 className="text-slate-100 font-semibold text-lg mb-3 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-md">
                    <div className="bg-cyan-500/20 p-2 rounded-full">
                      <Mail size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Email</p>
                      <a
                        href="mailto:omthakur2366@gmail.com"
                        className="text-slate-200 hover:text-cyan-400 transition-colors"
                      >
                        omthakur2366@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-md">
                    <div className="bg-purple-500/20 p-2 rounded-full">
                      <Phone size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Phone</p>
                      <a href="tel:7756898550" className="text-slate-200 hover:text-purple-400 transition-colors">
                        7756898550
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-md">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <Linkedin size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">LinkedIn</p>
                      <a
                        href="https://www.linkedin.com/in/omthakur2366"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-200 hover:text-blue-400 transition-colors"
                      >
                        in/omthakur2366
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-md">
                    <div className="bg-emerald-500/20 p-2 rounded-full">
                      <Globe size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Website</p>
                      <a
                        href="https://om-thakur.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-200 hover:text-emerald-400 transition-colors"
                      >
                        om-thakur.vercel.app
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ),
            timestamp: new Date(),
          })
          break

        case "projects":
          addToHistory({
            id: Date.now(),
            type: "response",
            content: (
              <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
                <h3 className="text-slate-100 font-semibold text-lg mb-3 flex items-center gap-2">
                  <Code size={16} className="text-cyan-400" />
                  Projects
                </h3>

                <div className="space-y-4">
                  <div className="p-3 bg-slate-700/30 rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-slate-100 font-medium">NeuraTalk – AI Chatbot with LLaMA2</h4>
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                        Mumbai University
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      Built an AI chatbot interface using Streamlit, enabling real-time conversations with LLaMA2 models
                      hosted via Replicate.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href="https://monsterchat.streamlit.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Globe size={12} />
                        Live Demo
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-700/30 rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-slate-100 font-medium">Terminal-based Website</h4>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Hobby</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      Designed and developed a terminal-style website that mimics command-line interfaces to deliver an
                      engaging, interactive user experience.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href="https://om-thakur.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Globe size={12} />
                        Live Demo
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-700/30 rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-slate-100 font-medium">Salary-Prediction</h4>
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                        Mumbai University
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      Developed a regression model in Python that predicted employee salaries with over 85% accuracy.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href="https://github.com/MonsterFlick/Salary-Prediction"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Github size={12} />
                        GitHub
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-700/30 rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-slate-100 font-medium">IPL Data Analysis – Auction Strategy</h4>
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                        Mumbai University
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      Analyzed 15+ years of IPL match data using SQL to support data-driven auction strategies for a new
                      franchise.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href="https://github.com/MonsterFlick/IPL-AUCTION"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Github size={12} />
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ),
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
          window.open("https://github.com/MonsterFlick", "_blank")
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
          break
      }
    },
    [
      addLoadingIndicator,
      addToHistory,
      isMuted,
      isSuperMode,
      isFullscreen,
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
      { command: "about", description: "About Om Thakur", icon: <Info size={14} /> },
      { command: "resume", description: "View resume/CV", icon: <FileText size={14} /> },
      { command: "contact", description: "Contact information", icon: <User size={14} /> },
      { command: "projects", description: "View projects", icon: <Code size={14} /> },
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
        "resume",
        "contact",
        "projects",
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
            <span>om-thakur-terminal</span>
            {isSuperMode && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                Advanced
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={isMuted ? "Unmute Music" : "Mute Music"}>
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
