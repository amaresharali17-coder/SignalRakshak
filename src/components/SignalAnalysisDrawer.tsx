
"use client"

import React, { useEffect, useState, useRef } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet'
import { RFSignal } from '@/lib/types'
import { WaveformChart } from './WaveformChart'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Target, 
  Zap, 
  Terminal, 
  Globe, 
  Network, 
  Compass,
  LocateFixed,
  Layers,
  Satellite,
  Volume2,
  Video,
  Loader2,
  Play
} from 'lucide-react'
import { explainThreatAndRecommendAction } from '@/ai/flows/threat-explanation-and-recommendation'
import { summarizeSignalFeatures } from '@/ai/flows/signal-feature-analysis-summary'
import { generateSatelliteReconVideo } from '@/ai/flows/satellite-recon-flow'
import { generateVoiceIntel } from '@/ai/flows/voice-intel-flow'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface SignalAnalysisDrawerProps {
  signal: RFSignal | null
  isOpen: boolean
  onClose: () => void
}

export function SignalAnalysisDrawer({ signal, isOpen, onClose }: SignalAnalysisDrawerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<{ explanation: string; recommended_action: string } | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  
  // Advanced Intel State
  const [reconVideo, setReconVideo] = useState<string | null>(null)
  const [reconLoading, setReconLoading] = useState(false)
  const [voiceAudio, setVoiceAudio] = useState<string | null>(null)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function fetchAIAnalysis() {
      if (!signal) return
      setLoading(true)
      try {
        const [expResult, sumResult] = await Promise.all([
          explainThreatAndRecommendAction({
            signal_id: signal.id,
            timestamp: signal.timestamp,
            classification: signal.classification,
            confidence: signal.confidence,
            threat_level: signal.threat_level,
            source_ip: signal.source_ip,
            location: signal.location,
            probabilities: signal.probabilities,
            features: signal.features,
            alert_triggered: signal.alert_triggered
          }),
          summarizeSignalFeatures(signal.features)
        ])
        setExplanation(expResult)
        setSummary(sumResult)
      } catch (error) {
        console.error("AI Analysis failed", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && signal) {
      fetchAIAnalysis()
    } else {
      setExplanation(null)
      setSummary(null)
      setReconVideo(null)
      setVoiceAudio(null)
    }
  }, [isOpen, signal])

  const handleRequestRecon = async () => {
    if (!signal) return
    setReconLoading(true)
    try {
      const result = await generateSatelliteReconVideo({
        sector: signal.location.sector,
        description: signal.location.predicted_origin || "Tactical Sector Outpost"
      })
      setReconVideo(result.videoUrl)
      toast({ title: "RECON COMPLETE", description: "Satellite imagery established." })
    } catch (e) {
      toast({ variant: "destructive", title: "LINK FAILURE", description: "Satellite recon timed out." })
    } finally {
      setReconLoading(false)
    }
  }

  const handlePlayVoiceIntel = async () => {
    if (!explanation?.recommended_action) return
    if (voiceAudio) {
      audioRef.current?.play()
      return
    }
    setVoiceLoading(true)
    try {
      const result = await generateVoiceIntel(explanation.recommended_action)
      setVoiceAudio(result.audioUrl)
      toast({ title: "INTEL READY", description: "Voice assessment downloaded." })
    } catch (e) {
      toast({ variant: "destructive", title: "VOICE FAILURE", description: "Neural link congested." })
    } finally {
      setVoiceLoading(false)
    }
  }

  if (!signal) return null

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'FRIENDLY': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
      case 'UNKNOWN': return 'text-amber-400 border-amber-400/30 bg-amber-400/5'
      case 'HOSTILE': return 'text-rose-400 border-rose-400/30 bg-rose-400/5'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-xl border-l border-primary/20 bg-background/95 backdrop-blur-2xl p-0 flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        
        <SheetHeader className="p-6 pb-4 shrink-0 border-b border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className={cn("font-mono text-[9px] tracking-widest uppercase px-2 rounded-sm", getStatusColor(signal.classification))}>
              {signal.classification} CATEGORY
            </Badge>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono uppercase">
              <Terminal className="w-3 h-3 text-primary" /> TRACE ID: {signal.id}
            </div>
          </div>
          <SheetTitle className="text-xl font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
            <LocateFixed className="w-6 h-6 text-accent animate-pulse" /> 
            Geospatial Intelligence
          </SheetTitle>
          <SheetDescription className="text-[10px] font-mono uppercase tracking-tight text-muted-foreground flex items-center gap-2">
            <Satellite className="w-3 h-3" /> SECURE TRACE · SECTOR {signal.location.sector} · {new Date(signal.timestamp).toLocaleTimeString()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-8 py-6">
            
            {/* TACTICAL RECON VIDEO SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-accent">
                  <Video className="w-4 h-4" /> Satellite Recon Feed
                </h4>
                {!reconVideo && !reconLoading && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRequestRecon}
                    className="h-6 text-[8px] uppercase tracking-widest border-accent/30 text-accent hover:bg-accent/10"
                  >
                    Request Live Feed
                  </Button>
                )}
              </div>
              
              <div className="aspect-video w-full bg-black border border-primary/20 rounded-sm relative overflow-hidden flex items-center justify-center">
                {reconLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    <span className="text-[8px] font-mono text-accent uppercase animate-pulse">Triangulating Veo-2 Link...</span>
                  </div>
                ) : reconVideo ? (
                  <video src={reconVideo} autoPlay loop muted className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-center p-8">
                    <Satellite className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                    <p className="text-[8px] font-mono text-muted-foreground uppercase">Feed Offline. Manual request required.</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 border border-primary/20 rounded text-[7px] font-mono text-primary uppercase">
                   LIVE // {signal.location.sector}
                </div>
              </div>
            </div>

            {/* PREDICTIVE ORIGIN CARD */}
            <div className="bg-accent/5 border border-accent/30 p-5 rounded-sm relative overflow-hidden group glow-accent">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                 <Compass className="w-12 h-12 text-accent" />
               </div>
               <div className="flex items-center gap-3 mb-3">
                 <Target className="w-5 h-5 text-accent animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Predictive Signal Origin</span>
               </div>
               <div className="space-y-3 relative z-10">
                 <div className="text-2xl font-bold text-foreground uppercase tracking-tighter leading-none">
                   {signal.location.predicted_origin || "TRIANGULATING SOURCE..."}
                 </div>
                 <div className="text-[11px] text-muted-foreground leading-relaxed font-mono uppercase">
                   Source identified as a tactical structure within <span className="text-primary font-bold">{signal.location.sector}</span>. 
                   Status: <span className={cn("font-bold", signal.threat_level === 'HIGH' ? 'text-rose-500' : 'text-emerald-500')}>{signal.threat_level === 'HIGH' ? 'COMPROMISED' : 'SECURE'}</span>.
                 </div>
               </div>
            </div>

            {/* NEURAL ASSESSMENT & VOICE INTEL */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-accent">
                  <Cpu className="w-4 h-4" /> Tactical Intelligence AI
                </h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  disabled={loading || voiceLoading || !explanation}
                  onClick={handlePlayVoiceIntel}
                  className="h-7 text-[9px] uppercase tracking-widest text-primary gap-2 hover:bg-primary/5"
                >
                  {voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                  {voiceAudio ? "Replay Intel" : "Voice Intel"}
                </Button>
              </div>
              
              {loading ? (
                <div className="p-6 border border-primary/10 bg-primary/5 rounded-sm space-y-3 animate-pulse">
                  <div className="h-2 bg-primary/20 rounded w-3/4" />
                  <div className="h-2 bg-primary/20 rounded w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-5 rounded-sm border border-primary/20 relative">
                    <div className="text-[12px] leading-relaxed text-muted-foreground font-mono uppercase italic">
                      {explanation?.explanation || "LINKING TO COMMAND..."}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-5 rounded-sm border flex items-start gap-4 transition-all relative overflow-hidden",
                    signal.classification === 'HOSTILE' ? "bg-rose-500/10 border-rose-500/30" : 
                    signal.classification === 'UNKNOWN' ? "bg-amber-500/10 border-amber-500/30" :
                    "bg-emerald-500/10 border-emerald-500/30"
                  )}>
                    <Zap className={cn("w-6 h-6 shrink-0 mt-1", 
                      signal.classification === 'HOSTILE' ? "text-rose-500" : 
                      signal.classification === 'UNKNOWN' ? "text-amber-500" : "text-emerald-400"
                    )} />
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Command Recommendation</div>
                      <div className="text-sm font-bold uppercase tracking-tight text-foreground">{explanation?.recommended_action || "MONITORING..."}</div>
                    </div>
                    {voiceAudio && (
                      <audio ref={audioRef} src={voiceAudio} className="hidden" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WAVEFORM PREVIEW */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/80">
                <Activity className="w-4 h-4" /> Captured RF Signature
              </h4>
              <div className="oscilloscope-bg border border-primary/20 rounded-sm p-4 h-32">
                <WaveformChart samples={signal.samples} color={signal.classification === 'FRIENDLY' ? '#4ade80' : signal.classification === 'UNKNOWN' ? '#fbbf24' : '#fb7185'} />
              </div>
            </div>

            {/* SIGNAL PROBABILITIES */}
            <div className="space-y-4 pt-4 border-t border-primary/10">
              <div className="space-y-4 bg-muted/20 p-5 border border-border/50 rounded-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-400">AUTHORIZED</span>
                    <span className="text-emerald-400">{(signal.probabilities.friendly * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={signal.probabilities.friendly * 100} className="h-1 bg-background" indicatorClassName="bg-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-rose-500">JAMMING (HOSTILE)</span>
                    <span className="text-rose-500">{(signal.probabilities.hostile * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={signal.probabilities.hostile * 100} className="h-1 bg-background" indicatorClassName="bg-rose-500" />
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
