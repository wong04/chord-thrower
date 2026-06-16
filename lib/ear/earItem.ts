import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { QualityId } from "@/lib/theory/qualities";
import { chordTones } from "@/lib/theory/scales";
import { EarMode, makeQuestion } from "./earQuestion";
import { makeDegreeQuestion } from "./degreeQuestion";

export type { EarMode } from "./earQuestion";

export type EarSettingsInput = {
	mode: EarMode;
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
};

/**
 * A normalized ear-training question the UI renders identically across exercise
 * types: a set of labels, the correct index, what to light on the keyboard when
 * revealed, and the data needed to (re)play the prompt.
 */
export type EarItem = {
	mode: EarMode;
	labels: string[];
	correctIndex: number;
	/** Label of the correct answer — used as the per-item accuracy category. */
	categoryLabel: string;
	/** Pitch classes to light on the keyboard once revealed (the answer). */
	revealNotes: string[];
	/** Present for chord exercises (quality / function). Concert pitch. */
	chord?: { root: string; quality: QualityId };
	/** Present for the scale-degree exercise. Concert pitch. */
	degree?: { tonic: string; tonality: Tonality; targetNote: string };
	/** Cadence to plant the key before the prompt (scale-degree exercise). */
	cadence?: { tonic: string; tonality: Tonality };
};

export function makeEarItem(settings: EarSettingsInput): EarItem {
	if (settings.mode === "degree") {
		const q = makeDegreeQuestion(settings);
		const targetPc = q.scaleNotes[q.targetIndex];
		return {
			mode: "degree",
			labels: q.labels,
			correctIndex: q.correctIndex,
			categoryLabel: q.labels[q.correctIndex],
			revealNotes: [targetPc],
			degree: { tonic: q.tonic, tonality: q.tonality, targetNote: q.targetNote },
			cadence: { tonic: q.tonic, tonality: q.tonality },
		};
	}

	const q = makeQuestion(settings);
	const { concertRoot, quality } = q.target;
	return {
		mode: settings.mode,
		labels: q.labels,
		correctIndex: q.correctIndex,
		categoryLabel: q.labels[q.correctIndex],
		revealNotes: chordTones(concertRoot, quality),
		chord: { root: concertRoot, quality },
	};
}
