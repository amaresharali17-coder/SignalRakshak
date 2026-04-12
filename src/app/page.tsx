
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  ShieldAlert, 
  Radio, 
  History, 
  AlertTriangle, 
  Bell, 
  Settings, 
  LayoutDashboard,
  Terminal,
  ShieldCheck,
  Eye,
  Target,
  Globe,
  RefreshCw,
  LogOut,
  BellOff,
  Map as MapIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { generateMockSignal } from '@/lib/signal-engine'
import { RFSignal, SignalClassification, ThreatLevel, SourceIntelligence } from '@/lib/types'
import { WaveformChart } from '@/components/WaveformChart'
import { SignalAnalysisDrawer } from '@/components/SignalAnalysisDrawer'
import { MLModelConfidencePanel } from '@/components/MLModelConfidencePanel'
import { ThreatEvolutionChart } from '@/components/ThreatEvolutionChart'
import { SourceAttributionPanel } from '@/components/SourceAttributionPanel'
import { SignalPatternLibrary } from '@/components/SignalPatternLibrary'
import { AlertConfigDialog } from '@/components/AlertConfigDialog'
import { IncidentResponseMenu } from '@/components/IncidentResponseMenu'
import { SystemHealthHUD } from '@/components/SystemHealthHUD'
import { TacticalIndiaMap } from '@/components/TacticalIndiaMap'
import { TacticalTerminal } from '@/components/TacticalTerminal'
import { cn } from '@/lib/utils'
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  useAuth
} from '@/firebase'
import { doc, collection, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { playHostileBuzzer } from '@/lib/audio-utils'

interface TacticalNotification {
  id: string;
  message: string;
  timestamp: string;
  signalId: number;
}

export default function Dashboard() {
  const router = useRouter()
  const db = useFirestore()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()
  
  const [activeSignal, setActiveSignal] = useState<RFSignal | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isResponseMenuOpen, setIsResponseMenuOpen] = useState(false)
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'LIVE' | 'HISTORY'>('LIVE')
  const [notifications, setNotifications] = useState<TacticalNotification[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [timelineSize, setTimelineSize] = useState<'SM' | 'MD' | 'LG'>('MD')
  
  const [sources, setSources] = useState<SourceIntelligence[]>([])
  const [timelineData, setTimelineData] = useState<any[]>([])

  // Cumulative Stats State (All-time or Session-based that grows)
  const [cumulativeStats, setCumulativeStats] = useState({ friendly: 0, unknown: 0, hostile: 0, total: 0 })
  const [hasInitializedStats, setHasInitializedStats] = useState(false)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  // Use Firestore as the source of truth
  const liveQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'signalAnalysisResults'),
      orderBy('timestamp', 'desc'),
      limit(200)
    )
  }, [db, user])

  const { data: dbSignals, isLoading: isSignalsLoading } = useCollection(liveQuery)

  // Initialize stats from the first database load
  useEffect(() => {
    if (dbSignals && !hasInitializedStats) {
      const initial = dbSignals.reduce((acc, sig) => {
        acc.total++
        if (sig.classification === 'FRIENDLY') acc.friendly++
        if (sig.classification === 'UNKNOWN') acc.unknown++
        if (sig.classification === 'HOSTILE') acc.hostile++
        return acc
      }, { friendly: 0, unknown: 0, hostile: 0, total: 0 });
      setCumulativeStats(initial);
      setHasInitializedStats(true);
    }
  }, [dbSignals, hasInitializedStats]);

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const newSignal = generateMockSignal(Date.now())
      processNewSignal(newSignal)
    }, 4000)
    return () => clearInterval(interval)
  }, [db, user, notificationsEnabled])

  const processNewSignal = (newSignal: RFSignal) => {
    // Increment Cumulative Stats
    setCumulativeStats(prev => ({
      total: prev.total + 1,
      friendly: prev.friendly + (newSignal.classification === 'FRIENDLY' ? 1 : 0),
      unknown: prev.unknown + (newSignal.classification === 'UNKNOWN' ? 1 : 0),
      hostile: prev.hostile + (newSignal.classification === 'HOSTILE' ? 1 : 0),
    }));

    if (db && user) {
      const signalId = String(newSignal.id)
      const signalRef = doc(db, 'users', user.uid, 'signalAnalysisResults', signalId)
      setDocumentNonBlocking(signalRef, {
        ...newSignal,
        id: signalId,
        persistedAt: serverTimestamp()
      }, { merge: true })
    }

    if (newSignal.classification === 'HOSTILE' && notificationsEnabled) {
      const newNotif: TacticalNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message: `INIMICAL SIGNATURE DETECTED: SECTOR ${newSignal.location.sector}`,
        timestamp: new Date().toISOString(),
        signalId: newSignal.id
      }
      setNotifications(prev => [newNotif, ...prev].slice(0, 50))
      
      toast({
        variant: "destructive",
        title: "HIGH THREAT ALERT",
        description: newNotif.message,
      })
      playHostileBuzzer()
    }

    setSources(prev => {
      const existingIdx = prev.findIndex(s => s.ip === newSignal.source_ip)
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          hostileCount: updated[existingIdx].hostileCount + (newSignal.classification === 'HOSTILE' ? 1 : 0),
          totalCount: updated[existingIdx].totalCount + 1,
          lastSeen: newSignal.timestamp,
        }
        return updated.sort((a, b) => b.hostileCount - a.hostileCount)
      } else {
        const newSource: SourceIntelligence = {
          ip: newSignal.source_ip,
          sector: newSignal.location.sector,
          hostileCount: newSignal.classification === 'HOSTILE' ? 1 : 0,
          totalCount: 1,
          firstSeen: newSignal.timestamp,
          lastSeen: newSignal.timestamp,
          confidence: 0.85 + Math.random() * 0.1
        }
        return [newSource, ...prev].sort((a, b) => b.hostileCount - a.hostileCount).slice(0, 25)
      }
    })

    setTimelineData(prev => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const lastEntry = prev[prev.length - 1]
      
      if (lastEntry && lastEntry.time === time) {
        const updated = [...prev]
        const current = updated[updated.length - 1]
        current.friendly += newSignal.classification === 'FRIENDLY' ? 1 : 0
        current.unknown += newSignal.classification === 'UNKNOWN' ? 1 : 0
        current.hostile += newSignal.classification === 'HOSTILE' ? 1 : 0
        current.total += 1
        current.predicted = current.hostile * 1.5
        return updated
      } else {
        return [...prev, {
          time,
          friendly: newSignal.classification === 'FRIENDLY' ? 1 : 0,
          unknown: newSignal.classification === 'UNKNOWN' ? 1 : 0,
          hostile: newSignal.classification === 'HOSTILE' ? 1 : 0,
          total: 1,
          predicted: newSignal.classification === 'HOSTILE' ? 1.5 : 0.5
        }].slice(-100)
      }
    })
  }

  const addManualSignal = (type: SignalClassification) => {
    const newSignal = generateMockSignal(Date.now(), type)
    processNewSignal(newSignal)
  }

  const handleRefresh = () => {
    toast({
      title: "Tactical Resync",
      description: "Re-establishing database links. Data persistence active.",
    })
  }

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      router.push('/login')
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const toggleFocusMode = () => {
    const newFilter = threatFilter === 'HIGH' ? 'ALL' : 'HIGH'
    setThreatFilter(newFilter)
    toast({
      variant: newFilter === 'HIGH' ? "destructive" : "default",
      title: newFilter === 'HIGH' ? "FOCUS MODE ACTIVE" : "STANDARD MODE",
      description: newFilter === 'HIGH' ? "Isolating high-threat signatures only." : "Restored full spectrum visibility.",
    })
  }

  const openAnalysis = (signal: RFSignal) => {
    if (signal.classification === 'HOSTILE') {
      playHostileBuzzer();
    }
    setActiveSignal(signal)
    setIsDrawerOpen(true)
  }

  const openResponseMenu = (e: React.MouseEvent, signal: RFSignal) => {
    e.stopPropagation()
    setActiveSignal(signal)
    setIsResponseMenuOpen(true)
  }

  const currentDisplaySignals = useMemo(() => {
    const baseList = (dbSignals || []) as RFSignal[]
    if (threatFilter === 'ALL') return baseList
    return baseList.filter(s => s.threat_level === threatFilter)
  }, [dbSignals, threatFilter])

  const getStatusBadge = (classification: string) => {
    switch (classification) {
      case 'FRIENDLY': return <Badge variant="outline" className="text-[#00FF41] border-[#00FF41]/30 bg-[#00FF41]/5 font-mono text-[10px] rounded-sm glow-text-phosphor">FRIENDLY</Badge>
      case 'UNKNOWN': return <Badge variant="outline" className="text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/5 font-mono text-[10px] rounded-sm glow-text-phosphor">UNKNOWN</Badge>
      case 'HOSTILE': return <Badge variant="outline" className="text-[#FF3B4A] border-[#FF3B4A]/30 bg-[#FF3B4A]/5 font-mono text-[10px] rounded-sm animate-combat-pulse glow-text-phosphor">HOSTILE</Badge>
      default: return null
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center tactical-grid">
        <Activity className="w-8 h-8 text-primary animate-spin opacity-50" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-[#0A0E27] selection:bg-primary/30 relative">
        <div className="scanline" />
        <div className="flicker-overlay fixed inset-0 z-50 pointer-events-none" />
        
        <header className="h-16 border-b border-primary/20 flex items-center justify-between px-8 bg-[#0A0E27]/90 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Radio className="text-primary w-6 h-6 animate-pulse" />
              <h1 className="text-lg font-bold uppercase tracking-[0.4em] text-primary glow-text-phosphor">SanketRakshak</h1>
            </div>
            <div className="h-6 w-px bg-primary/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Operational Sector</span>
                <span className="text-[11px] font-mono text-primary font-bold">SIG-INT-PRIME / 04</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                className="h-9 w-9 text-primary hover:bg-primary/10 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSettingsOpen(true)}
                className="h-9 w-9 text-primary hover:bg-primary/10 transition-all"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <SystemHealthHUD />
            
            <div className="flex items-center gap-6 border-l border-primary/20 pl-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary relative">
                    {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5 text-destructive/50" />}
                    {notifications.length > 0 && notificationsEnabled && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full animate-combat-pulse border-2 border-[#0A0E27] shadow-[0_0_10px_hsl(var(--destructive))]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-[#0A0E27]/95 border-primary/20 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
                  <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 p-4 flex justify-between items-center text-primary">
                    <span>Tactical Intelligence Logs</span>
                    <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} className="scale-90" />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="m-0 bg-primary/10" />
                  <ScrollArea className="max-h-80">
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="p-4 focus:bg-destructive/5 border-b border-primary/5 last:border-0 cursor-default">
                        <div className="flex flex-col gap-2 w-full">
                          <span className="text-[10px] font-bold text-destructive uppercase flex items-center gap-2 glow-text-phosphor">
                            <AlertTriangle className="w-3.5 h-3.5" /> {notif.message}
                          </span>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                            <span className="text-[9px] font-mono text-primary/60 font-bold">SIG_ID: {notif.signalId}</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center">
                        <ShieldCheck className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Logs Clear</span>
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-4 py-2 rounded-sm cursor-pointer hover:bg-primary/20 transition-all active:scale-95 shadow-sm">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{user.isAnonymous ? 'Guest Observer' : 'Command Operator'}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0A0E27]/95 border-primary/20 backdrop-blur-2xl">
                  <DropdownMenuItem onClick={handleLogout} className="text-[11px] uppercase font-bold text-destructive cursor-pointer flex justify-between items-center p-3">
                    Terminate Session <LogOut className="w-4 h-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex flex-row p-6 gap-6 tactical-grid relative z-10 flex-1">
          <aside className="w-72 shrink-0 flex flex-col gap-6">
             <div className="flex flex-col gap-3">
               <Button 
                variant="ghost" 
                onClick={() => setViewMode('LIVE')}
                className={cn(
                  "h-12 justify-start gap-4 rounded-sm border transition-all px-4",
                  viewMode === 'LIVE' ? "bg-primary/10 text-primary border-primary/40 glow-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "text-muted-foreground border-transparent hover:bg-primary/5"
                )}
               >
                 <LayoutDashboard className="w-5 h-5" />
                 <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Live Array Feed</span>
               </Button>
               <Button 
                variant="ghost" 
                onClick={() => setViewMode('HISTORY')}
                className={cn(
                  "h-12 justify-start gap-4 rounded-sm border transition-all px-4",
                  viewMode === 'HISTORY' ? "bg-accent/10 text-accent border-accent/40" : "text-muted-foreground border-transparent hover:bg-accent/5"
                )}
               >
                 <History className="w-5 h-5" />
                 <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Deep Sector Archive</span>
               </Button>
               <Button 
                variant="ghost" 
                onClick={toggleFocusMode}
                className={cn(
                  "h-12 justify-start gap-4 rounded-sm border transition-all px-4",
                  threatFilter === 'HIGH' ? "bg-destructive/10 text-destructive border-destructive/40" : "text-muted-foreground border-transparent hover:bg-primary/5"
                )}
               >
                 <Target className="w-5 h-5" />
                 <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Threat Focus Mode</span>
               </Button>
             </div>

             <SourceAttributionPanel sources={sources} />

             <div className="flex-1" />
             
             <Button 
              variant="ghost" 
              onClick={() => setIsMapOpen(true)}
              className="text-muted-foreground border-transparent hover:text-primary hover:bg-primary/5 h-12 justify-start gap-4 px-4 rounded-sm group transition-all"
             >
               <Globe className="w-5 h-5" />
               <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Global Operational Grid</span>
             </Button>
          </aside>

          <div className="flex-1 flex flex-col gap-6">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
               {[
                 { label: "Total Intercepts", val: cumulativeStats.total, color: "primary", icon: Radio },
                 { label: "Secured Comms", val: cumulativeStats.friendly, color: "[#00FF41]", icon: ShieldCheck },
                 { label: "Unidentified", val: cumulativeStats.unknown, color: "[#FFD700]", icon: Eye },
                 { label: "Hostile Signature", val: cumulativeStats.hostile, color: "destructive", icon: ShieldAlert }
               ].map((item, idx) => (
                 <Card key={idx} className="bg-[#0A0E27]/40 border-primary/10 backdrop-blur-xl overflow-hidden relative group hover:border-primary/30 transition-all p-4 shadow-xl">
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60", `bg-${item.color}`)} />
                    <CardHeader className="pb-1 p-0 flex flex-row items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                        <item.icon className={cn("w-4 h-4 opacity-40", `text-${item.color}`)} />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-3xl font-mono font-bold tracking-tighter tabular-nums transition-all duration-300">
                        {item.val.toLocaleString()}
                      </div>
                    </CardContent>
                 </Card>
               ))}
            </section>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-row gap-6">
                <Card className="flex-1 flex flex-col min-h-[600px] bg-[#0A0E27]/20 border-primary/10 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="shrink-0 flex flex-row items-center justify-between border-b border-primary/10 py-4 px-6 bg-primary/5">
                    <div className="flex items-center gap-4">
                      <Activity className={cn("w-5 h-5 text-primary", viewMode === 'LIVE' && "animate-pulse")} />
                      <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-primary glow-text-phosphor">
                        {viewMode === 'LIVE' ? 'Real-Time Intercept Stream' : 'Classified Archive Repository'}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-muted-foreground uppercase">Buffer: {currentDisplaySignals.length}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <Table>
                      <TableHeader className="sticky top-0 bg-[#0A0E27]/95 backdrop-blur-xl z-20 border-b border-primary/10">
                        <TableRow className="hover:bg-transparent h-12">
                          <TableHead className="w-[120px] text-[9px] font-bold uppercase tracking-widest px-6">Timestamp</TableHead>
                          <TableHead className="w-[140px] text-[9px] font-bold uppercase tracking-widest">Origin Node</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase tracking-widest">RF Waveform</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase tracking-widest text-center">Classification</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase tracking-widest text-right">Sector</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase tracking-widest text-right px-6">Operations</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isSignalsLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-mono uppercase tracking-widest">
                              <Activity className="w-6 h-6 animate-spin mx-auto mb-4 opacity-20" />
                              Establishing Secure Link...
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentDisplaySignals.map((signal) => (
                            <TableRow 
                              key={signal.id} 
                              className={cn(
                                "cursor-pointer group transition-all border-primary/5 h-16",
                                signal.classification === 'HOSTILE' ? "bg-destructive/[0.05] hover:bg-destructive/[0.08]" : "hover:bg-primary/[0.05]"
                              )}
                              onClick={() => openAnalysis(signal)}
                            >
                              <TableCell className="font-mono text-[11px] text-muted-foreground px-6">
                                {new Date(signal.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </TableCell>
                              <TableCell className="font-mono text-[11px] text-primary/80">
                                {signal.source_ip}
                              </TableCell>
                              <TableCell className="py-2">
                                 <div className="h-10 w-40 oscilloscope-bg border border-primary/10 rounded-sm p-1">
                                   <WaveformChart 
                                     samples={signal.samples} 
                                     color={signal.classification === 'FRIENDLY' ? '#00FF41' : signal.classification === 'UNKNOWN' ? '#FFD700' : '#FF3B4A'} 
                                   />
                                 </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {getStatusBadge(signal.classification)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                                {signal.location.sector}
                              </TableCell>
                              <TableCell className="text-right px-6">
                                 <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => openResponseMenu(e, signal)}
                                  className="h-8 text-[9px] uppercase font-bold tracking-widest border border-primary/10 hover:bg-primary/10"
                                 >
                                   Response
                                 </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="w-80 shrink-0 flex flex-col gap-6">
                  {/* Radar Section */}
                  <Card className="h-[400px] bg-[#0A0E27]/20 border-primary/10 backdrop-blur-xl relative overflow-hidden flex flex-col shadow-2xl">
                    <CardHeader className="border-b border-primary/10 py-4 px-6 bg-primary/5">
                       <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00FF41] glow-text-phosphor">Tactical Radar HUD</CardTitle>
                    </CardHeader>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                       {/* Circular Radar HUD */}
                       <div className="w-56 h-56 rounded-full border border-[#00FF41]/20 flex items-center justify-center relative bg-[#00FF41]/[0.03] shadow-[inset_0_0_50px_rgba(0,255,65,0.05)] overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-[1px] bg-[#00FF41]/10" />
                            <div className="w-[1px] h-full bg-[#00FF41]/10" />
                          </div>
                          <div className="absolute inset-4 border border-[#00FF41]/15 rounded-full" />
                          <div className="absolute inset-16 border border-[#00FF41]/10 rounded-full" />
                          <div className="absolute inset-28 border border-[#00FF41]/5 rounded-full border-dashed" />
                          
                          <div className="w-8 h-8 rounded-full border border-[#00FF41]/40 bg-[#00FF41]/10 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                             <div className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,1)]" />
                          </div>
                          
                          <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-top-left -translate-x-[0.5px] -translate-y-[0.5px]">
                             <div className="w-full h-full bg-gradient-to-tr from-[#00FF41]/40 via-[#00FF41]/5 to-transparent origin-top-left animate-[spin_4s_linear_infinite]" 
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                          </div>

                          {currentDisplaySignals.slice(0, 12).map((sig) => {
                             // Correctly map blips based on coordinates
                             const xPos = ((sig.location.lng - 68.1) / (97.4 - 68.1)) * 100;
                             const yPos = 100 - ((sig.location.lat - 8.4) / (37.6 - 8.4)) * 100;
                             
                             return (
                               <div 
                                 key={sig.id}
                                 className={cn(
                                   "absolute w-2 h-2 rounded-full z-10 transition-all duration-1000 shadow-[0_0_10px_currentColor]",
                                   sig.classification === 'FRIENDLY' ? "text-[#00FF41] bg-[#00FF41]" : 
                                   sig.classification === 'UNKNOWN' ? "text-[#FFD700] bg-[#FFD700]" : "text-destructive bg-destructive animate-combat-pulse"
                                 )}
                                 style={{
                                   top: `${Math.max(10, Math.min(90, yPos))}%`,
                                   left: `${Math.max(10, Math.min(90, xPos))}%`,
                                   opacity: 0.8
                                 }}
                               />
                             )
                          })}
                       </div>
                       <div className="mt-4 flex justify-between w-full text-[9px] font-mono text-[#00FF41]/60 uppercase font-bold px-4">
                          <span>Theater: South Asia</span>
                          <span className="animate-pulse">Active: {currentDisplaySignals.length}</span>
                       </div>
                    </div>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20 border-dashed flex flex-col p-4 gap-3 shadow-xl">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">Tactical Signal Simulation</span>
                    <div className="flex gap-3">
                      {['FRIENDLY', 'UNKNOWN', 'HOSTILE'].map((type, i) => (
                        <Button 
                          key={type}
                          size="sm" 
                          onClick={() => addManualSignal(type as SignalClassification)} 
                          className={cn(
                            "flex-1 h-10 text-[10px] font-bold uppercase rounded-sm border transition-all active:scale-95",
                            i === 0 ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/20 hover:bg-[#00FF41]/20" :
                            i === 1 ? "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 hover:bg-[#FFD700]/20" :
                            "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                          )}
                        >
                          {type[0]}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <MLModelConfidencePanel signal={activeSignal || currentDisplaySignals[0]} />
                  <SignalPatternLibrary />
                </div>
              </div>

              <div className={cn(
                "flex gap-6 shrink-0 transition-all duration-500 ease-in-out",
                timelineSize === 'SM' ? "h-40" : timelineSize === 'MD' ? "h-80" : "h-[500px]"
              )}>
                 <ThreatEvolutionChart 
                   data={timelineData} 
                   currentSize={timelineSize}
                   onSizeChange={setTimelineSize}
                 />
              </div>

              {/* Tactical Command Terminal */}
              <div className="shrink-0 mt-6">
                <TacticalTerminal signals={currentDisplaySignals} />
              </div>
            </div>
          </div>
        </main>

        <SignalAnalysisDrawer 
          signal={activeSignal} 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
        />
        
        <AlertConfigDialog 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />

        <IncidentResponseMenu 
          signal={activeSignal} 
          isOpen={isResponseMenuOpen} 
          onClose={() => setIsResponseMenuOpen(false)} 
        />

        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="max-w-5xl h-[85vh] bg-[#0A0E27]/95 border-primary/20 backdrop-blur-3xl p-0 flex flex-col shadow-2xl">
            <DialogHeader className="p-8 pb-4 shrink-0 border-b border-primary/10">
               <DialogTitle className="text-2xl font-bold uppercase tracking-[0.4em] text-primary flex items-center gap-4 glow-text-phosphor">
                 <MapIcon className="w-6 h-6 text-primary animate-pulse" />
                 Operational Theater: India Territorial Grid
               </DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-8 relative flex flex-col bg-primary/[0.01]">
               <div className="flex-1 rounded-sm border border-primary/10 bg-[#0A0E27]/40 relative overflow-hidden shadow-inner p-4">
                  <TacticalIndiaMap signals={currentDisplaySignals} onSignalClick={openAnalysis} className="w-full h-full" />
               </div>
               <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2">
                 <span>System Accuracy: 100.0% Verified</span>
                 <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Neural Signal Extraction Active
                 </span>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
