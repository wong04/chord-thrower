import { Chord, Scale } from "tonal";
import { QUALITIES, QualityId } from "./qualities";

/** A sensible improvisation scale (parent scale) for each chord quality. */
const SCALE_FOR_QUALITY: Record<QualityId, string> = {
	maj: "major",
	min: "dorian",
	dim: "diminished",
	aug: "whole tone",
	maj7: "major",
	m7: "dorian",
	"7": "mixolydian",
	m7b5: "locrian",
	dim7: "diminished",
	"6": "major",
	m6: "dorian",
	mMaj7: "melodic minor",
	"9": "mixolydian",
	maj9: "major",
	m9: "dorian",
	"11": "mixolydian",
	"13": "mixolydian",
	"69": "major",
	sus4: "mixolydian",
	"7b9": "altered",
	"7#9": "altered",
	"7#11": "lydian dominant",
	"7b13": "altered",
	"7alt": "altered",
};

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
};

export type ChordScale = { name: string; notes: string[] };

/** The recommended scale to improvise with over a chord, with its notes. */
export function scaleForChord(root: string, quality: QualityId): ChordScale {
	const scaleType = SCALE_FOR_QUALITY[quality];
	const scale = Scale.get(`${root} ${scaleType}`);
	return { name: `${root} ${TITLE[scaleType] ?? scaleType}`, notes: scale.notes };
}

/** The notes of the chord itself (the "safe landing" tones). */
export function chordTones(root: string, quality: QualityId): string[] {
	return Chord.getChord(QUALITIES[quality].chordType, root).notes;
}
