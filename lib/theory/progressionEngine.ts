import { Note } from "tonal";
import { formatChord, QualityId, simplifyRoot } from "./qualities";
import { Level } from "./chordPool";
import { Instrument, transposeForInstrument } from "./transpose";

/** Scale-degree token for a chord root, relative to the tonic. */
export type Degree =
	| "I"
	| "bII"
	| "II"
	| "bIII"
	| "III"
	| "IV"
	| "#IV"
	| "bV"
	| "V"
	| "bVI"
	| "VI"
	| "bVII"
	| "VII";

/** Interval from the tonic for each scale degree, used to spell roots via Tonal. */
export const DEGREE_INTERVAL: Record<Degree, string> = {
	I: "1P",
	bII: "2m",
	II: "2M",
	bIII: "3m",
	III: "3M",
	IV: "4P",
	"#IV": "4A",
	bV: "5d",
	V: "5P",
	bVI: "6m",
	VI: "6M",
	bVII: "7m",
	VII: "7M",
};

export type ProgressionChord = {
	degree: Degree;
	quality: QualityId;
	/** Duration in beats. A 4-beat chord fills one 4/4 bar; two 2-beat chords split a bar. */
	beats: number;
};

export type Progression = {
	id: string;
	name: string;
	level: Level;
	devices: string[];
	description: string;
	/** Suggested concert key for first display (e.g. blues in F). */
	defaultTonic: string;
	chords: ProgressionChord[];
};

export type ResolvedChord = {
	/** Written root (after instrument transposition). */
	root: string;
	/** Concert-pitch root — what reference audio should sound. */
	concertRoot: string;
	quality: QualityId;
	symbol: string;
	beats: number;
};

/** Resolve a progression template into concrete chords in a concert key. */
export function expandProgression(
	prog: Progression,
	tonic: string,
	instrument: Instrument = "C",
): ResolvedChord[] {
	return prog.chords.map((chord) => {
		const concertRoot = simplifyRoot(Note.transpose(tonic, DEGREE_INTERVAL[chord.degree]));
		const root = transposeForInstrument(concertRoot, instrument);
		return {
			root,
			concertRoot,
			quality: chord.quality,
			symbol: formatChord(root, chord.quality),
			beats: chord.beats,
		};
	});
}
