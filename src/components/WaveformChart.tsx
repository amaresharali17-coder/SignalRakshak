"use client"

import React from 'react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface WaveformChartProps {
  samples: number[]
  className?: string
  color?: string
}

export function WaveformChart({ samples, className, color = "hsl(var(--primary))" }: WaveformChartProps) {
  const data = samples.map((val, i) => ({ i, val }))

  return (
    <div className={cn("h-full w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <YAxis domain={[-1.5, 1.5]} hide />
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}