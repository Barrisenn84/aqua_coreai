import { AquaCoreDiagnosticResult, Batch, SensorReading, Tank } from '../types/aquacore';
import { runAquaCoreRuleEngine } from '../utils/aquacultureMath';

export interface AnalyzePayload {
  tank: Tank;
  batch: Batch;
  reading: SensorReading;
  biometry?: {
    avgWeightG: number;
    sampleSize: number;
    mortalityCount: number;
    uniformityPct: number;
  };
  customPrompt?: string;
  contextMode?: 'cot_audit' | 'emergency_override' | 'harvest_oracle' | 'chat';
}

export async function requestAquaCoreAnalysis(payload: AnalyzePayload): Promise<AquaCoreDiagnosticResult> {
  try {
    const res = await fetch('/api/aqua-core/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.chainOfThought && data.action) {
        return data as AquaCoreDiagnosticResult;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API offline or unavailable, running deterministic local AquaCore engine:', err);
  }

  // Guaranteed deterministic fallback with zero delay and strict CoT compliance
  return runAquaCoreRuleEngine({
    tank: payload.tank,
    batch: payload.batch,
    reading: payload.reading,
    biometry: payload.biometry,
    queryOverride: payload.customPrompt,
  });
}
