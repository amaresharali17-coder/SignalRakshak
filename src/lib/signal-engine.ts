import { RFSignal, SignalClassification, ThreatLevel, SignalFeatures, SignalLocation } from './types';

/**
 * Generates samples for a given signal type.
 */
function generateSamples(type: SignalClassification): number[] {
  const samples = new Array(100).fill(0);
  const noiseLevel = type === 'FRIENDLY' ? 0.05 : type === 'UNKNOWN' ? 0.2 : 0.5;
  const peak = type === 'FRIENDLY' ? 0.4 : type === 'UNKNOWN' ? 0.6 : 1.2;

  return samples.map((_, i) => {
    let base = 0;
    if (type === 'FRIENDLY') {
      base = Math.sin(i * 0.2) * 0.35 + Math.sin(i * 0.4) * 0.05;
    } else if (type === 'UNKNOWN') {
      base = Math.sin(i * Math.random()) * 0.4;
    } else {
      base = Math.random() > 0.9 ? peak * (0.8 + Math.random() * 0.4) : Math.random() * 0.2;
    }
    return base + (Math.random() - 0.5) * noiseLevel;
  });
}

/**
 * Generates a random IP address, occasionally reusing common ones.
 */
function generateIp(): string {
  const commonIps = ['192.168.1.104', '10.0.0.45', '172.16.254.1', '192.168.0.22', '10.0.5.12'];
  if (Math.random() > 0.7) return commonIps[Math.floor(Math.random() * commonIps.length)];
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

/**
 * Generates a location within India's tactical bounds.
 * Latitude: 8.4 to 37.6
 * Longitude: 68.1 to 97.4
 */
function generateLocation(): SignalLocation {
  const lat = 8.4 + Math.random() * (37.6 - 8.4);
  const lng = 68.1 + Math.random() * (97.4 - 68.1);
  
  const sectors = ['NORTH-ALPHA', 'SOUTH-DELTA', 'EAST-GAMMA', 'WEST-SIGMA', 'CENTRAL-OMEGA', 'BORDER-ZULU'];
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  
  const origins = [
    "New Delhi Strategic Command",
    "Mumbai Coastal Relay",
    "Ladakh High-Altitude Outpost",
    "Kolkata Sector Node",
    "Chennai Maritime Array",
    "Rajasthan Desert Radar",
    "Assam Border Surveillance",
    "Bangalore Cyber Hub"
  ];
  const predicted_origin = origins[Math.floor(Math.random() * origins.length)];

  return { lat, lng, sector, predicted_origin };
}

/**
 * Calculates features based on signal samples and type.
 */
function calculateFeatures(samples: number[], type: SignalClassification): SignalFeatures {
  const peak_amplitude = Math.max(...samples.map(Math.abs));
  const rms_power = Math.sqrt(samples.reduce((acc, s) => acc + s * s, 0) / samples.length);
  const crest_factor = rms_power > 0 ? peak_amplitude / rms_power : 0;
  
  const profiles = {
    FRIENDLY: {
      fft_entropy: 2.5 + Math.random() * 0.2,
      bandwidth: 250 + Math.random() * 10,
      kurtosis: 3.0 + Math.random() * 0.2,
      noise: 5 + Math.random() * 2,
      zero_crossing_rate: 0.15,
      spectral_centroid: 450,
    },
    UNKNOWN: {
      fft_entropy: 3.5 + Math.random() * 0.3,
      bandwidth: 480 + Math.random() * 50,
      kurtosis: 3.5 + Math.random() * 0.5,
      noise: 15 + Math.random() * 5,
      zero_crossing_rate: 0.3,
      spectral_centroid: 487,
    },
    HOSTILE: {
      fft_entropy: 4.5 + Math.random() * 0.5,
      bandwidth: 620 + Math.random() * 80,
      kurtosis: 5.2 + Math.random() * 1.5,
      noise: 40 + Math.random() * 10,
      zero_crossing_rate: 0.6,
      spectral_centroid: 550,
    }
  };

  const profile = profiles[type];
  return {
    peak_amplitude,
    rms_power,
    crest_factor,
    ...profile,
  };
}

/**
 * Generates a mock signal with persistent characteristics.
 */
export function generateMockSignal(id: number, forcedType?: SignalClassification): RFSignal {
  const types: SignalClassification[] = ['FRIENDLY', 'UNKNOWN', 'HOSTILE'];
  const classification = forcedType || types[Math.floor(Math.random() * types.length)];
  const samples = generateSamples(classification);
  const features = calculateFeatures(samples, classification);
  
  const confidence = 0.92 + Math.random() * 0.08;
  const threat_level: ThreatLevel = 
    classification === 'FRIENDLY' ? 'LOW' :
    classification === 'UNKNOWN' ? 'MEDIUM' : 'HIGH';

  const probabilities = {
    friendly: classification === 'FRIENDLY' ? confidence : (1 - confidence) / 2,
    unknown: classification === 'UNKNOWN' ? confidence : (1 - confidence) / 2,
    hostile: classification === 'HOSTILE' ? confidence : (1 - confidence) / 2,
  };

  return {
    id,
    timestamp: new Date().toISOString(),
    classification,
    confidence,
    threat_level,
    source_ip: generateIp(),
    location: generateLocation(),
    probabilities,
    features,
    samples,
    alert_triggered: classification === 'HOSTILE',
  };
}
