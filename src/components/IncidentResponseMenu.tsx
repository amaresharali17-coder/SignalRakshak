"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RFSignal } from '@/lib/types'
import { 
  ShieldAlert, 
  Target, 
  FileText, 
  Lock, 
  Activity, 
  Database, 
  Link, 
  MapPin, 
  X,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface IncidentResponseMenuProps {
  signal: RFSignal | null
  isOpen: boolean
  onClose: () => void
}

export function IncidentResponseMenu({ signal, isOpen, onClose }: IncidentResponseMenuProps) {
  if (!signal) return null

  const actions = [
    { icon: AlertTriangle, label: 'Escalate to Commander', sub: 'Sends alert + SMS priority link', color: 'text-rose-500', bg: 'hover:bg-rose-500/10' },
    { icon: MapPin, label: 'Pin on Global Grid', sub: 'Adds persistent tactical marker', color: 'text-primary', bg: 'hover:bg-primary/10' },
    { icon: Target, label: 'Activate Countermeasures', sub: 'Trigger automated AI-response', color: 'text-accent', bg: 'hover:bg-accent/10' },
    { icon: FileText, label: 'Create Incident Report', sub: 'Generate cryptographically signed PDF', color: 'text-muted-foreground', bg: 'hover:bg-muted/10' },
    { icon: Lock, label: 'Block Source IP', sub: 'Add origin to firewall blacklist', color: 'text-rose-600', bg: 'hover:bg-rose-600/10' },
    { icon: Activity, label: 'Analyze Pattern', sub: 'Show similar archival signals', color: 'text-primary', bg: 'hover:bg-primary/10' },
    { icon: Database, label: 'Archive to Database', sub: 'Store record in Deep Archive', color: 'text-muted-foreground', bg: 'hover:bg-muted/10' },
    { icon: Link, label: 'Correlate Signals', sub: 'Find matching temporal patterns', color: 'text-primary', bg: 'hover:bg-primary/10' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0A0E27]/95 border-primary/20 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
        <div className={cn(
          "h-1.5 w-full animate-combat-pulse",
          signal.classification === 'HOSTILE' ? "bg-destructive" : signal.classification === 'UNKNOWN' ? "bg-[#FFD700]" : "bg-[#00FF41]"
        )} />
        
        <DialogHeader className="p-6 border-b border-primary/10 bg-primary/5">
          <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary glow-text-phosphor mb-2">Tactical Response HUD</DialogTitle>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xl font-mono font-bold text-foreground">{signal.source_ip}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border",
                signal.classification === 'HOSTILE' ? "text-rose-500 border-rose-500/30 bg-rose-500/5" : "text-primary border-primary/30 bg-primary/5"
              )}>
                {signal.classification}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>Sector: {signal.location.sector}</span>
              <span>Risk: {(signal.probabilities.hostile * 100).toFixed(1)}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-2 space-y-1">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="ghost"
              className={cn(
                "w-full h-auto py-3 px-4 justify-start gap-4 rounded-sm transition-all border border-transparent",
                action.bg
              )}
              onClick={() => {
                console.log(`Action: ${action.label} triggered for signal ${signal.id}`)
                onClose()
              }}
            >
              <action.icon className={cn("w-5 h-5", action.color)} />
              <div className="flex flex-col items-start text-left">
                <span className={cn("text-xs font-bold uppercase tracking-widest", action.color)}>{action.label}</span>
                <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">{action.sub}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="p-4 bg-primary/[0.02] border-t border-primary/10">
          <Button onClick={onClose} className="w-full h-10 text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
            Dismiss Operations
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
