import { Note } from "tonal";
import { formatChord, QualityId } from "./qualities";
import { Degree, DEGREE_INTERVAL } from "./progressionEngine";
import { Instrument, transposeForInstrument } from "./transpose";
import type { Chord, Level } from "./chordPool";

export type Tonality = "major" | "minor";

type KeyChord = { degree: Degree; quality: QualityId; roman: string };

const c = (degree: Degree, quality: QualityId, roman: string): KeyChord => ({
	degree,
	quality,
	roman,
});

type LayerSet = {
	/** L1 */ triads: KeyChord[];
	/** L2 */ sevenths: KeyChord[];
	/** L3 */ extensions: KeyChord[];
	/** L3 */ secondary: KeyChord[];
	/** L4 (incl. altered dominants) */ borrowed: KeyChord[];
};

const MAJOR: LayerSet = {
	triads: [
		c("I", "maj", "I"),
		c("II", "min", "ii"),
		c("III", "min", "iii"),
		c("IV", "maj", "IV"),
		c("V", "maj", "V"),
		c("VI", "min", "vi"),
		c("VII", "dim", "vii°"),
	],
	sevenths: [
		c("I", "maj7", "Imaj7"),
		c("II", "m7", "ii7"),
		c("III", "m7", "iii7"),
		c("IV", "maj7", "IVmaj7"),
		c("V", "7", "V7"),
		c("VI", "m7", "vi7"),
		c("VII", "m7b5", "viiø7"),
	],
	extensions: [
		c("I", "maj9", "Imaj9"),
		c("II", "m9", "ii9"),
		c("IV", "maj9", "IVmaj9"),
		c("V", "13", "V13"),
		c("VI", "m9", "vi9"),
	],
	secondary: [
		c("VI", "7", "V7/ii"),
		c("VII", "7", "V7/iii"),
		c("I", "7", "V7/IV"),
		c("II", "7", "V7/V"),
		c("III", "7", "V7/vi"),
	],
	borrowed: [
		c("IV", "m7", "iv7"),
		c("bVI", "maj7", "♭VImaj7"),
		c("bVII", "7", "♭VII7"),
		c("II", "m7b5", "iiø7"),
		c("bII", "maj7", "♭IImaj7"),
		c("bIII", "maj7", "♭IIImaj7"),
		c("V", "7b9", "V7♭9"),
		c("V", "7alt", "V7alt"),
	],
};

const MINOR: LayerSet = {
	triads: [
		c("I", "min", "i"),
		c("II", "dim", "ii°"),
		c("bIII", "maj", "♭III"),
		c("IV", "min", "iv"),
		c("V", "maj", "V"),
		c("bVI", "maj", "♭VI"),
		c("bVII", "maj", "♭VII"),
	],
	sevenths: [
		c("I", "m7", "i7"),
		c("II", "m7b5", "iiø7"),
		c("bIII", "maj7", "♭IIImaj7"),
		c("IV", "m7", "iv7"),
		c("V", "7", "V7"),
		c("bVI", "maj7", "♭VImaj7"),
		c("bVII", "maj7", "♭VIImaj7"),
	],
	extensions: [
		c("I", "m9", "i9"),
		c("I", "mMaj7", "i(maj7)"),
		c("bIII", "maj9", "♭IIImaj9"),
		c("IV", "m9", "iv9"),
		c("V", "7b9", "V7♭9"),
		c("bVI", "maj9", "♭VImaj9"),
	],
	secondary: [c("II", "7", "V7/V"), c("I", "7", "V7/iv"), c("bIII", "7", "V7/♭VI")],
	borrowed: [
		c("bII", "maj7", "♭IImaj7"),
		c("IV", "7", "IV7"),
		c("V", "7alt", "V7alt"),
		c("#IV", "m7b5", "♯ivø7"),
	],
};

const SETS: Record<Tonality, LayerSet> = { major: MAJOR, minor: MINOR };

/** Chords newly introduced at this level (the "+ what's new" layer). */
export function keyChordIncrement(tonality: Tonality, level: Level): KeyChord[] {
	const s = SETS[tonality];
	switch (level) {
		case 1:
			return s.triads;
		case 2:
			return s.sevenths;
		case 3:
			return [...s.extensions, ...s.secondary];
		case 4:
			return s.borrowed;
	}
}

/** Cumulative pool available at a level (every layer up to and including it). */
export function keyChordPool(tonality: Tonality, level: Level): KeyChord[] {
	const pool: KeyChord[] = [];
	for (let l = 1 as Level; l <= level; l = (l + 1) as Level) {
		pool.push(...keyChordIncrement(tonality, l));
	}
	return pool;
}

/** Probability that a draw comes from the level's new layer rather than the whole pool. */
const INCREMENT_BIAS = 0.6;

function pick<T>(items: readonly T[], rng: () => number): T {
	return items[Math.floor(rng() * items.length)];
}

function build(tonic: string, kc: KeyChord, instrument: Instrument): Chord {
	const concertRoot = Note.transpose(tonic, DEGREE_INTERVAL[kc.degree]);
	const root = transposeForInstrument(concertRoot, instrument);
	return { root, quality: kc.quality, symbol: formatChord(root, kc.quality), roman: kc.roman };
}

/**
 * Draw a chord that belongs to `tonic`'s key (diatonic, plus borrowed/secondary
 * chords at higher levels), favouring the level's newly-introduced layer.
 */
export function randomKeyChord(
	tonic: string,
	tonality: Tonality,
	level: Level,
	instrument: Instrument = "C",
	rng: () => number = Math.random,
): Chord {
	const fromIncrement = level > 1 && rng() < INCREMENT_BIAS;
	const set = fromIncrement ? keyChordIncrement(tonality, level) : keyChordPool(tonality, level);
	return build(tonic, pick(set, rng), instrument);
}

// The tonic (I) chord at a level-appropriate quality, for the first chord on Start.
const TONIC_CHORD: Record<Tonality, Record<Level, { quality: QualityId; roman: string }>> = {
	major: {
		1: { quality: "maj", roman: "I" },
		2: { quality: "maj7", roman: "Imaj7" },
		3: { quality: "maj9", roman: "Imaj9" },
		4: { quality: "maj9", roman: "Imaj9" },
	},
	minor: {
		1: { quality: "min", roman: "i" },
		2: { quality: "m7", roman: "i7" },
		3: { quality: "m9", roman: "i9" },
		4: { quality: "m9", roman: "i9" },
	},
};

/** The key's I chord at the current level — shown first when the drill starts. */
export function tonicChord(
	tonic: string,
	tonality: Tonality,
	level: Level,
	instrument: Instrument = "C",
): Chord {
	const { quality, roman } = TONIC_CHORD[tonality][level];
	return build(tonic, { degree: "I", quality, roman }, instrument);
}

/** One-line summary of what a level adds, for the "?" help popover (key mode). */
export const KEY_LEVEL_BLURB: Record<Level, string> = {
	1: "Diatonic triads of the key",
	2: "Diatonic 7th chords",
	3: "+ Extensions & secondary dominants (V7/x)",
	4: "+ Borrowed (modal interchange) & altered dominants",
};
