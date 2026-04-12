"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Terminal as TerminalIcon, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TerminalLine {
  id: string
  text: string
  type: 'SYSTEM' | 'FRIENDLY' | 'UNKNOWN' | 'HOSTILE' | 'COMMAND'
  timestamp: string
}

interface TacticalTerminalProps {
  signals: any[]
  className?: string
}

export function TacticalTerminal({ signals, className }: TacticalTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init',
      text: 'SANKETRAKSHAK TACTICAL OS V8.2.4 BOOT COMPLETE...',
      type: 'SYSTEM',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'init-2',
      text: 'NEURAL LINK ESTABLISHED. UPLINK STABILITY: 99.8%',
      type: 'SYSTEM',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Echo new signals to terminal with expanded history
  useEffect(() => {
    if (signals.length > 0) {
      const latest = signals[0]
      const newLine: TerminalLine = {
        id: Math.random().toString(36).substr(2, 9),
        text: `INTERCEPT: [${latest.source_ip}] -> SECTOR: ${latest.location.sector} -> CLASSIFICATION: ${latest.classification}`,
        type: latest.classification as any,
        timestamp: new Date().toLocaleTimeString()
      }
      setLines(prev => [...prev, newLine].slice(-250)) // Increased terminal buffer to 250
    }
  }, [signals])

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [lines])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userLine: TerminalLine = {
      id: Math.random().toString(36).substr(2, 9),
      text: input,
      type: 'COMMAND',
      timestamp: new Date().toLocaleTimeString()
    }

    setLines(prev => [...prev, userLine].slice(-250))
    
    // Simple command simulation
    setTimeout(() => {
      let response = 'COMMAND NOT RECOGNIZED. ACCESS DENIED.'
      if (input.toLowerCase() === 'help') response = 'AVAILABLE: STATUS, RECON, FLUSH, BYPASS'
      if (input.toLowerCase() === 'status') response = 'ALL SYSTEMS GREEN. UPLINK ACTIVE.'
      
      setLines(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        text: `SYS_RESP: ${response}`,
        type: 'SYSTEM',
        timestamp: new Date().toLocaleTimeString()
      }].slice(-250))
    }, 400)

    setInput('')
  }

  const getLineColor = (type: string) => {
    switch (type) {
      case 'FRIENDLY': return 'text-[#00FF41]'
      case 'UNKNOWN': return 'text-[#FFD700]'
      case 'HOSTILE': return 'text-[#FF3B4A]'
      case 'COMMAND': return 'text-primary'
      default: return 'text-primary/60'
    }
  }

  return (
    <div className={cn(
      "glass-panel flex flex-col transition-all duration-500 overflow-hidden",
      isExpanded ? "h-[500px]" : "h-64",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-2 bg-primary/10 border-b border-primary/20 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Tactical Command Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-primary/40 uppercase animate-pulse">Live Link: active</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary/40 hover:text-primary transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4 font-mono text-[11px] bg-black/40">
        <div className="space-y-1.5">
          {lines.map((line) => (
            <div key={line.id} className="flex gap-4 group">
              <span className="text-white/20 shrink-0 select-none">[{line.timestamp}]</span>
              <span className={cn("break-all leading-relaxed", getLineColor(line.type))}>
                {line.type === 'COMMAND' && '> '}
                {line.text}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleCommand} className="flex items-center px-4 py-2 bg-black/60 border-t border-primary/10 shrink-0">
        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER TACTICAL COMMAND..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-mono text-primary placeholder:text-primary/20 ml-2 uppercase"
        />
      </form>
    </div>
  )
}
