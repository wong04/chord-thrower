import type { ResolvedChord } from "@/lib/theory/progressionEngine";

export const BEATS_PER_BAR = 4;

export type Bar = {
	chords: ResolvedChord[];
	/** Index of the first chord in this bar (into the flat chords array). */
	startIndex: number;
	/** True when this bar is a visual continuation of a multi-bar chord above it. */
	continuation?: boolean;
};

/** Group a flat chord list into 4-beat bars for the chart display. */
export function groupIntoBars(chords: ResolvedChord[]): Bar[] {
	const bars: Bar[] = [];
	let bar: ResolvedChord[] = [];
	let beats = 0;
	let startIndex = 0;
	chords.forEach((chord, i) => {
		if (bar.length === 0) startIndex = i;
		bar.push(chord);
		beats += chord.beats;
		if (beats >= BEATS_PER_BAR) {
			bars.push({ chords: bar, startIndex });
			bar = [];
			// For chords that span multiple bars (e.g. 8-beat bridge chords),
			// emit continuation placeholders so section labels stay aligned.
			let extra = beats - BEATS_PER_BAR;
			while (extra >= BEATS_PER_BAR) {
				bars.push({ chords: [], startIndex: i, continuation: true });
				extra -= BEATS_PER_BAR;
			}
			beats = extra;
		}
	});
	if (bar.length) bars.push({ chords: bar, startIndex });
	return bars;
}
