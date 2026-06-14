import { Note } from "tonal";
import { simplifyRoot } from "./qualities";

export type Instrument = "C" | "Bb" | "Eb" | "F";

export const INSTRUMENTS: { id: Instrument; label: string }[] = [
	{ id: "C", label: "Concert (C)" },
	{ id: "Bb", label: "B♭ (tenor sax, trumpet, clarinet)" },
	{ id: "Eb", label: "E♭ (alto/bari sax)" },
	{ id: "F", label: "F (French horn)" },
];

/**
 * Interval to add to a concert-pitch note to get the written pitch for a
 * transposing instrument. A Bb instrument sounds a major 2nd below what it
 * reads, so its written pitch is a major 2nd above concert, and so on.
 */
const WRITTEN_FROM_CONCERT: Record<Instrument, string> = {
	C: "1P",
	Bb: "2M",
	Eb: "6M",
	F: "5P",
};

/** Transpose a concert-pitch root into the written pitch for the given instrument. */
export function transposeForInstrument(root: string, instrument: Instrument): string {
	if (instrument === "C") return simplifyRoot(root);
	return simplifyRoot(Note.transpose(root, WRITTEN_FROM_CONCERT[instrument]));
}

/** The twelve practice keys, spelled for readability. */
export const KEYS: string[] = [
	"C",
	"Db",
	"D",
	"Eb",
	"E",
	"F",
	"Gb",
	"G",
	"Ab",
	"A",
	"Bb",
	"B",
];
