"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SourceIntelligence } from '@/lib/types'
import { Network, ShieldAlert, Clock, Target, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SourceAttributionPanelProps {
  sources: SourceIntelligence[]
}

export function SourceAttributionPanel({ sources }: SourceAttributionPanelProps) {
  return (
    <Card className="bg-[#0A0E27]/40 border-primary/10 backdrop-blur-xl flex flex-col min-h-0 shadow-2xl">
      <CardHeader className="p-4 border-b border-primary/10 bg-primary/5">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
          <Network className="w-4 h-4" />
          Sector Origin Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {sources.length === 0 ? (
              <div className="h-24 flex flex-col items-center justify-center gap-2 opacity-30">
                <Info className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Triangulating Link...</span>
              </div>
            ) : (
              sources.map((source) => (
                <div 
                  key={source.ip} 
                  className={cn(
                    "p-4 rounded-sm border transition-all group animate-in zoom-in-95 duration-500",
                    source.hostileCount > 0 
                      ? "border-destructive/20 bg-destructive/[0.03] hover:bg-destructive/[0.06] animate-border-glow" 
                      : "border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.05]"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] data-value font-bold text-primary group-hover:text-accent group-hover:glow-text-phosphor transition-all">
                        {source.ip}
                      </span>
                      <span className="text-[9px] label-tactical flex items-center gap-1.5 lowercase">
                        <Target className="w-3 h-3 text-primary/50" /> {source.sector}
                      </span>
                    </div>
                    {source.hostileCount > 0 ? (
                      <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive bg-destructive/10 animate-pulse glow-text-phosphor">
                        {source.hostileCount} INIMICAL
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] border-[#00FF41]/30 text-[#00FF41] bg-[#00FF41]/10 glow-text-phosphor">
                        VERIFIED
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-primary/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] label-tactical">Last Detect</span>
                      <span className="text-[10px] data-value text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground/50" /> {new Date(source.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex flex-col text-right gap-1">
                      <span className="text-[8px] label-tactical">Node Confidence</span>
                      <span className="text-[11px] data-value font-bold text-accent">{(source.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}