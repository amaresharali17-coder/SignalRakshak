"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RFSignal } from '@/lib/types'
import { Cpu, Info, CheckCircle2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MLModelConfidencePanelProps {
  signal: RFSignal | null
}

export function MLModelConfidencePanel({ signal }: MLModelConfidencePanelProps) {
  const featureImportance = [
    { name: 'Peak Amplitude', importance: 17.3, key: 'peak_amplitude' },
    { name: 'FFT Entropy', importance: 13.5, key: 'fft_entropy' },
    { name: 'Crest Factor', importance: 11.6, key: 'crest_factor' },
    { name: 'RMS Power', importance: 8.7, key: 'rms_power' },
    { name: 'Kurtosis', importance: 8.7, key: 'kurtosis' },
    { name: 'Bandwidth', importance: 7.2, key: 'bandwidth' },
    { name: 'Noise Floor', importance: 6.8, key: 'noise' },
  ]

  if (!signal) {
    return (
      <Card className="bg-[#0A0E27]/40 border-primary/10 backdrop-blur-xl shadow-xl min-h-[300px]">
        <CardHeader className="p-4 border-b border-primary/10 bg-primary/5">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
            <Cpu className="w-4 h-4" />
            Neural Assessment HUD
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center gap-4">
          <Info className="w-10 h-10 text-muted-foreground opacity-10" />
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">Select active signature for classification breakdown</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0A0E27]/40 border-primary/10 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col min-h-[400px]">
      <CardHeader className="p-4 border-b border-primary/10 flex flex-row items-center justify-between bg-primary/5 shrink-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
          <Cpu className="w-4 h-4" />
          Neural Link Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-combat-pulse shadow-[0_0_8px_#00FF41]" />
          <span className="text-[9px] font-mono text-[#00FF41] font-bold uppercase">Linked</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="label-tactical text-primary/70">Aggregate Confidence</span>
                <span className="text-xl data-value font-bold text-primary">{(signal.confidence * 100).toFixed(2)}%</span>
              </div>
              <Progress 
                value={signal.confidence * 100} 
                className="h-2 bg-primary/5" 
                indicatorClassName="bg-primary shadow-[0_0_15px_rgba(0,212,255,0.6)]" 
              />
            </div>

            <div className="space-y-4">
              <span className="label-tactical block border-b border-primary/10 pb-2 mb-4">Core Feature Importance</span>
              {featureImportance.map((feature) => (
                <div key={feature.name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-foreground/90 font-bold uppercase">{feature.name}</span>
                    <span className="text-primary/80">Weight: {feature.importance}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-accent transition-all duration-1000 shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                         style={{ width: `${feature.importance * 4}%` }}
                       />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-accent min-w-[45px] text-right">
                      {(signal.features[feature.key as keyof typeof signal.features] as number || 0).toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-primary/10 grid grid-cols-3 gap-4">
               <div className="text-center flex flex-col gap-1">
                 <div className="label-tactical text-[8px]">Friendly</div>
                 <div className="data-value text-[11px] font-bold text-[#00FF41]">{(signal.probabilities.friendly * 100).toFixed(1)}%</div>
               </div>
               <div className="text-center flex flex-col gap-1">
                 <div className="label-tactical text-[8px]">Unknown</div>
                 <div className="data-value text-[11px] font-bold text-[#FFD700]">{(signal.probabilities.unknown * 100).toFixed(1)}%</div>
               </div>
               <div className="text-center flex flex-col gap-1">
                 <div className="label-tactical text-[8px]">Hostile</div>
                 <div className="data-value text-[11px] font-bold text-destructive">{(signal.probabilities.hostile * 100).toFixed(1)}%</div>
               </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
