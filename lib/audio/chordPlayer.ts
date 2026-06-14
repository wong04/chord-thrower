import * as Tone from "tone";
import { Chord, Note } from "tonal";
import { QUALITIES, QualityId } from "@/lib/theory/qualities";

/**
 * Voice a chord as ascending frequencies starting around octave 3. Tonal returns
 * bare pitch classes, so we stack octaves to keep the voicing rising, then convert
 * to Hz (sidestepping Tone's note parser for spellings like E♯ or B𝄫).
 */
function voicing(root: string, quality: QualityId, startOctave = 3): number[] {
	const pitchClasses = Chord.getChord(QUALITIES[quality].chordType, root).notes;
	const freqs: number[] = [];
	let octave = startOctave;
	let prevChroma = -1;
	for (const pc of pitchClasses) {
		const chroma = Note.chroma(pc);
		if (chroma <= prevChroma) octave += 1;
		prevChroma = chroma;
		const freq = Note.freq(`${pc}${octave}`);
		if (freq) freqs.push(freq);
	}
	return freqs;
}

// Salamander Grand Piano, sampled every minor third; Tone pitch-shifts between them.
const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";
const SALAMANDER_URLS: Record<string, string> = {
	A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
	A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
	A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
	A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
	A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
	A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
	A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
	A7: "A7.mp3", C8: "C8.mp3",
};

/** Plays voiced chords on a sampled grand piano. Used only when enabled. */
export class ChordPlayer {
	private sampler: Tone.Sampler;

	constructor() {
		// Construct eagerly so the samples start downloading right away (preload).
		this.sampler = new Tone.Sampler({
			urls: SALAMANDER_URLS,
			baseUrl: SALAMANDER_BASE_URL,
			release: 1,
			volume: -6,
		}).toDestination();
	}

	play(root: string, quality: QualityId, time: number, durationSeconds: number): void {
		if (!this.sampler.loaded) return; // samples not ready yet — skip silently
		const freqs = voicing(root, quality);
		if (!freqs.length) return;
		// Never schedule in the past — that silently drops the chord.
		const at = Math.max(time, Tone.now() + 0.02);
		this.sampler.triggerAttackRelease(freqs, Math.max(0.1, durationSeconds * 0.95), at, 0.5);
	}

	dispose(): void {
		this.sampler.dispose();
	}
}
