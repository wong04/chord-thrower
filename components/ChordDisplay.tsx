"use client";

import { ChordSymbol } from "./ChordSymbol";

export function ChordDisplay({
	symbol,
	nextSymbol,
	showNext,
	countdown,
	focused = false,
	roman,
	showRoman = false,
}: {
	symbol: string | null;
	nextSymbol?: string | null;
	showNext: boolean;
	/** Count-in number to show instead of the chord, or null. */
	countdown?: number | null;
	focused?: boolean;
	/** Roman-numeral analysis of the current chord, relative to the key. */
	roman?: string | null;
	showRoman?: boolean;
}) {
	const chordSize = focused ? "clamp(4.5rem, 26vw, 18rem)" : "clamp(3rem, 15vw, 9rem)";

	return (
		<div className="flex min-h-44 flex-col items-center justify-center gap-4 px-2 text-center">
			<div className="h-6 font-mono text-lg tracking-wide text-accent">
				{countdown == null && showRoman && roman ? roman : null}
			</div>

			{countdown != null ? (
				<div
					className="font-mono font-medium leading-none text-accent tabular-nums"
					style={{ fontSize: focused ? "clamp(6rem, 30vw, 20rem)" : "clamp(4rem, 20vw, 11rem)" }}
				>
					{countdown}
				</div>
			) : (
				<div
					className="font-display font-medium leading-none tracking-tight break-words"
					style={{ fontSize: chordSize }}
				>
					{symbol ? <ChordSymbol symbol={symbol} /> : "—"}
				</div>
			)}

			<div className="flex h-8 items-baseline gap-2 text-muted">
				{countdown == null && showNext && nextSymbol ? (
					<>
						<span className="text-xs uppercase tracking-[0.2em]">next</span>
						<span className="font-display text-2xl text-foreground/75"><ChordSymbol symbol={nextSymbol} /></span>
					</>
				) : null}
			</div>
		</div>
	);
}
