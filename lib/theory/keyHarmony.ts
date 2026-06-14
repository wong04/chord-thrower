import { Note } from "tonal";
import { formatChord, QualityId } from "./qualities";
import { Degree, DEGREE_INTERVAL } from "./progressionEngine";
import { Instrument, transposeForInstrument } from "./transpose";
import type { Chord, Level } from "./chordPool";

export type Tonality = "major" | "minor";

type KeyChord = { degree: Degree; quality: QualityId };

const c = (degree: Degree, quality: QualityId): KeyChord => ({ degree, quality });

type LayerSet = {
	/** L1 */ triads: KeyChord[];
	/** L2 */ sevenths: KeyChord[];
	/** L3 */ extensions: KeyChord[];
	/** L3 */ secondary: KeyChord[];
	/** L4 (incl. altered dominants) */ borrowed: KeyChord[];
};

const MAJOR: LayerSet = {
	triads: [
		c("I", "maj"),
		c("II", "min"),
		c("III", "min"),
		c("IV", "maj"),
		c("V", "maj"),
		c("VI", "min"),
		c("VII", "dim"),
	],
	sevenths: [
		c("I", "maj7"),
		c("II", "m7"),
		c("III", "m7"),
		c("IV", "maj7"),
		c("V", "7"),
		c("VI", "m7"),
		c("VII", "m7b5"),
	],
	// Jazz "color" extensions of the diatonic chords that genuinely add a tension.
	extensions: [c("I", "maj9"), c("II", "m9"), c("IV", "maj9"), c("V", "13"), c("VI", "m9")],
	// Secondary dominants V7/x (root a 5th above each diatonic target).
	secondary: [c("VI", "7"), c("VII", "7"), c("I", "7"), c("II", "7"), c("III", "7")],
	// Modal interchange from the parallel minor + altered dominants.
	borrowed: [
		c("IV", "m7"),
		c("bVI", "maj7"),
		c("bVII", "7"),
		c("II", "m7b5"),
		c("bII", "maj7"),
		c("bIII", "maj7"),
		c("V", "7b9"),
		c("V", "7alt"),
	],
};

const MINOR: LayerSet = {
	triads: [
		c("I", "min"),
		c("II", "dim"),
		c("bIII", "maj"),
		c("IV", "min"),
		c("V", "maj"),
		c("bVI", "maj"),
		c("bVII", "maj"),
	],
	sevenths: [
		c("I", "m7"),
		c("II", "m7b5"),
		c("bIII", "maj7"),
		c("IV", "m7"),
		c("V", "7"),
		c("bVI", "maj7"),
		c("bVII", "maj7"),
	],
	extensions: [
		c("I", "m9"),
		c("I", "mMaj7"),
		c("bIII", "maj9"),
		c("IV", "m9"),
		c("V", "7b9"),
		c("bVI", "maj9"),
	],
	secondary: [c("II", "7"), c("I", "7"), c("bIII", "7")],
	borrowed: [c("bII", "maj7"), c("IV", "7"), c("V", "7alt"), c("#IV", "m7b5")],
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
	return { root, quality: kc.quality, symbol: formatChord(root, kc.quality) };
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

/** One-line summary of what a level adds, for the "?" help popover (key mode). */
export const KEY_LEVEL_BLURB: Record<Level, string> = {
	1: "Diatonic triads of the key",
	2: "Diatonic 7th chords",
	3: "+ Extensions & secondary dominants (V7/x)",
	4: "+ Borrowed (modal interchange) & altered dominants",
};
