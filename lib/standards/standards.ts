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
	/** Public-domain melody may be shipped (pre-~1930). Chord changes ship regardless. */
	publicDomain: boolean;
	difficulty: 1 | 2 | 3 | 4 | 5;
	/** Concert home key the changes/melody are written in. */
	homeKey: string;
	form: string;
	/** Roman-numeral changes relative to homeKey — transposable; drives chart + backing. */
	chords: ProgressionChord[];
	/** Full ABC tune (melody + chord symbols) in homeKey. PD tunes only. */
	melodyAbc?: string;
};

export const STANDARDS: Standard[] = [
	{
		id: "blue-bossa",
		title: "Blue Bossa",
		composer: "Kenny Dorham",
		year: 1963,
		publicDomain: false,
		difficulty: 2,
		homeKey: "C",
		form: "16-bar · minor",
		// i | iv | ii°–V | i | bIII–bVI ii-V into bII | ii°–V | i
		chords: [
			c("I", "m7", 8),
			c("IV", "m7", 8),
			c("II", "m7b5", 4),
			c("V", "7b9", 4),
			c("I", "m7", 8),
			c("bIII", "m7", 4),
			c("bVI", "7", 4),
			c("bII", "maj7", 8),
			c("II", "m7b5", 4),
			c("V", "7b9", 4),
			c("I", "m7", 8),
		],
	},
	{
		id: "take-the-a-train",
		title: "Take the “A” Train",
		composer: "Billy Strayhorn",
		year: 1939,
		publicDomain: false,
		difficulty: 2,
		homeKey: "C",
		form: "AABA · 32",
		chords: [
			// A
			c("I", "maj7", 8), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 4), c("V", "7", 4),
			// A
			c("I", "maj7", 8), c("II", "7", 8), c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 4), c("V", "7", 4),
			// B (to IV)
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
		publicDomain: false,
		difficulty: 2,
		homeKey: "G",
		form: "32 · relative ii–V cycle",
		chords: [
			// A1: iv bVII bIII bVI | ii° V i
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
		publicDomain: false,
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
		publicDomain: false,
		difficulty: 2,
		homeKey: "A",
		form: "16 · minor",
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
		publicDomain: true,
		difficulty: 2,
		homeKey: "G",
		form: "12-bar blues (first strain)",
		chords: [
			c("I", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("I", "7", 4),
			c("IV", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("I", "7", 4),
			c("V", "7", 4), c("IV", "7", 4), c("I", "7", 4), c("V", "7", 4),
		],
		melodyAbc: `X:1
T:St. Louis Blues (first strain)
C:W. C. Handy (1914) — Public Domain
M:4/4
L:1/8
K:G
"G7" B3 B B2 A2 | "C7" G4 z4 | "G7" B3 B B2 A2 | "G7" G4 z4 |
"C7" e3 e e2 d2 | "C7" c4 z4 | "G7" B3 B B2 A2 | "G7" G4 z4 |
"D7" A3 A B2 A2 | "C7" G2 E2 G2 A2 | "G7" B4 A2 G2 | "D7" G4 z4 |]`,
	},
	{
		id: "after-youve-gone",
		title: "After You've Gone",
		composer: "Creamer & Layton",
		year: 1918,
		publicDomain: true,
		difficulty: 2,
		homeKey: "F",
		form: "16 · major",
		chords: [
			c("I", "maj7", 4), c("I", "7", 4), c("IV", "maj7", 4), c("IV", "m7", 4),
			c("I", "maj7", 4), c("VI", "7", 4), c("II", "7", 4), c("V", "7", 4),
			c("I", "maj7", 4), c("I", "7", 4), c("IV", "maj7", 4), c("IV", "m7", 4),
			c("I", "maj7", 2), c("VI", "7", 2), c("II", "7", 2), c("V", "7", 2), c("I", "maj7", 8),
		],
		melodyAbc: `X:1
T:After You've Gone (chorus)
C:Creamer & Layton (1918) — Public Domain
M:4/4
L:1/8
K:F
"F" A3 G A2 c2 | "F7" c6 A2 | "Bb" d3 c d2 f2 | "Bbm" f6 z2 |
"F" c3 A c2 F2 | "D7" A3 F A2 d2 | "G7" d4 "C7" c4 | "F" F6 z2 |]`,
	},
];

export function standardById(id: string): Standard | undefined {
	return STANDARDS.find((s) => s.id === id);
}
