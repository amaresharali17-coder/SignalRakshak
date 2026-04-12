
'use server';
/**
 * @fileOverview A flow to generate a satellite reconnaissance video using Veo 2.0.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SatelliteReconInputSchema = z.object({
  sector: z.string().describe('The tactical sector for the recon.'),
  description: z.string().describe('Description of the target area.'),
});
export type SatelliteReconInput = z.infer<typeof SatelliteReconInputSchema>;

const SatelliteReconOutputSchema = z.object({
  videoUrl: z.string().describe('Data URI of the generated mp4 video.'),
});
export type SatelliteReconOutput = z.infer<typeof SatelliteReconOutputSchema>;

export async function generateSatelliteReconVideo(input: SatelliteReconInput): Promise<SatelliteReconOutput> {
  return satelliteReconFlow(input);
}

const satelliteReconFlow = ai.defineFlow(
  {
    name: 'satelliteReconFlow',
    inputSchema: SatelliteReconInputSchema,
    outputSchema: SatelliteReconOutputSchema,
  },
  async (input) => {
    try {
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: `A top-down cinematic high-tech military satellite thermal view of ${input.description} in ${input.sector}. Tactical overlays, grainy realistic footage, moving armored vehicles.`,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });

      if (!operation) throw new Error('Model failed to initiate recon.');

      while (!operation.done) {
        operation = await ai.checkOperation(operation);
        if (!operation.done) await new Promise((r) => setTimeout(r, 4000));
      }

      if (operation.error) throw new Error(operation.error.message);

      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video || !video.media) throw new Error('Recon imagery not found.');

      // Fetch and base64 encode
      const response = await fetch(`${video.media.url}&key=${process.env.GEMINI_API_KEY}`);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return { videoUrl: `data:video/mp4;base64,${base64}` };
    } catch (e: any) {
      console.error("[RECON] Satellite link failed:", e);
      throw e;
    }
  }
);
