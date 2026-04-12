"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, ShieldAlert, Volume2, Bell, Smartphone, Plus, Trash2, Edit2 } from 'lucide-react'
import { AlertRule } from '@/lib/types'
import { cn } from '@/lib/utils'

const DEFAULT_RULES: AlertRule[] = [
  { id: '1', name: 'HOSTILE DETECTION', triggerType: 'HOSTILE_DETECTED', threshold: 0.95, action: 'Sound + Popup + Email', enabled: true },
  { id: '2', name: 'UNKNOWN SPIKE', triggerType: 'UNKNOWN_SPIKE', threshold: 0.80, action: 'Notify + Log', enabled: true },
  { id: '3', name: 'SECTOR THREAT ESCALATION', triggerType: 'SECTOR_ESCALATION', threshold: 0.90, action: 'Escalate to Commander', enabled: true },
  { id: '4', name: 'SOURCE IDENTIFICATION', triggerType: 'SOURCE_ID_FOUND', threshold: 0.98, action: 'Target Confirmed', enabled: false },
]

export function AlertConfigDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES)
  const [volume, setVolume] = useState([60])
  const [mobileAlerts, setMobileAlerts] = useState(true)

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#0A0E27]/95 border-primary/20 backdrop-blur-3xl shadow-2xl p-0 flex flex-col h-[80vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-primary/10">
          <DialogTitle className="text-xl font-bold uppercase tracking-[0.4em] text-primary flex items-center gap-4 glow-text-phosphor">
            <Settings className="w-5 h-5 animate-spin-slow" />
            Tactical Alert Control HUD
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <span className="label-tactical text-primary">Active Rules: {rules.filter(r => r.enabled).length}</span>
              <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest border-primary/20 hover:bg-primary/10 text-primary">
                <Plus className="w-3.5 h-3.5 mr-2" /> Add Custom Rule
              </Button>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className={cn(
                  "p-5 rounded-sm border transition-all relative overflow-hidden",
                  rule.enabled ? "bg-primary/[0.03] border-primary/30" : "bg-muted/5 border-muted/20 opacity-60"
                )}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className={cn("w-4 h-4", rule.enabled ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">{rule.name}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[10px] font-mono text-muted-foreground">
                        <span>Trigger: <span className="text-primary/70">{rule.triggerType}</span></span>
                        <span>Confidence: <span className="text-primary/70">{">"} {(rule.threshold * 100).toFixed(0)}%</span></span>
                        <span>Action: <span className="text-primary/70">{rule.action}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} className="scale-90" />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-primary/10 space-y-6">
              <span className="label-tactical block mb-4">Global Intelligence Settings</span>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-primary/70" /> Sound Volume
                  </Label>
                  <span className="text-[11px] font-mono text-primary">{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="py-2" />
              </div>

              <div className="flex justify-between items-center py-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-primary/70" /> Mobile Notifications
                </Label>
                <Switch checked={mobileAlerts} onCheckedChange={setMobileAlerts} />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-8 border-t border-primary/10 bg-primary/[0.02]">
          <div className="flex justify-between w-full gap-4">
            <Button variant="ghost" onClick={onClose} className="h-11 flex-1 text-[11px] uppercase font-bold tracking-[0.2em] border border-primary/10 hover:bg-primary/5">Reset to Baseline</Button>
            <Button onClick={onClose} className="h-11 flex-1 bg-primary text-primary-foreground text-[11px] uppercase font-bold tracking-[0.2em] hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.3)]">Seal Configuration</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
