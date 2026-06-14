"use client";

import { Bar } from "@/lib/pattern/usePattern";

export function PatternChart({
	bars,
	activeIndex,
}: {
	bars: Bar[];
	activeIndex: number;
}) {
	return (
		<div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
			{bars.map((bar, barIdx) => (
				<div
					key={barIdx}
					className="flex min-h-16 items-stretch gap-1 rounded-xl border border-white/10 bg-surface/40 p-1"
				>
					{bar.chords.map((chord, i) => {
						const globalIndex = bar.startIndex + i;
						const active = globalIndex === activeIndex;
						return (
							<div
								key={i}
								className={`flex flex-1 items-center justify-center rounded-lg px-1 text-center font-mono text-sm font-medium transition-colors ${
									active ? "bg-accent text-black" : "text-foreground/75"
								}`}
							>
								{chord.symbol}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}
