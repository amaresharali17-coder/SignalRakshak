'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating explanations and recommended actions
 * based on a classified RF signal, helping battlefield commanders make informed tactical decisions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ThreatExplanationAndRecommendationInputSchema = z.object({
  signal_id: z.number().describe('Unique identifier for the RF signal.'),
  timestamp: z.string().describe('Timestamp of when the signal was processed (ISO format).'),
  classification: z.enum(['FRIENDLY', 'UNKNOWN', 'HOSTILE']).describe('The classification of the RF signal.'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the classification (0-1).'),
  threat_level: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Assigned threat level.'),
  source_ip: z.string().optional().describe('The identified IP address of the signal source.'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    sector: z.string(),
  }).optional().describe('Geospatial intelligence regarding the signal origin.'),
  probabilities: z.object({
    friendly: z.number().min(0).max(1),
    unknown: z.number().min(0).max(1),
    hostile: z.number().min(0).max(1),
  }).describe('Probabilities for each classification category.'),
  features: z.object({
    peak_amplitude: z.number().describe('Highest point in the signal.'),
    rms_power: z.number().describe('Energy level of the signal.'),
    fft_entropy: z.number().describe('How organized the frequency spectrum is.'),
    bandwidth: z.number().describe('Spread of frequencies in Hz.'),
    kurtosis: z.number().describe('Spikiness of the signal.'),
  }).describe('Extracted key features of the RF signal.'),
  alert_triggered: z.boolean().describe('Whether an alert was triggered.'),
});
export type ThreatExplanationAndRecommendationInput = z.infer<typeof ThreatExplanationAndRecommendationInputSchema>;

const ThreatExplanationAndRecommendationOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation for the signal classification based on its features and origin.'),
  recommended_action: z.string().describe('A context-aware recommended action based on the classification and threat level.'),
});
export type ThreatExplanationAndRecommendationOutput = z.infer<typeof ThreatExplanationAndRecommendationOutputSchema>;

/**
 * Generates a tactical explanation and recommendation.
 * Includes a fallback for API unavailability.
 */
export async function explainThreatAndRecommendAction(input: ThreatExplanationAndRecommendationInput): Promise<ThreatExplanationAndRecommendationOutput> {
  try {
    return await threatExplanationAndRecommendationFlow(input);
  } catch (error: any) {
    const status = error?.status || error?.code || 'UNKNOWN';
    console.warn(`[SIG-INT] Threat assessment flow unavailable (Status: ${status})`);
    return {
      explanation: 'NEURAL LINK DELAYED. INTELLIGENCE ASSESSMENT UNAVAILABLE DUE TO SECURE CHANNEL CONGESTION.',
      recommended_action: 'MAINTAIN CURRENT OPERATIONAL POSTURE. AWAITING RE-ESTABLISHMENT.'
    };
  }
}

const threatExplanationAndRecommendationPrompt = ai.definePrompt({
  name: 'threatExplanationAndRecommendationPrompt',
  input: { schema: ThreatExplanationAndRecommendationInputSchema },
  output: { schema: ThreatExplanationAndRecommendationOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are a high-level Signal Intelligence (SIGINT) AI in a battlefield command center. 
Your objective is to interpret RF signal data and provide a tactical assessment for a commander.

Intelligence Profile:
- ID: {{{signal_id}}}
- Origin IP: {{{source_ip}}}
- Tactical Sector: {{{location.sector}}}
- Coordinates: {{{location.lat}}}, {{{location.lng}}}
- Classification: {{{classification}}} (Confidence: {{{confidence}}})
- Threat Assessment: {{{threat_level}}}

Technical characteristics:
- FFT Entropy: {{{features.fft_entropy}}} (Complexity)
- Bandwidth: {{{features.bandwidth}}} Hz
- Peak Amplitude: {{{features.peak_amplitude}}}
- Kurtosis: {{{features.kurtosis}}} (Signal spikiness)

Provide a tactical explanation for this classification. Mention if the location/IP suggests anything significant (e.g., origin from a restricted sector or a known relay node). 
Then, provide a context-aware recommendation.

Classification Reference:
- FRIENDLY: Low entropy, consistent patterns, authorized sector.
- UNKNOWN: Medium entropy, random frequency hopping, unidentified origin.
- HOSTILE: High entropy, chaotic spikes, unauthorized sector or jamming attempts.

Recommended Action Format:
- If FRIENDLY: "Monitor and log."
- If UNKNOWN: "Dispatch reconnaissance, maintain secondary lock."
- If HOSTILE: "Deploy countermeasures, prioritize sector suppression."`,
});

const threatExplanationAndRecommendationFlow = ai.defineFlow(
  {
    name: 'threatExplanationAndRecommendationFlow',
    inputSchema: ThreatExplanationAndRecommendationInputSchema,
    outputSchema: ThreatExplanationAndRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await threatExplanationAndRecommendationPrompt(input);
    if (!output) throw new Error('Failed to generate assessment.');
    return output;
  }
);
