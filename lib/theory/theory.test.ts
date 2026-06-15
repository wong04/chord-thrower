import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { formatChord } from "./qualities";
import { KEYS, transposeForInstrument } from "./transpose";
import { Level, qualityPool, randomChord, TIERS } from "./chordPool";
import { tonicChord } from "./keyHarmony";
import { scaleForChord, chordTones } from "./scales";
import { expandProgression } from "./progressionEngine";
import { PROGRESSIONS } from "./progressions";

function progById(id: string) {
	const p = PROGRESSIONS.find((x) => x.id === id);
	if (!p) throw new Error(`no progression ${id}`);
	return p;
}

describe("formatChord", () => {
	it("renders major triads as the bare root", () => {
		expect(formatChord("C", "maj")).toBe("C");
	});
	it("renders quality suffixes", () => {
		expect(formatChord("C", "maj7")).toBe("Cmaj7");
		expect(formatChord("D", "7b9")).toBe("D7♭9");
		expect(formatChord("F", "m7b5")).toBe("Fm7♭5");
	});
	it("collapses double accidentals", () => {
		expect(formatChord("E##", "7")).toBe("F♯7");
	});
});

describe("ii–V–I expands correctly in all 12 keys", () => {
	const prog = progById("ii-v-i-major");
	for (const key of KEYS) {
		it(`key of ${key}`, () => {
			const [ii, v, i] = expandProgression(prog, key);
			expect(ii.root).toBe(Note.transpose(key, "2M"));
			expect(ii.quality).toBe("m7");
			expect(v.root).toBe(Note.transpose(key, "5P"));
			expect(v.quality).toBe("7");
			expect(i.root).toBe(key);
			expect(i.quality).toBe("maj7");
		});
	}

	it("matches the canonical concert-C voicing", () => {
		const symbols = expandProgression(prog, "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Dm7", "G7", "Cmaj7"]);
	});
});

describe("instrument transposition", () => {
	it("writes a major 2nd up for B♭ instruments", () => {
		expect(transposeForInstrument("C", "Bb")).toBe("D");
		expect(transposeForInstrument("Bb", "Bb")).toBe("C");
	});
	it("writes a major 6th up for E♭ instruments", () => {
		expect(transposeForInstrument("C", "Eb")).toBe("A");
	});
	it("writes a perfect 5th up for F instruments", () => {
		expect(transposeForInstrument("C", "F")).toBe("G");
	});
	it("transposes a whole progression for the player's horn", () => {
		const prog = progById("ii-v-i-major");
		const symbols = expandProgression(prog, "C", "Bb").map((c) => c.symbol);
		expect(symbols).toEqual(["Em7", "A7", "Dmaj7"]);
	});
});

describe("difficulty tiers", () => {
	it("is cumulative — higher levels include easier qualities", () => {
		expect(qualityPool(2)).toEqual(expect.arrayContaining(TIERS[1].qualities));
		expect(qualityPool(4)).toEqual(
			expect.arrayContaining([...TIERS[1].qualities, ...TIERS[4].qualities]),
		);
	});

	for (const level of [1, 2, 3, 4] as Level[]) {
		it(`level ${level} (all keys) only ever produces qualities from its pool`, () => {
			const pool = new Set(qualityPool(level));
			for (let n = 0; n < 200; n++) {
				const chord = randomChord(level, "all", "major");
				expect(pool.has(chord.quality)).toBe(true);
			}
		});
	}

	it("favours the selected tier's own qualities (all keys)", () => {
		const tier4 = new Set(TIERS[4].qualities);
		let inTier = 0;
		const draws = 4000;
		for (let n = 0; n < draws; n++) {
			if (tier4.has(randomChord(4, "all", "major").quality)) inTier++;
		}
		// Uniform over the full level-4 pool would be ~5/23 ≈ 22%; the bias lifts it well past 40%.
		expect(inTier / draws).toBeGreaterThan(0.4);
	});
});

describe("key-aware drill (diatonic + borrowed)", () => {
	const draws = (level: Level, key: string, tonality: "major" | "minor", n = 400) =>
		new Set(
			Array.from({ length: n }, () => randomChord(level, key, tonality).symbol),
		);

	it("C major L1 stays within the diatonic triads", () => {
		const allowed = new Set(["C", "Dm", "Em", "F", "G", "Am", "B°"]);
		for (const s of draws(1, "C", "major")) expect(allowed.has(s)).toBe(true);
	});

	it("C major L2 stays diatonic (triads + 7ths, cumulative)", () => {
		const allowed = new Set([
			// L1 triads
			"C", "Dm", "Em", "F", "G", "Am", "B°",
			// L2 sevenths
			"Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7♭5",
		]);
		for (const s of draws(2, "C", "major")) expect(allowed.has(s)).toBe(true);
	});

	it("C minor L2 stays diatonic (triads + 7ths, cumulative)", () => {
		const allowed = new Set([
			// L1 triads
			"Cm", "D°", "E♭", "Fm", "G", "A♭", "B♭",
			// L2 sevenths
			"Cm7", "Dm7♭5", "E♭maj7", "Fm7", "G7", "A♭maj7", "B♭maj7",
		]);
		for (const s of draws(2, "C", "minor")) expect(allowed.has(s)).toBe(true);
	});

	it("borrowed chords only appear at L4, not L1–L2", () => {
		const borrowed = ["Fm7", "A♭maj7", "B♭7", "D♭maj7"];
		const l2 = draws(2, "C", "major");
		for (const b of borrowed) expect(l2.has(b)).toBe(false);
		const l4 = draws(4, "C", "major", 800);
		expect(borrowed.some((b) => l4.has(b))).toBe(true);
	});
});

describe("tonic chord (first chord on start)", () => {
	it("is the key's I chord at the current level", () => {
		expect(tonicChord("Eb", "major", 2).symbol).toBe("E♭maj7");
		expect(tonicChord("Eb", "major", 2).roman).toBe("Imaj7");
		expect(tonicChord("Eb", "major", 1).symbol).toBe("E♭");
		expect(tonicChord("C", "minor", 2).symbol).toBe("Cm7");
		expect(tonicChord("C", "minor", 2).roman).toBe("i7");
	});
});

describe("scales & chord tones", () => {
	it("maps qualities to sensible improv scales", () => {
		expect(scaleForChord("G", "7").name).toContain("Mixolydian");
		expect(scaleForChord("G", "7").notes).toEqual(["G", "A", "B", "C", "D", "E", "F"]);
		expect(scaleForChord("D", "m7").name).toContain("Dorian");
		expect(scaleForChord("C", "7alt").name).toContain("Altered");
		expect(scaleForChord("C", "maj7").name).toContain("Major");
	});

	it("chord tones are a subset of the chosen scale (diatonic qualities)", () => {
		for (const q of ["maj7", "m7", "7"] as const) {
			const scale = new Set(scaleForChord("C", q).notes);
			for (const tone of chordTones("C", q)) expect(scale.has(tone)).toBe(true);
		}
	});
});

describe("concert-pitch root for transposing playback", () => {
	it("matches the written root in concert (C), differs for Bb", () => {
		const concertChord = randomChord(2, "C", "major", "C");
		expect(concertChord.concertRoot).toBe(concertChord.root);
		// Eb concert tonic read by a Bb instrument is written F; concert stays Eb.
		const tonic = tonicChord("Eb", "major", 2, "Bb");
		expect(tonic.concertRoot).toBe("Eb");
		expect(tonic.root).toBe("F");
	});
});

describe("roman-numeral labels (key mode)", () => {
	it("labels chords by harmonic function in C major", () => {
		const roman = new Map<string, string>();
		for (let n = 0; n < 3000; n++) {
			const ch = randomChord(4, "C", "major");
			if (ch.roman) roman.set(ch.symbol, ch.roman);
		}
		expect(roman.get("G7")).toBe("V7");
		expect(roman.get("Dm7")).toBe("ii7");
		expect(roman.get("A7")).toBe("V7/ii"); // secondary dominant
		expect(roman.get("A♭maj7")).toBe("♭VImaj7"); // borrowed
	});

	it("chromatic 'all keys' chords carry no roman", () => {
		for (let n = 0; n < 100; n++) {
			expect(randomChord(4, "all", "major").roman).toBeUndefined();
		}
	});
});

describe("reharmonizations expand to the expected chords", () => {
	it("tritone sub in C", () => {
		const symbols = expandProgression(progById("tritone-sub"), "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Dm7", "D♭7", "Cmaj7"]);
	});
	it("backdoor ii–V in C", () => {
		const symbols = expandProgression(progById("backdoor-ii-v"), "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Fm7", "B♭7", "Cmaj7"]);
	});
});

describe("every catalog progression resolves without empty roots", () => {
	for (const prog of PROGRESSIONS) {
		it(prog.id, () => {
			const chords = expandProgression(prog, prog.defaultTonic);
			expect(chords.length).toBe(prog.chords.length);
			for (const chord of chords) {
				expect(chord.root).toMatch(/^[A-G]/);
				expect(chord.beats).toBeGreaterThan(0);
			}
		});
	}
});
