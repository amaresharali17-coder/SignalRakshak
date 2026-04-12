"use client"

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  ComposedChart,
  Line
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, ChevronUp, ChevronDown, Maximize2 } from 'lucide-react'

interface ThreatEvolutionChartProps {
  data: any[]
  currentSize?: 'SM' | 'MD' | 'LG'
  onSizeChange?: (size: 'SM' | 'MD' | 'LG') => void
}

export function ThreatEvolutionChart({ data, currentSize = 'MD', onSizeChange }: ThreatEvolutionChartProps) {
  const handleIncrease = () => {
    if (!onSizeChange) return
    if (currentSize === 'SM') onSizeChange('MD')
    else if (currentSize === 'MD') onSizeChange('LG')
  }

  const handleDecrease = () => {
    if (!onSizeChange) return
    if (currentSize === 'LG') onSizeChange('MD')
    else if (currentSize === 'MD') onSizeChange('SM')
  }

  return (
    <Card className="bg-background/40 border-primary/10 backdrop-blur-md flex-1 flex flex-col min-h-0">
      <CardHeader className="p-3 border-b border-primary/10 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Threat Evolution Timeline (30M)</CardTitle>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 border-x border-primary/10 px-3">
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-6 w-6 hover:bg-primary/10 text-primary"
               onClick={handleDecrease}
               disabled={currentSize === 'SM'}
             >
               <ChevronDown className="w-4 h-4" />
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-6 w-6 hover:bg-primary/10 text-primary"
               onClick={handleIncrease}
               disabled={currentSize === 'LG'}
             >
               <ChevronUp className="w-4 h-4" />
             </Button>
           </div>
           <div className="hidden md:flex items-center gap-2">
             <TrendingUp className="w-3 h-3 text-accent animate-pulse" />
             <span className="text-[8px] font-mono text-accent uppercase tracking-tighter">Predictive Analysis On</span>
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorFriendly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHostile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '4px', fontSize: '10px' }}
              itemStyle={{ textTransform: 'uppercase', fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', paddingTop: '10px' }} />
            
            <Bar dataKey="unknown" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={20} />
            <Area type="monotone" dataKey="friendly" stroke="#10b981" fillOpacity={1} fill="url(#colorFriendly)" strokeWidth={2} />
            <Area type="monotone" dataKey="hostile" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHostile)" strokeWidth={2} />
            
            {/* Prediction Line */}
            <Line 
              type="stepAfter" 
              dataKey="predicted" 
              stroke="#0ea5e9" 
              strokeDasharray="5 5" 
              dot={false} 
              strokeWidth={1}
              name="FORECAST INTENSITY"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}