import * as Tone from "tone";
import { Note } from "tonal";

export type { BassMode } from "./bassNote";
export { bassNote } from "./bassNote";

/** Simple sine bass voice, played one note per beat on the shared transport. */
export class Bass {
	private synth: Tone.Synth | null = null;

	constructor(volume = 0.85) {
		this.getSynth().volume.value = Tone.gainToDb(volume);
	}

	private getSynth(): Tone.Synth {
		if (!this.synth) {
			this.synth = new Tone.Synth({
				oscillator: { type: "sine" },
				envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.25 },
			}).toDestination();
		}
		return this.synth;
	}

	setVolume(volume: number): void {
		this.getSynth().volume.value = Tone.gainToDb(volume);
	}

	/** Play a pitch-class note in the bass register at the given time. */
	play(note: string, time: number, durationSeconds: number): void {
		const freq = Note.freq(`${note}2`);
		if (!freq) return;
		const at = Math.max(time, Tone.getContext().currentTime);
		this.getSynth().triggerAttackRelease(freq, Math.max(0.1, durationSeconds * 0.9), at, 0.9);
	}

	dispose(): void {
		this.synth?.dispose();
		this.synth = null;
	}
}
