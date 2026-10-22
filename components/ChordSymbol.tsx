const HAND_ACCIDENTAL: Record<string, string> = { "♭": "b", "♯": "#" };

/**
 * A chord symbol with its accidentals raised, the way hand-lettered charts write them: ♭ and ♯
 * become a small "b" and "#" in the same pen, so they match the hand font's stroke weight.
 */
export function ChordSymbol({ symbol }: { symbol: string }) {
	return (
		<>
			{symbol.split(/([♭♯])/).map((part, i) =>
				HAND_ACCIDENTAL[part] ? (
					<sup key={i} aria-label={part === "♭" ? "flat" : "sharp"} className="mx-[0.03em] align-[0.42em] text-[0.68em] leading-none">
						{HAND_ACCIDENTAL[part]}
					</sup>
				) : (
					part
				),
			)}
		</>
	);
}
