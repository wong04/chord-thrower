import { Degree, ProgressionChord } from "@/lib/theory/progressionEngine";
import { QualityId } from "@/lib/theory/qualities";

/** Terse chord constructor: c(degree, quality, beats) — relative to the tune's home key. */
function c(degree: Degree, quality: QualityId, beats: number): ProgressionChord {
	return { degree, quality, beats };
}

export type Standard = {
	id: string;
	title: string;
	composer: string;
	year: number;
	difficulty: 1 | 2 | 3 | 4 | 5;
	/** Concert home key the changes are written in. */
	homeKey: string;
	form: string;
	/** Roman-numeral changes relative to homeKey — transposable; drives chart + backing. */
	chords: ProgressionChord[];
	/** Optional section labels for the chord chart, e.g. A/B/C markers. */
	sections?: Array<{ bar: number; label: string }>;
};

export const STANDARDS: Standard[] = [
	{
		id: "blue-bossa",
		title: "Blue Bossa",
		composer: "Kenny Dorham",
		year: 1963,
		difficulty: 2,
		homeKey: "C",
		form: "16-bar · minor",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "B" }, { bar: 12, label: "A" }],
		chords: [
			// A — C minor
			c("I", "m7", 8),
			c("IV", "m7", 8),
			c("II", "m7b5", 4), c("V", "7b9", 4),
			c("I", "m7", 8),
			// B — Db major
			c("bIII", "m7", 4), c("bVI", "7", 4),
			c("bII", "maj7", 8),
			// A' — back to C minor
			c("II", "m7b5", 4), c("V", "7b9", 4),
			c("I", "m7", 8),
		],
	},
	{
		id: "take-the-a-train",
		title: 'Take the “A” Train',
		composer: "Billy Strayhorn",
		year: 1939,
		difficulty: 2,
		homeKey: "C",
		form: "AABA · 32",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "A" }, { bar: 16, label: "B" }, { bar: 24, label: "A" }],
		chords: [
			// A
			c("I", "maj7", 8), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 4), c("V", "7", 4),
			// A
			c("I", "maj7", 8), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 4), c("V", "7", 4),
			// B
			c("IV", "maj7", 16), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4),
			// A
			c("I", "maj7", 8), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 8),
		],
	},
	{
		id: "autumn-leaves",
		title: "Autumn Leaves",
		composer: "Joseph Kosma",
		year: 1945,
		difficulty: 2,
		homeKey: "G",
		form: "AABC · 32",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "A" }, { bar: 16, label: "B" }, { bar: 24, label: "C" }],
		chords: [
			// A1
			c("IV", "m7", 4), c("bVII", "7", 4), c("bIII", "maj7", 4), c("bVI", "maj7", 4),
			c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m7", 8),
			// A2
			c("IV", "m7", 4), c("bVII", "7", 4), c("bIII", "maj7", 4), c("bVI", "maj7", 4),
			c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m7", 8),
			// B
			c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m7", 8),
			c("IV", "m7", 4), c("bVII", "7", 4), c("bIII", "maj7", 4), c("bVI", "maj7", 4),
			// C
			c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m7", 8),
			c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m7", 8),
		],
	},
	{
		id: "lady-bird",
		title: "Lady Bird",
		composer: "Tadd Dameron",
		year: 1939,
		difficulty: 3,
		homeKey: "C",
		form: "16 · Dameron turnaround",
		chords: [
			c("I", "maj7", 8),
			c("IV", "m7", 4), c("bVII", "7", 4),
			c("I", "maj7", 8),
			c("bVII", "m7", 4), c("bIII", "7", 4),
			c("VI", "m7", 4), c("II", "7", 4),
			c("II", "m7", 4), c("V", "7", 4),
			// Tadd Dameron turnaround: Cmaj7 Eb7 | Abmaj7 Db7
			c("I", "maj7", 2), c("bIII", "7", 2), c("bVI", "maj7", 2), c("bII", "7", 2),
			c("I", "maj7", 8),
		],
	},
	{
		id: "summertime",
		title: "Summertime",
		composer: "George Gershwin",
		year: 1935,
		difficulty: 2,
		homeKey: "A",
		form: "16 · minor",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "B" }],
		chords: [
			c("I", "m7", 4), c("II", "m7b5", 2), c("V", "7", 2), c("I", "m7", 4), c("V", "m7", 2), c("I", "7", 2),
			c("IV", "m7", 4), c("bVI", "7", 4), c("V", "7", 8),
			c("I", "m7", 4), c("II", "m7b5", 2), c("V", "7", 2), c("I", "m7", 4), c("V", "m7", 2), c("I", "7", 2),
			c("IV", "m7", 4), c("I", "m7", 4), c("II", "m7b5", 2), c("V", "7", 2), c("I", "m7", 4),
		],
	},
	{
		id: "st-louis-blues",
		title: "St. Louis Blues",
		composer: "W. C. Handy",
		year: 1914,
		difficulty: 2,
		homeKey: "G",
		form: "12-bar blues",
		chords: [
			c("I", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("I", "7", 4),
			c("IV", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("I", "7", 4),
			c("V", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("V", "7", 4),
		],
	},
	{
		id: "after-youve-gone",
		title: "After You've Gone",
		composer: "Creamer & Layton",
		year: 1918,
		difficulty: 2,
		homeKey: "F",
		form: "16 · major",
		chords: [
			c("I", "maj7", 4), c("I", "7", 4), c("IV", "maj7", 4), c("IV", "m7", 4),
			c("I", "maj7", 4), c("VI", "7", 4), c("II", "7", 4), c("V", "7", 4),
			c("I", "maj7", 4), c("I", "7", 4), c("IV", "maj7", 4), c("IV", "m7", 4),
			c("I", "maj7", 2), c("VI", "7", 2), c("II", "7", 2), c("V", "7", 2), c("I", "maj7", 8),
		],
	},
	{
		id: "giant-steps",
		title: "Giant Steps",
		composer: "John Coltrane",
		year: 1960,
		difficulty: 4,
		homeKey: "B",
		form: "16 · Coltrane changes",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "B" }],
		// 3-tonic cycle: B (I) → G (bVI) → Eb (III), each preceded by its own V7
		chords: [
			// A
			c("I", "maj7", 4),                         // Bmaj7
			c("bIII", "7", 4),                          // D7
			c("bVI", "maj7", 4),                        // Gmaj7
			c("VII", "7", 4),                           // Bb7
			c("III", "maj7", 4),                        // Ebmaj7
			c("bVII", "m7", 2), c("bIII", "7", 2),     // Am7  D7
			c("bVI", "maj7", 4),                        // Gmaj7
			c("VII", "7", 4),                           // Bb7
			// B
			c("III", "maj7", 4),                        // Ebmaj7
			c("V", "7", 4),                             // F#7
			c("I", "maj7", 4),                          // Bmaj7
			c("bV", "m7", 2), c("VII", "7", 2),         // Fm7  Bb7
			c("III", "maj7", 4),                        // Ebmaj7
			c("II", "7", 4),                            // C#7
			c("V", "maj7", 4),                          // F#maj7
			c("II", "7", 2), c("V", "7", 2),            // C#7  F#7 (turnaround)
		],
	},
	{
		id: "so-what",
		title: "So What",
		composer: "Miles Davis",
		year: 1959,
		difficulty: 2,
		homeKey: "D",
		form: "AABA · 32 · modal",
		sections: [{ bar: 0, label: "A" }, { bar: 8, label: "A" }, { bar: 16, label: "B" }, { bar: 24, label: "A" }],
		// D Dorian (A sections), Eb Dorian = bII (B section)
		chords: [
			// A
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
			// A
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
			// B — Eb Dorian
			c("bII", "m7", 4), c("bII", "m7", 4), c("bII", "m7", 4), c("bII", "m7", 4),
			c("bII", "m7", 4), c("bII", "m7", 4), c("bII", "m7", 4), c("bII", "m7", 4),
			// A
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
			c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4), c("I", "m7", 4),
		],
	},
];

export function standardById(id: string): Standard | undefined {
	return STANDARDS.find((s) => s.id === id);
}
