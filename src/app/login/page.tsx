
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Terminal, 
  ShieldCheck, 
  Lock, 
  Mail, 
  UserPlus, 
  ShieldAlert,
  Fingerprint,
  Info,
  Server,
  Zap,
  Globe,
  Radio,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
  Activity,
  Cpu,
  Network
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useAuth, 
  useUser 
} from '@/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously 
} from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/')
    }
  }, [user, isUserLoading, router])

  const validateEmail = (val: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@sanketrakshak\.ind$/
    if (!val) return ''
    if (!pattern.test(val)) return 'Invalid operator identifier (must end in @sanketrakshak.ind)'
    return ''
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    
    const err = validateEmail(email)
    if (err) {
      setEmailError(err)
      triggerShake()
      return
    }

    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "LINK ESTABLISHED",
        description: "Identity verified. Accessing tactical grid.",
      })
    } catch (error: any) {
      triggerShake()
      let message = "Encryption key or identifier rejected."
      if (error.code === 'auth/invalid-credential') {
        message = "Invalid operator credentials. Access denied."
      }
      toast({
        variant: "destructive",
        title: "ACCESS DENIED",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setIsLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "ENROLLMENT SUCCESS",
        description: "New operator identity registered in the vault.",
      })
    } catch (error: any) {
      triggerShake()
      toast({
        variant: "destructive",
        title: "ENROLLMENT FAILED",
        description: error.message || "Could not register command identity.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = async () => {
    if (!auth) return
    setIsLoading(true)
    try {
      await signInAnonymously(auth)
      toast({
        title: "GUEST OVERRIDE ACTIVE",
        description: "Entering grid as unidentified observer.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "BYPASS FAILED",
        description: "Emergency bypass link rejected.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('operator@sanketrakshak.ind')
    setPassword('tactical-alpha-99')
    setEmailError('')
    toast({
      title: "DEMO DATA INJECTED",
      description: "Secure credentials loaded for rapid deployment.",
    })
  }

  if (isUserLoading) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex items-center justify-center tactical-grid">
        <div className="flex flex-col items-center gap-6">
          <Activity className="w-12 h-12 text-primary animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-primary/70">Syncing Neural Link...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary/30">
      {/* Background FX */}
      <div className="absolute inset-0 opacity-20 pointer-events-none tactical-grid" />
      <div className="scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT HUD: Gateway Telemetry */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 animate-in slide-in-from-left-12 duration-1000">
          <div className="glass-panel p-6 space-y-6 border-l-4 border-l-primary/60">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Gateway Node</span>
                  <span className="text-xs font-mono text-primary font-bold">ALPHA-INTEL-01</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Encryption</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">AES-256-GCM</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Uplink Status</span>
                  <span className="text-xs font-mono text-amber-400 font-bold animate-pulse">ESTABLISHING</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-primary/10">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Neural Load</div>
              <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 w-1/3 animate-pulse" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] font-mono text-primary/40">LINK_STABILITY</span>
                <span className="text-[9px] font-mono text-primary">99.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER HUB: Auth Card */}
        <div className={cn(
          "lg:col-span-6 flex flex-col items-center transition-all duration-300",
          isShaking && "animate-shake"
        )}>
          <Card className="w-full max-w-[500px] bg-slate-900/40 border-primary/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Tactical Header Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            <div className="flex justify-between items-center px-6 py-2 bg-primary/5 border-b border-primary/10">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> Secure Terminal: active_link
              </span>
              <span className="text-[9px] font-mono text-primary/40">v8.2.4-BETA</span>
            </div>

            <CardHeader className="text-center pb-2 pt-10">
              <div className="flex justify-center mb-8">
                <div className="relative p-8 bg-primary/5 rounded-full border border-primary/20 group hover:border-primary/40 transition-all cursor-pointer">
                  {/* Scanning Rings */}
                  <div className="absolute inset-0 border border-primary/20 rounded-full animate-pulse-ring scale-110" />
                  <div className="absolute inset-0 border border-primary/10 rounded-full animate-pulse-ring delay-500 scale-125" />
                  <Fingerprint className="w-16 h-16 text-primary group-hover:scale-110 transition-transform glow-primary" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold tracking-[0.3em] uppercase text-primary glow-primary">SANKETRAKSHAK</CardTitle>
              <CardDescription className="text-[10px] font-mono uppercase tracking-[0.4em] mt-4 text-muted-foreground/60">
                Authorized Intelligence Portal
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 px-10">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-950/50 border border-primary/10 p-1 mb-8 rounded-sm">
                  <TabsTrigger value="login" className="h-10 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-sm transition-all">
                    Link Access
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="h-10 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-sm transition-all">
                    Enrollment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Operator Identifier</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="operator@sanketrakshak.ind" 
                          className={cn(
                            "pl-10 h-12 input-tactical bg-slate-950/40 border-primary/20",
                            emailError && "border-destructive/50 text-destructive"
                          )}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setEmailError(validateEmail(e.target.value))
                          }}
                          required
                        />
                      </div>
                      {emailError && (
                        <div className="flex items-center gap-1.5 text-destructive mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{emailError}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pass" className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Encryption Key</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                        <Input 
                          id="pass" 
                          type={showPassword ? "text" : "password"} 
                          className="pl-10 pr-11 h-12 input-tactical bg-slate-950/40 border-primary/20"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !!emailError || !email || !password} 
                      className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-[0.3em] hover:bg-primary/90 gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] rounded-sm"
                    >
                      {isLoading ? <Terminal className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Establish Secure Link
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-email" className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">New Operator ID</Label>
                      <Input 
                        id="new-email" 
                        type="email" 
                        placeholder="operator@sanketrakshak.ind" 
                        className="h-12 input-tactical bg-slate-950/40 border-primary/20"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-pass" className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Primary Security Key</Label>
                      <Input 
                        id="new-pass" 
                        type="password" 
                        placeholder="Min 12 characters"
                        className="h-12 input-tactical bg-slate-950/40 border-primary/20"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-slate-100 text-slate-950 font-bold uppercase tracking-[0.3em] hover:bg-slate-200 gap-2 rounded-sm transition-all active:scale-[0.98]">
                      {isLoading ? <Terminal className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Enroll Identity
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Rapid Deployment Node */}
              <div className="mt-10 border-2 border-dashed border-primary/20 bg-primary/[0.03] rounded-sm overflow-hidden group">
                <button 
                  onClick={fillDemoCredentials}
                  className="w-full p-5 flex items-center justify-between hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Rapid Deployment Node</span>
                      <span className="text-[9px] font-mono text-primary/60">Inject demo credentials to gateway</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary/40 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-6 pb-12 px-10">
              <div className="flex items-center w-full gap-4">
                <div className="h-px bg-primary/10 flex-1" />
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.6em]">Emergency Link Protocols</span>
                <div className="h-px bg-primary/10 flex-1" />
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGuestAccess} 
                disabled={isLoading}
                className="w-full h-12 border-primary/20 bg-slate-950/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary/10 hover:border-primary/40 transition-all gap-3 text-primary"
              >
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Guest Observer Bypass
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT HUD: Geospatial Telemetry */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 animate-in slide-in-from-right-12 duration-1000">
          <div className="glass-panel p-6 space-y-6 border-r-4 border-r-primary/60">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Triangulation</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground/40 uppercase">Lat_Coord</span>
                  <span className="text-primary font-bold">34.0522° N</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground/40 uppercase">Lng_Coord</span>
                  <span className="text-primary font-bold">118.2437° W</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground/40 uppercase">Alt_Ref</span>
                  <span className="text-primary font-bold">284m ASL</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-primary/10">
               <div className="h-32 w-full bg-slate-950/60 rounded-sm border border-primary/10 relative overflow-hidden group">
                  <div className="absolute inset-0 tactical-grid opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Radio className="w-8 h-8 text-primary/20 animate-pulse" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-primary/40">GEO_RENDER: PASSIVE</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          animation-iteration-count: 2;
        }
      `}</style>
    </div>
  )
}
