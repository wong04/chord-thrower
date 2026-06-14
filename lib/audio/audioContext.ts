import * as Tone from "tone";

let started = false;

/**
 * Resume the AudioContext. Must be called from a user gesture (e.g. a click)
 * the first time, per browser autoplay policy. Safe to call repeatedly.
 */
export async function ensureAudioReady(): Promise<void> {
	if (started) return;
	await Tone.start();
	started = true;
}
