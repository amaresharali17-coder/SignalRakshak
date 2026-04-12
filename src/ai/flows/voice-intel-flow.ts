
'use server';
/**
 * @fileOverview A flow to convert tactical recommendations into voice intel using Gemini TTS.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const VoiceIntelInputSchema = z.string();
export type VoiceIntelInput = z.infer<typeof VoiceIntelInputSchema>;

const VoiceIntelOutputSchema = z.object({
  audioUrl: z.string().describe('Data URI of the generated WAV audio.'),
});
export type VoiceIntelOutput = z.infer<typeof VoiceIntelOutputSchema>;

export async function generateVoiceIntel(input: VoiceIntelInput): Promise<VoiceIntelOutput> {
  return voiceIntelFlow(input);
}

const voiceIntelFlow = ai.defineFlow(
  {
    name: 'voiceIntelFlow',
    inputSchema: VoiceIntelInputSchema,
    outputSchema: VoiceIntelOutputSchema,
  },
  async (text) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Military-like voice
          },
        },
      },
      prompt: `Speaker1: Attention Operator. ${text}`,
    });

    if (!media) throw new Error('Voice synth failed.');

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    return { audioUrl: `data:audio/wav;base64,${wavBase64}` };
  }
);

async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });
    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}
