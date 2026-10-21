import { Note } from "tonal";
import { Degree, ProgressionChord } from "./progressionEngine";
import { QUALITIES, QualityId } from "./qualities";

/** Chart bars are fixed at 4 beats (see groupIntoBars). */
const BEATS_PER_BAR = 4;
const HOLD_TOKENS = new Set(["%", "."]);

export class ChordParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ChordParseError";
	}
}

const normalizeAccidentals = (s: string) => s.replace(/♭/g, "b").replace(/♯/g, "#");

const QUALITY_ALIASES: Record<string, QualityId> = {
	"": "maj",
	M: "maj",
	maj: "maj",
	"-": "min",
	min: "min",
	o: "dim",
	aug: "aug",
	M7: "maj7",
	Maj7: "maj7",
	"Δ": "maj7",
	"Δ7": "maj7",
	"-7": "m7",
	min7: "m7",
	"ø": "m7b5",
	"ø7": "m7b5",
	"-7b5": "m7b5",
	o7: "dim7",
	"-6": "m6",
	"m(maj7)": "mMaj7",
	"-Δ7": "mMaj7",
	"-maj7": "mMaj7",
	"-9": "m9",
	"Δ9": "maj9",
	"6/9": "69",
	sus: "sus4",
	alt: "7alt",
};

// Every quality's id and display symbol is also accepted verbatim.
const QUALITY_LOOKUP: Record<string, QualityId> = Object.values(QUALITIES).reduce(
	(acc, q) => ({ ...acc, [q.id]: q.id, [normalizeAccidentals(q.symbol)]: q.id }),
	{ ...QUALITY_ALIASES },
);

const SEMITONE_DEGREES: Degree[] = ["I", "bII", "II", "bIII", "III", "IV", "bV", "V", "bVI", "VI", "bVII", "VII"];

/** Parse one chord symbol such as "Dm7", "B♭7♭9" or "Fø". */
export function parseChordSymbol(token: string): { root: string; quality: QualityId } {
	const match = /^([A-G][b#]?)(.*)$/.exec(normalizeAccidentals(token));
	if (!match) throw new ChordParseError(`"${token}" has no valid root (A–G)`);
	const [, root, suffix] = match;
	const quality = QUALITY_LOOKUP[suffix];
	if (!quality) throw new ChordParseError(`"${token}": unknown chord quality "${suffix}"`);
	return { root, quality };
}

function degreeFor(root: string, key: string): Degree {
	const semitones = (Note.chroma(root)! - Note.chroma(key)! + 12) % 12;
	if (semitones === 6 && root.includes("#")) return "#IV";
	return SEMITONE_DEGREES[semitones];
}

/**
 * Parse bar-delimited chord symbols ("Dm7 G7 | Cmaj7 | %") into a roman-numeral
 * template relative to `key`. Chords in a bar split it evenly; a bar of just
 * "%" or "." holds the previous chord.
 */
export function parseProgressionText(text: string, key: string): ProgressionChord[] {
	const chords: ProgressionChord[] = [];
	text.split("|").forEach((bar, i) => {
		const tokens = bar.trim().split(/\s+/).filter(Boolean);
		const barNo = i + 1;
		if (tokens.length === 0) throw new ChordParseError(`bar ${barNo} is empty`);
		if (tokens.length === 1 && HOLD_TOKENS.has(tokens[0])) {
			const prev = chords.at(-1);
			if (!prev) throw new ChordParseError(`bar ${barNo}: nothing to hold yet`);
			prev.beats += BEATS_PER_BAR;
			return;
		}
		if (![1, 2, 4].includes(tokens.length)) {
			throw new ChordParseError(`bar ${barNo}: use 1, 2 or 4 chords per bar (found ${tokens.length})`);
		}
		const beats = BEATS_PER_BAR / tokens.length;
		for (const token of tokens) {
			try {
				const { root, quality } = parseChordSymbol(token);
				chords.push({ degree: degreeFor(root, key), quality, beats });
			} catch (e) {
				if (e instanceof ChordParseError) throw new ChordParseError(`bar ${barNo}: ${e.message}`);
				throw e;
			}
		}
	});
	return chords;
}
