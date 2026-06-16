import { Scale } from "tonal";
import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";
import { shuffle } from "./earQuestion";

// Movable-do solfège, do-based (minor flattens 3, 6, 7).
const SOLFEGE: Record<Tonality, string[]> = {
	major: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti"],
	minor: ["Do", "Re", "Me", "Fa", "Sol", "Le", "Te"],
};

const OCTAVE = 4;

export type DegreeQuestion = {
	kind: "degree";
	tonic: string;
	tonality: Tonality;
	/** Pitch classes of the key's scale, degree order (index 0 = tonic). */
	scaleNotes: string[];
	/** 0-based scale-degree index of the note to identify. */
	targetIndex: number;
	/** The sounding note, e.g. "G4". */
	targetNote: string;
	/** Degree indices offered as choices. */
	options: number[];
	labels: string[];
	correctIndex: number;
};

/** Which scale degrees (0-based) are in play at a level. L1 = tonic triad, then full diatonic. */
export function degreePool(level: Level): number[] {
	if (level === 1) return [0, 2, 4]; // 1, 3, 5
	return [0, 1, 2, 3, 4, 5, 6];
}

function labelFor(index: number, tonality: Tonality): string {
	return `${index + 1} ${SOLFEGE[tonality][index]}`;
}

/**
 * Build a scale-degree ear question: a target degree in the key (to be heard after a
 * cadence plants the tonic) plus up to 3 distinct degree distractors. Generated at
 * concert pitch so the sounding note matches the answer.
 */
export function makeDegreeQuestion(settings: {
	keyChoice: string | "all";
	tonality: Tonality;
	level: Level;
}): DegreeQuestion {
	const tonic = settings.keyChoice === "all" ? KEYS[Math.floor(Math.random() * KEYS.length)] : settings.keyChoice;
	const scaleType = settings.tonality === "major" ? "major" : "aeolian";
	const scaleNotes = Scale.get(`${tonic} ${scaleType}`).notes;

	const pool = degreePool(settings.level);
	const targetIndex = pool[Math.floor(Math.random() * pool.length)];

	const chosen = [targetIndex];
	for (const d of shuffle(pool)) {
		if (chosen.length >= 4) break;
		if (!chosen.includes(d)) chosen.push(d);
	}
	const options = shuffle(chosen);

	return {
		kind: "degree",
		tonic,
		tonality: settings.tonality,
		scaleNotes,
		targetIndex,
		targetNote: `${scaleNotes[targetIndex]}${OCTAVE}`,
		options,
		labels: options.map((d) => labelFor(d, settings.tonality)),
		correctIndex: options.indexOf(targetIndex),
	};
}
