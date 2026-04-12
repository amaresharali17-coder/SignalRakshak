"use client"

import React, { useState, useEffect } from 'react'
import { Server, Activity, Cpu, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SystemHealthHUD() {
  const [metrics, setMetrics] = useState({
    cpu: 23,
    latency: 5.2,
    uptime: 0
  })

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      setMetrics({
        cpu: 20 + Math.random() * 15,
        latency: 4.8 + Math.random() * 1.5,
        uptime: Math.floor((Date.now() - start) / 1000)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-sm">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground uppercase leading-none mb-1">Grid Health</span>
          <div className="flex items-center gap-1.5">
             <ShieldCheck className="w-3 h-3 text-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-500 tracking-widest">OPERATIONAL</span>
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-primary/20" />

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground uppercase leading-none mb-1">Latency</span>
          <div className="flex items-center gap-1.5">
             <Activity className="w-3 h-3 text-accent" />
             <span className="text-[10px] font-mono text-accent">{metrics.latency.toFixed(1)}ms</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground uppercase leading-none mb-1">Neural Load</span>
          <div className="flex items-center gap-1.5">
             <Cpu className="w-3 h-3 text-primary" />
             <span className="text-[10px] font-mono text-primary">{metrics.cpu.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-primary/20" />

      <div className="flex flex-col min-w-[60px]">
        <span className="text-[8px] text-muted-foreground uppercase leading-none mb-1">Uptime</span>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {Math.floor(metrics.uptime / 60).toString().padStart(2, '0')}:
          {(metrics.uptime % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
