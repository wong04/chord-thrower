import * as Tone from "tone";
import { establishKeyCadence } from "@/lib/theory/keyHarmony";
import { ensureAudioReady } from "@/lib/audio/audioContext";
import { Arpeggiate, PlayChord, PlayPitch, PlaySequence } from "@/lib/audio/useChordPlayer";
import { EarItem } from "./earItem";

export type EarPlayer = {
	play: PlayChord;
	playPitch: PlayPitch;
	arpeggiate: Arpeggiate;
	playSequence: PlaySequence;
};

const CADENCE_PER_CHORD = 0.55; // seconds per cadence chord
const CHORD_SECONDS = 2;
const NOTE_SECONDS = 1.6;

/** Sound an ear question: cadence-then-note for degree mode, a voiced chord otherwise. */
export function playEarItem(player: EarPlayer, item: EarItem): void {
	void ensureAudioReady().then(() => {
		const start = Tone.now() + 0.05;
		if (item.degree && item.cadence) {
			const cadence = establishKeyCadence(item.cadence.tonic, item.cadence.tonality);
			player.playSequence(cadence, start, CADENCE_PER_CHORD);
			const noteAt = start + cadence.length * CADENCE_PER_CHORD + 0.15;
			player.playPitch(item.degree.targetNote, noteAt, NOTE_SECONDS);
			return;
		}
		if (item.chord) {
			player.play(item.chord.root, item.chord.quality, start, CHORD_SECONDS);
		}
	});
}

/** Re-hear the prompt spread out: arpeggiate the chord, or replay the degree note alone. */
export function arpeggiateEarItem(player: EarPlayer, item: EarItem): void {
	void ensureAudioReady().then(() => {
		const start = Tone.now() + 0.05;
		if (item.degree) {
			player.playPitch(item.degree.targetNote, start, NOTE_SECONDS);
			return;
		}
		if (item.chord) {
			player.arpeggiate(item.chord.root, item.chord.quality, start);
		}
	});
}
