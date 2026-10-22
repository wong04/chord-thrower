"use client";

import { ChordSymbol } from "./ChordSymbol";

/** Compact now/next strip above a full chart, for when the chart itself is the stage. */
export function ChartHeader({
	symbol,
	nextSymbol,
	countdown,
	title,
	tonic,
	bar,
	barCount,
}: {
	symbol: string | null;
	nextSymbol?: string | null;
	/** Count-in number to show instead of the chord, or null. */
	countdown: number | null;
	title: string;
	tonic: string;
	/** 0-based index of the bar currently sounding. */
	bar: number;
	barCount: number;
}) {
	return (
		<div className="flex w-full max-w-2xl flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
			<div className="flex items-baseline gap-4">
				{countdown != null ? (
					<span className="w-[3ch] font-mono text-4xl leading-none text-accent tabular-nums">{countdown}</span>
				) : (
					<span className="min-w-[3ch] font-display text-4xl leading-none">{symbol ? <ChordSymbol symbol={symbol} /> : "—"}</span>
				)}
				{countdown == null && nextSymbol && (
					<span className="flex items-baseline gap-2 text-muted">
						<span className="text-xs uppercase tracking-[0.2em]">next</span>
						<span className="font-display text-xl text-foreground/75"><ChordSymbol symbol={nextSymbol} /></span>
					</span>
				)}
			</div>
			<div className="text-sm text-muted">
				{title} · key of {tonic} · bar {bar + 1}/{barCount}
			</div>
		</div>
	);
}
