/**
 * delay step — Wait for specified duration before next step
 * Note: In-process execution caps at 5 minutes. Use Temporal for long delays (24h, 72h).
 */

const MAX_IN_PROCESS_DELAY_MS = 5 * 60 * 1000;

export type DelayInput = {
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
};

export async function executeDelay(input: DelayInput): Promise<void> {
  let ms = 0;
  if (input.seconds) ms += input.seconds * 1000;
  if (input.minutes) ms += input.minutes * 60 * 1000;
  if (input.hours) ms += input.hours * 60 * 60 * 1000;
  if (input.days) ms += input.days * 24 * 60 * 60 * 1000;
  ms = Math.min(ms, MAX_IN_PROCESS_DELAY_MS);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}
