import { Chord, Note } from "tonal";
import { QUALITIES, QualityId } from "@/lib/theory/qualities";

export type Voicing = "block" | "shell" | "rootless";

/** Pick which chord tones to sound for a voicing style. */
function voiceTones(pitchClasses: string[], voicing: Voicing): string[] {
	if (voicing === "shell" && pitchClasses.length >= 4) {
		return [pitchClasses[0], pitchClasses[1], pitchClasses[3]]; // root, 3rd, 7th
	}
	if (voicing === "rootless" && pitchClasses.length >= 3) {
		return pitchClasses.slice(1); // drop the root: 3-5-7-(9…)
	}
	return pitchClasses;
}

/** Octave the chord starts in; a slash bass sits an octave below it. */
const CHORD_OCTAVE = 3;

/**
 * Voice a chord as ascending frequencies starting around octave 3, with an optional slash
 * bass underneath in octave 2. Tonal returns bare pitch classes, so we stack octaves to keep
 * the voicing rising, then convert to Hz (sidestepping Tone's note parser for spellings like
 * E♯ or B𝄫).
 */
export function voiceChord(root: string, quality: QualityId, style: Voicing = "block", bass?: string): number[] {
	const pitchClasses = voiceTones(Chord.getChord(QUALITIES[quality].chordType, root).notes, style);
	const freqs: number[] = [];
	if (bass) {
		const bassFreq = Note.freq(`${bass}${CHORD_OCTAVE - 1}`);
		if (bassFreq) freqs.push(bassFreq);
	}
	let octave = CHORD_OCTAVE;
	let prevChroma = -1;
	for (const pc of pitchClasses) {
		const chroma = Note.chroma(pc);
		if (chroma <= prevChroma) octave += 1;
		prevChroma = chroma;
		const freq = Note.freq(`${pc}${octave}`);
		if (freq) freqs.push(freq);
	}
	return freqs;
}
