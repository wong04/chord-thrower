import { Chord, Scale } from "tonal";
import { QUALITIES, QualityId } from "./qualities";

const TITLE: Record<string, string> = {
	major: "Major (Ionian)",
	dorian: "Dorian",
	mixolydian: "Mixolydian",
	locrian: "Locrian",
	diminished: "Diminished",
	"whole tone": "Whole tone",
	"melodic minor": "Melodic minor",
	"lydian dominant": "Lydian dominant",
	altered: "Altered",
	lydian: "Lydian",
	"lydian augmented": "Lydian augmented",
	"phrygian dominant": "Phrygian dominant",
	"half-whole diminished": "Half-whole diminished",
};

export type ChordScale = { name: string; notes: string[] };

/** The recommended scale to improvise with over a chord, with its notes. */
export function scaleForChord(root: string, quality: QualityId): ChordScale {
	const scaleType = QUALITIES[quality].scale;
	const scale = Scale.get(`${root} ${scaleType}`);
	return { name: `${root} ${TITLE[scaleType] ?? scaleType}`, notes: scale.notes };
}

/** The notes of the chord itself (the "safe landing" tones). */
export function chordTones(root: string, quality: QualityId): string[] {
	return Chord.getChord(QUALITIES[quality].chordType, root).notes;
}
