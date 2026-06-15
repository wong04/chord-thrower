import * as Tone from "tone";
import { Note } from "tonal";

export type { BassMode } from "./bassNote";
export { bassNote } from "./bassNote";

// Pizzicato upright/acoustic bass (FluidR3 GM "acoustic bass"), bundled under /public.
// Sampled sparsely; Tone pitch-shifts to fill the gaps, like the piano.
const BASS_BASE_URL = "/samples/bass/";
const BASS_URLS: Record<string, string> = {
	E1: "E1.mp3",
	A1: "A1.mp3",
	C2: "C2.mp3",
	D2: "D2.mp3",
	G2: "G2.mp3",
	C3: "C3.mp3",
};

/** Sampled upright bass, played one note per beat on the shared transport. */
export class Bass {
	private sampler: Tone.Sampler;

	constructor(volume = 0.85, onReady?: () => void) {
		this.sampler = new Tone.Sampler({
			urls: BASS_URLS,
			baseUrl: BASS_BASE_URL,
			release: 0.4,
			volume: Tone.gainToDb(volume),
			onload: onReady,
		}).toDestination();
	}

	get ready(): boolean {
		return this.sampler.loaded;
	}

	setVolume(volume: number): void {
		this.sampler.volume.value = Tone.gainToDb(volume);
	}

	/** Play a pitch-class note in the bass register at the given time. */
	play(note: string, time: number, durationSeconds: number): void {
		if (!this.sampler.loaded) return; // samples not ready yet — skip silently
		// Convert to Hz (sidestepping Tone's note parser for spellings like E♯ or B𝄫).
		const freq = Note.freq(`${note}2`);
		if (!freq) return;
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		this.sampler.triggerAttackRelease(freq, Math.max(0.1, durationSeconds * 0.9), at, 0.9);
	}

	dispose(): void {
		this.sampler.dispose();
	}
}
