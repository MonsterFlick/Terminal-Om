"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeContext"
import { Cpu, HardDrive, MemoryStickIcon as Memory, Zap, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

// Generate random resource usage data
const generateResourceData = () => {
  return {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    network: Math.floor(Math.random() * 100),
  }
}

// Generate random process data
const generateProcesses = () => {
  const processes = [
    { name: "terminal.service", cpu: Math.floor(Math.random() * 30), memory: Math.floor(Math.random() * 500) },
    { name: "api.service", cpu: Math.floor(Math.random() * 20), memory: Math.floor(Math.random() * 300) },
    { name: "data.service", cpu: Math.floor(Math.random() * 15), memory: Math.floor(Math.random() * 200) },
    { name: "monitor.service", cpu: Math.floor(Math.random() * 25), memory: Math.floor(Math.random() * 400) },
    { name: "system.service", cpu: Math.floor(Math.random() * 10), memory: Math.floor(Math.random() * 150) },
    { name: "background.service", cpu: Math.floor(Math.random() * 50), memory: Math.floor(Math.random() * 800) },
  ]

  // Sort by CPU usage
  return processes.sort((a, b) => b.cpu - a.cpu)
}

const ResourceMonitor = () => {
  const { theme } = useTheme()
  const [resources, setResources] = useState(generateResourceData())
  const [processes, setProcesses] = useState(generateProcesses())
  const [history, setHistory] = useState<number[][]>([])

  // Update resource data every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newResources = generateResourceData()
      setResources(newResources)

      // Update history for the chart
      setHistory((prev) => {
        const newHistory = [...prev, [newResources.cpu, newResources.memory, newResources.disk, newResources.network]]
        if (newHistory.length > 20) {
          return newHistory.slice(newHistory.length - 20)
        }
        return newHistory
      })

      // Update processes less frequently
      if (Math.random() > 0.7) {
        setProcesses(generateProcesses())
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Get color based on usage
  const getUsageColor = (usage: number) => {
    if (usage < 30) return "bg-emerald-500"
    if (usage < 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h2
        className={cn(
          "text-base font-medium flex items-center gap-2",
          theme === "dark" ? "text-slate-200" : "text-slate-800",
        )}
      >
        <BarChart3 size={16} className="text-cyan-500" />
        System Resources
      </h2>

      {/* Resource usage bars */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs flex items-center gap-1 text-slate-400">
              <Cpu size={12} />
              CPU Usage
            </span>
            <span className="text-xs font-medium text-slate-300">{resources.cpu}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${getUsageColor(resources.cpu)}`}
              initial={{ width: 0 }}
              animate={{ width: `${resources.cpu}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs flex items-center gap-1 text-slate-400">
              <Memory size={12} />
              Memory Usage
            </span>
            <span className="text-xs font-medium text-slate-300">{resources.memory}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${getUsageColor(resources.memory)}`}
              initial={{ width: 0 }}
              animate={{ width: `${resources.memory}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs flex items-center gap-1 text-slate-400">
              <HardDrive size={12} />
              Disk Usage
            </span>
            <span className="text-xs font-medium text-slate-300">{resources.disk}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${getUsageColor(resources.disk)}`}
              initial={{ width: 0 }}
              animate={{ width: `${resources.disk}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs flex items-center gap-1 text-slate-400">
              <Zap size={12} />
              Network Activity
            </span>
            <span className="text-xs font-medium text-slate-300">{resources.network}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${getUsageColor(resources.network)}`}
              initial={{ width: 0 }}
              animate={{ width: `${resources.network}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Resource usage chart */}
      <div className="mt-4">
        <h3
          className={cn(
            "text-xs font-medium mb-2 text-slate-400",
            theme === "dark" ? "text-slate-400" : "text-slate-600",
          )}
        >
          Usage History
        </h3>
        <div className="w-full h-24 bg-slate-800/50 rounded-md relative overflow-hidden border border-slate-700/50">
          {history.length > 0 && (
            <>
              {/* CPU line */}
              <svg className="w-full h-full absolute top-0 left-0">
                <polyline
                  points={history
                    .map((point, i) => `${(i / (history.length - 1)) * 100}%,${100 - point[0]}%`)
                    .join(" ")}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Memory line */}
              <svg className="w-full h-full absolute top-0 left-0">
                <polyline
                  points={history
                    .map((point, i) => `${(i / (history.length - 1)) * 100}%,${100 - point[1]}%`)
                    .join(" ")}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Network line */}
              <svg className="w-full h-full absolute top-0 left-0">
                <polyline
                  points={history
                    .map((point, i) => `${(i / (history.length - 1)) * 100}%,${100 - point[3]}%`)
                    .join(" ")}
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="4 2"
                />
              </svg>
            </>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1 text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>CPU</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Memory</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <span>Network</span>
          </div>
        </div>
      </div>

      {/* Top processes */}
      <div className="mt-4">
        <h3
          className={cn(
            "text-xs font-medium mb-2 text-slate-400",
            theme === "dark" ? "text-slate-400" : "text-slate-600",
          )}
        >
          Active Processes
        </h3>
        <div
          className={cn(
            "text-xs rounded-md overflow-hidden border border-slate-700/50",
            theme === "dark" ? "bg-slate-800/50" : "bg-slate-200",
          )}
        >
          <div
            className={cn(
              "grid grid-cols-3 gap-2 px-3 py-2 font-medium",
              theme === "dark" ? "bg-slate-800" : "bg-slate-300",
            )}
          >
            <div>Process</div>
            <div>CPU %</div>
            <div>Memory MB</div>
          </div>
          {processes.map((process, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-3 gap-2 px-3 py-2",
                index % 2 === 0
                  ? theme === "dark"
                    ? "bg-slate-800/30"
                    : "bg-slate-200"
                  : theme === "dark"
                    ? "bg-slate-800/60"
                    : "bg-slate-100",
              )}
            >
              <div className="truncate font-mono">{process.name}</div>
              <div>{process.cpu}%</div>
              <div>{process.memory} MB</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResourceMonitor

