import { Level } from "@/lib/theory/chordPool";
import { Progression } from "@/lib/theory/progressionEngine";
import { Standard } from "./standards";

/** Wrap a standard's changes as a Progression so it feeds the existing pattern engine. */
export function standardToProgression(std: Standard): Progression {
	const level = Math.min(4, Math.max(1, std.difficulty)) as Level;
	return {
		id: std.id,
		name: std.title,
		level,
		devices: [],
		description: `${std.composer} · ${std.form}`,
		defaultTonic: std.homeKey,
		chords: std.chords,
	};
}
