export type SignalClassification = 'FRIENDLY' | 'UNKNOWN' | 'HOSTILE';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SignalLocation {
  lat: number;
  lng: number;
  sector: string;
  predicted_origin?: string;
}

export interface SignalFeatures {
  peak_amplitude: number;
  rms_power: number;
  fft_entropy: number;
  bandwidth: number;
  kurtosis: number;
  noise: number;
  zero_crossing_rate: number;
  spectral_centroid: number;
  crest_factor: number;
}

export interface RFSignal {
  id: number;
  timestamp: string;
  classification: SignalClassification;
  confidence: number;
  threat_level: ThreatLevel;
  source_ip: string;
  location: SignalLocation;
  probabilities: {
    friendly: number;
    unknown: number;
    hostile: number;
  };
  features: SignalFeatures;
  samples: number[];
  alert_triggered: boolean;
  recommended_action?: string;
  ai_summary?: string;
}

export interface SourceIntelligence {
  ip: string;
  sector: string;
  hostileCount: number;
  totalCount: number;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
}

export interface SignalPattern {
  id: string;
  name: string;
  classification: SignalClassification;
  samplesCount: number;
  avgConfidence: number;
  lastDetected: string;
}

export interface AlertRule {
  id: string;
  name: string;
  triggerType: 'HOSTILE_DETECTED' | 'UNKNOWN_SPIKE' | 'SECTOR_ESCALATION' | 'SOURCE_ID_FOUND';
  threshold: number;
  action: string;
  enabled: boolean;
}

export interface SystemMetrics {
  accuracy: number;
  latency_ms: number;
  throughput_sig_sec: number;
  cpu_usage: number;
  memory_mb: number;
  uptime_seconds: number;
}
