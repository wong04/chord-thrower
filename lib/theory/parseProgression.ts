import { ChordType, Note } from "tonal";
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

/** Spelling-insensitive form of a quality suffix: "7(♭9, ♯11)" -> "7b9#11". */
const normalizeSuffix = (s: string) => normalizeAccidentals(s).replace(/[(),\s]/g, "");

/**
 * Every accepted spelling -> its quality: each quality's id, display symbol and own aliases,
 * plus Tonal's aliases for its chord type (Δ#11, M7#11, ^7, -7, ø, 7+…). A spelling claimed by
 * two qualities is a catalog bug, so it fails loudly at load rather than parsing ambiguously.
 */
const QUALITY_LOOKUP: Map<string, QualityId> = (() => {
	const lookup = new Map<string, QualityId>();
	for (const quality of Object.values(QUALITIES)) {
		const spellings = [quality.id, quality.symbol, ...(quality.aliases ?? []), ...ChordType.get(quality.chordType).aliases];
		for (const spelling of spellings) {
			const key = normalizeSuffix(spelling);
			const claimed = lookup.get(key);
			if (claimed && claimed !== quality.id) {
				throw new Error(`chord spelling "${spelling}" is claimed by both "${claimed}" and "${quality.id}"`);
			}
			lookup.set(key, quality.id);
		}
	}
	return lookup;
})();

const lookupQuality = (suffix: string) => QUALITY_LOOKUP.get(normalizeSuffix(suffix));

const SEMITONE_DEGREES: Degree[] = ["I", "bII", "II", "bIII", "III", "IV", "bV", "V", "bVI", "VI", "bVII", "VII"];

export type ParsedChord = { root: string; quality: QualityId; bass?: string };

/** Parse one chord symbol such as "Dm7", "B♭7♭9", "Cmaj7(♯11)" or a slash chord like "C/E". */
export function parseChordSymbol(token: string): ParsedChord {
	const match = /^([A-G][b#]?)(.*)$/.exec(normalizeAccidentals(token));
	if (!match) throw new ChordParseError(`"${token}" has no valid root (A–G)`);
	const [, root, suffix] = match;

	// Whole suffix first, so "6/9" stays a quality rather than a slash chord.
	const quality = lookupQuality(suffix);
	if (quality) return { root, quality };

	const slash = /^(.*)\/([^/]*)$/.exec(suffix);
	if (!slash) throw new ChordParseError(`"${token}": unknown chord quality "${suffix}"`);
	const [, upper, bass] = slash;
	if (!/^[A-G][b#]?$/.test(bass)) throw new ChordParseError(`"${token}": bass note "${bass}" isn't a note (A–G)`);
	const upperQuality = lookupQuality(upper);
	if (!upperQuality) throw new ChordParseError(`"${token}": unknown chord quality "${upper}"`);
	return { root, quality: upperQuality, bass };
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
				const { root, quality, bass } = parseChordSymbol(token);
				const chord: ProgressionChord = { degree: degreeFor(root, key), quality, beats };
				if (bass) chord.bass = degreeFor(bass, key);
				chords.push(chord);
			} catch (e) {
				if (e instanceof ChordParseError) throw new ChordParseError(`bar ${barNo}: ${e.message}`);
				throw e;
			}
		}
	});
	return chords;
}
