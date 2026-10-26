import { Note } from "tonal";

export type QualityId =
	// triads
	| "maj"
	| "min"
	| "dim"
	| "aug"
	| "sus4"
	| "sus2"
	// sevenths & sixths
	| "maj7"
	| "m7"
	| "7"
	| "m7b5"
	| "dim7"
	| "6"
	| "m6"
	| "mMaj7"
	| "7sus4"
	// extensions
	| "9"
	| "maj9"
	| "m9"
	| "11"
	| "m11"
	| "13"
	| "maj13"
	| "m13"
	| "69"
	| "m69"
	| "add9"
	| "mMaj9"
	| "9sus4"
	// lydian colours
	| "maj7#11"
	| "maj9#11"
	| "7#11"
	| "9#11"
	| "13#11"
	| "maj7#5"
	// altered dominants
	| "7b9"
	| "7#9"
	| "7b13"
	| "7b5"
	| "7#5"
	| "7b9b13"
	| "7b9#11"
	| "7#9b13"
	| "13b9"
	| "7alt";

export type Quality = {
	id: QualityId;
	/** Suffix appended to the root for display, e.g. "maj7" -> "Cmaj7". */
	symbol: string;
	/** Readable quality name (no root), e.g. "Half-dim" — used for quality ear training. */
	name: string;
	/** Tonal chord type, used to resolve the chord's notes for audio playback. */
	chordType: string;
	/** Tonal scale name: the parent scale to improvise with over this chord. */
	scale: string;
	/** Extra spellings the chord parser accepts, on top of the id, symbol and Tonal's own aliases. */
	aliases?: string[];
};

const b = "♭"; // ♭
const s = "♯"; // ♯

const q = (id: QualityId, symbol: string, name: string, chordType: string, scale: string, aliases?: string[]): Quality => ({
	id,
	symbol,
	name,
	chordType,
	scale,
	aliases,
});

export const QUALITIES: Record<QualityId, Quality> = {
	maj: q("maj", "Maj", "Major", "major", "major"),
	min: q("min", "m", "Minor", "minor", "dorian"),
	dim: q("dim", "°", "Diminished", "diminished", "diminished"),
	aug: q("aug", "+", "Augmented", "augmented", "whole tone"),
	sus4: q("sus4", "sus4", "Sus4", "sus4", "mixolydian", ["sus"]),
	sus2: q("sus2", "sus2", "Sus2", "sus2", "major"),

	maj7: q("maj7", "maj7", "Major 7", "maj7", "major", ["Δ7"]),
	m7: q("m7", "m7", "Minor 7", "m7", "dorian", ["min7"]),
	"7": q("7", "7", "Dominant 7", "7", "mixolydian"),
	m7b5: q("m7b5", `m7${b}5`, "Half-dim", "m7b5", "locrian", ["ø7", "min7b5"]),
	dim7: q("dim7", "°7", "Diminished 7", "dim7", "diminished"),
	"6": q("6", "6", "Major 6", "6", "major"),
	m6: q("m6", "m6", "Minor 6", "m6", "dorian", ["-6"]),
	mMaj7: q("mMaj7", "mMaj7", "Minor-Major 7", "mMaj7", "melodic minor", ["-Δ7", "-maj7", "mmaj7", "-Δ"]),
	"7sus4": q("7sus4", "7sus4", "Dominant 7sus4", "7sus4", "mixolydian"),

	"9": q("9", "9", "Dominant 9", "9", "mixolydian"),
	maj9: q("maj9", "maj9", "Major 9", "maj9", "major", ["Δ9"]),
	m9: q("m9", "m9", "Minor 9", "m9", "dorian", ["-9"]),
	"11": q("11", "11", "Dominant 11", "11", "mixolydian"),
	m11: q("m11", "m11", "Minor 11", "m11", "dorian"),
	"13": q("13", "13", "Dominant 13", "13", "mixolydian"),
	maj13: q("maj13", "maj13", "Major 13", "maj13", "major", ["Δ13"]),
	m13: q("m13", "m13", "Minor 13", "m13", "dorian"),
	"69": q("69", "6/9", "6/9", "69", "major"),
	m69: q("m69", "m6/9", "Minor 6/9", "m69", "dorian", ["-69", "-6/9"]),
	add9: q("add9", "add9", "Major add9", "add9", "major"),
	mMaj9: q("mMaj9", "mMaj9", "Minor-Major 9", "mM9", "melodic minor", ["mmaj9", "-Δ9"]),
	"9sus4": q("9sus4", "9sus4", "Dominant 9sus4", "9sus4", "mixolydian"),

	"maj7#11": q("maj7#11", `maj7${s}11`, "Lydian (maj7♯11)", "maj7#11", "lydian", ["Δ7#11"]),
	"maj9#11": q("maj9#11", `maj9${s}11`, "Lydian (maj9♯11)", "maj9#11", "lydian"),
	"7#11": q("7#11", `7${s}11`, `Dom 7${s}11`, "7#11", "lydian dominant"),
	"9#11": q("9#11", `9${s}11`, `Dom 9${s}11`, "9#11", "lydian dominant"),
	"13#11": q("13#11", `13${s}11`, `Dom 13${s}11`, "13#11", "lydian dominant"),
	"maj7#5": q("maj7#5", `maj7${s}5`, `Major 7${s}5`, "maj7#5", "lydian augmented", ["Δ7#5", "Δ#5"]),

	"7b9": q("7b9", `7${b}9`, `Dom 7${b}9`, "7b9", "altered"),
	"7#9": q("7#9", `7${s}9`, `Dom 7${s}9`, "7#9", "altered"),
	"7b13": q("7b13", `7${b}13`, `Dom 7${b}13`, "7b13", "altered"),
	"7b5": q("7b5", `7${b}5`, `Dom 7${b}5`, "7b5", "whole tone"),
	"7#5": q("7#5", `7${s}5`, `Dom 7${s}5`, "7#5", "whole tone"),
	"7b9b13": q("7b9b13", `7${b}9${b}13`, `Dom 7${b}9${b}13`, "7b9b13", "phrygian dominant"),
	"7b9#11": q("7b9#11", `7${b}9${s}11`, `Dom 7${b}9${s}11`, "7b9#11", "half-whole diminished"),
	"7#9b13": q("7#9b13", `7${s}9${b}13`, `Dom 7${s}9${b}13`, "7#9b13", "altered"),
	"13b9": q("13b9", `13${b}9`, `Dom 13${b}9`, "13b9", "half-whole diminished"),
	"7alt": q("7alt", "7alt", "Altered", "7alt", "altered", ["alt"]),
};

/** Collapse double accidentals (E##, Cbb) to a readable enharmonic spelling. */
export function simplifyRoot(root: string): string {
	if (root.includes("##") || root.includes("bb")) {
		return Note.simplify(root);
	}
	return root;
}

/** Prettify ASCII accidentals (Bb, F#) into Unicode (B♭, F♯) for display. */
function prettyRoot(root: string): string {
	return root.replace(/#/g, s).replace(/b/g, b);
}

/** Render a chord symbol, e.g. ("C","maj7") -> "Cmaj7", or with a slash bass ("C","maj7","E") -> "Cmaj7/E". */
export function formatChord(root: string, quality: QualityId, bass?: string): string {
	const pretty = prettyRoot(simplifyRoot(root));
	if (!bass) return `${pretty}${QUALITIES[quality].symbol}`;
	// Charts write a major triad over a bass bare ("C/E", not "CMaj/E").
	const suffix = quality === "maj" ? "" : QUALITIES[quality].symbol;
	return `${pretty}${suffix}/${prettyRoot(simplifyRoot(bass))}`;
}
