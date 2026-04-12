"use client"

import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Fingerprint, Plus, Download, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { SignalPattern } from '@/lib/types'
import { cn } from '@/lib/utils'

const MOCK_PATTERNS: SignalPattern[] = [
  { id: '1', name: 'Military Comm v1', classification: 'FRIENDLY', samplesCount: 127, avgConfidence: 0.973, lastDetected: new Date().toISOString() },
  { id: '2', name: 'Tactical Radio v2', classification: 'FRIENDLY', samplesCount: 89, avgConfidence: 0.968, lastDetected: new Date(Date.now() - 120000).toISOString() },
  { id: '3', name: 'Unidentified Signal', classification: 'UNKNOWN', samplesCount: 9, avgConfidence: 0.939, lastDetected: new Date(Date.now() - 300000).toISOString() },
  { id: '4', name: 'Jamming Signature v1', classification: 'HOSTILE', samplesCount: 34, avgConfidence: 0.991, lastDetected: new Date(Date.now() - 60000).toISOString() },
  { id: '5', name: 'Electronic Warfare v2', classification: 'HOSTILE', samplesCount: 18, avgConfidence: 0.985, lastDetected: new Date(Date.now() - 180000).toISOString() },
]

export function SignalPatternLibrary() {
  const [searchQuery, setSearchQuery] = React.useState('')

  const groupedPatterns = useMemo(() => {
    const filtered = MOCK_PATTERNS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return {
      friendly: filtered.filter(p => p.classification === 'FRIENDLY'),
      unknown: filtered.filter(p => p.classification === 'UNKNOWN'),
      hostile: filtered.filter(p => p.classification === 'HOSTILE')
    }
  }, [searchQuery])

  return (
    <Card className="bg-[#0A0E27]/40 border-primary/10 backdrop-blur-xl flex flex-col shadow-2xl flex-1 min-h-[400px]">
      <CardHeader className="p-4 border-b border-primary/10 bg-primary/5 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
          <Fingerprint className="w-4 h-4" />
          Signal Library
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10"><Plus className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10"><Download className="w-3.5 h-3.5" /></Button>
        </div>
      </CardHeader>
      <div className="p-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search patterns..." 
            className="h-8 pl-8 text-[10px] bg-primary/5 border-primary/20 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <PatternGroup title="Friendly Patterns" icon={<CheckCircle2 className="w-3 h-3 text-[#00FF41]" />} patterns={groupedPatterns.friendly} color="[#00FF41]" />
            <PatternGroup title="Unknown Patterns" icon={<AlertCircle className="w-3 h-3 text-[#FFD700]" />} patterns={groupedPatterns.unknown} color="[#FFD700]" />
            <PatternGroup title="Hostile Patterns" icon={<XCircle className="w-3 h-3 text-destructive" />} patterns={groupedPatterns.hostile} color="destructive" />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function PatternGroup({ title, icon, patterns, color }: { title: string, icon: React.ReactNode, patterns: SignalPattern[], color: string }) {
  if (patterns.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-primary/5 pb-2">
        {icon}
        <span className={cn("text-[9px] font-bold uppercase tracking-widest", `text-${color}`)}>{title} ({patterns.length})</span>
      </div>
      <div className="space-y-2">
        {patterns.map((p) => (
          <div key={p.id} className="p-3 bg-primary/5 border border-primary/10 rounded-sm hover:border-primary/30 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-all uppercase tracking-tight">{p.name}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground">
              <span>Samples: <span className="text-primary/70">{p.samplesCount}</span></span>
              <span>Conf: <span className="text-primary/70">{(p.avgConfidence * 100).toFixed(1)}%</span></span>
            </div>
            <div className="mt-1 text-[8px] font-mono text-muted-foreground/60 uppercase">
              Last: {new Date(p.lastDetected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
