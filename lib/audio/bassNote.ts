import { Note } from "tonal";
import { QualityId } from "@/lib/theory/qualities";
import { chordTones } from "@/lib/theory/scales";

export type BassMode = "off" | "roots" | "walking";

/**
 * The bass note (pitch class) to play on a given beat, following the changes.
 * - "roots": root on beat 1, fifth on beat 3.
 * - "walking": a note every beat — root, chord tones, then a chromatic approach
 *   into the next chord's root on the last beat of the bar.
 */
export function bassNote(opts: {
	mode: BassMode;
	root: string;
	quality: QualityId;
	beat: number;
	beatsPerBar: number;
	nextRoot?: string;
}): string | null {
	const { mode, root, quality, beat, beatsPerBar, nextRoot } = opts;
	if (mode === "off") return null;

	const tones = chordTones(root, quality);
	const fifth = tones[2] ?? Note.transpose(root, "5P");

	if (mode === "roots") {
		if (beat === 0) return root;
		if (beatsPerBar >= 4 && beat === 2) return fifth;
		return null;
	}

	// walking
	if (beat === 0) return root;
	const last = beatsPerBar - 1;
	if (beat === last && nextRoot) return Note.transpose(nextRoot, "-2m"); // half step below next root
	const mids = tones.slice(1); // 3rd, 5th, (7th)
	return mids.length ? mids[(beat - 1) % mids.length] : fifth;
}
