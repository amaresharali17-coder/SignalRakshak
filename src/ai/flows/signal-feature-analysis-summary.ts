'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing RF signal characteristics.
 *
 * - summarizeSignalFeatures - A function that takes extracted RF signal features and returns a natural language summary.
 * - SignalFeaturesInput - The input type for the summarizeSignalFeatures function.
 * - SignalSummaryOutput - The return type for the summarizeSignalFeatures function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SignalFeaturesInputSchema = z.object({
  peak_amplitude: z.number().describe('The highest point of the signal waveform.'),
  rms_power: z.number().describe('The energy level of the signal.'),
  fft_entropy: z.number().describe('How organized the frequency spectrum is (lower for organized, higher for chaotic).'),
  bandwidth: z.number().describe('The spread of frequencies present in the signal (in Hz).'),
  kurtosis: z.number().describe('The spikiness or peakedness of the signal distribution.'),
  noise: z.number().describe('The percentage of noise in the signal.'),
  zero_crossing_rate: z.number().describe('How often the signal crosses the zero amplitude level.'),
  spectral_centroid: z.number().describe('The center of the frequency mass (in Hz).')
});
export type SignalFeaturesInput = z.infer<typeof SignalFeaturesInputSchema>;

const SignalSummaryOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of the RF signal characteristics.')
});
export type SignalSummaryOutput = z.infer<typeof SignalSummaryOutputSchema>;

/**
 * Summarizes the technical features of an RF signal into a human-readable format.
 * Returns the summary string directly for UI consumption.
 * Includes a robust fallback for API unavailability.
 */
export async function summarizeSignalFeatures(input: SignalFeaturesInput): Promise<string> {
  try {
    const result = await signalFeatureAnalysisSummaryFlow(input);
    return result.summary;
  } catch (error: any) {
    // Only log essential error info to prevent console bloat during 503 spikes
    const status = error?.status || error?.code || 'UNKNOWN';
    console.warn(`[SIG-INT] Signal summary flow unavailable (Status: ${status})`);
    return 'SECURE LINK CONGESTED. TECHNICAL SUMMARY UNAVAILABLE. RE-TRIANGULATING...';
  }
}

const prompt = ai.definePrompt({
  name: 'signalFeatureSummaryPrompt',
  input: { schema: SignalFeaturesInputSchema },
  output: { schema: SignalSummaryOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert RF signal analyst on a battlefield, providing critical insights to a commander.
Your task is to analyze the provided RF signal features and give a concise, easy-to-understand natural language summary of its technical characteristics. Explain what each key feature suggests about the signal's nature (e.g., organized, chaotic, consistent, spiky) in the context of potential Friendly, Unknown, or Hostile signals.

Use the following reference to interpret the features:

Signal Type | Peak Amplitude | FFT Entropy | Bandwidth | Kurtosis | Noise
------------------------------------------------------------------------------------------------
Friendly    | ~0.4           | Low (~2.5)  | ~250 Hz   | ~3.0     | ~5%
Unknown     | ~0.6           | Medium (~3.5)| ~480 Hz   | ~3.5     | ~15%
Hostile     | ~1.2           | High (~4.5) | ~620 Hz   | 5+       | ~40%


Signal Features:
- Peak Amplitude: {{{peak_amplitude}}}
- RMS Power: {{{rms_power}}}
- FFT Entropy: {{{fft_entropy}}}
- Bandwidth: {{{bandwidth}}} Hz
- Kurtosis: {{{kurtosis}}}
- Noise: {{{noise}}}%
- Zero Crossing Rate: {{{zero_crossing_rate}}}
- Spectral Centroid: {{{spectral_centroid}}} Hz


Based on these features, summarize the signal's characteristics. Focus on the most impactful features and what they imply about the signal's potential origin or intent. Keep it concise and actionable for a commander.`,
});

const signalFeatureAnalysisSummaryFlow = ai.defineFlow(
  {
    name: 'signalFeatureAnalysisSummaryFlow',
    inputSchema: SignalFeaturesInputSchema,
    outputSchema: SignalSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate signal summary.');
    }
    return output;
  }
);
