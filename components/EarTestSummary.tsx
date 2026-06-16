"use client";

import { useState } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { EarTestSummary as Summary } from "@/lib/ear/testSummary";

export function EarTestSummary({
	summary,
	onRetake,
	onExit,
}: {
	summary: Summary;
	onRetake: () => void;
	onExit: () => void;
}) {
	const [best, setBest] = usePersistentState("earTestBest", 0);
	// Record this score against the stored best once, at mount (render-time guard).
	const [recorded, setRecorded] = useState(false);
	if (!recorded) {
		setRecorded(true);
		if (summary.scorePct > best) setBest(summary.scorePct);
	}

	return (
		<div className="flex w-full flex-col items-center gap-6">
			<div className="flex flex-col items-center gap-1">
				<div className="font-display text-6xl font-semibold leading-none text-accent">
					{summary.scorePct}%
				</div>
				<div className="text-sm text-muted">
					{summary.correct} / {summary.total} correct · best {Math.max(best, summary.scorePct)}%
				</div>
			</div>

			{summary.missed.length > 0 && (
				<div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-surface/50 p-4">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
						Missed ({summary.missed.length})
					</span>
					<ul className="flex flex-col divide-y divide-white/5">
						{summary.missed.map((m, i) => (
							<li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
								<span className="font-mono text-accent">{m.answer}</span>
								<span className="text-muted">
									you: {m.picked.length ? m.picked.join(", ") : "—"}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-surface/50 p-4">
				<span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">By answer</span>
				<ul className="flex flex-col gap-1.5">
					{summary.perCategory.map((c) => {
						const pct = Math.round((c.correct / c.total) * 100);
						return (
							<li key={c.label} className="flex items-center gap-3 text-sm">
								<span className="w-16 shrink-0 font-mono text-foreground/80">{c.label}</span>
								<div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
									<div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
								</div>
								<span className="w-14 shrink-0 text-right font-mono text-xs text-muted">
									{c.correct}/{c.total}
								</span>
							</li>
						);
					})}
				</ul>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onRetake}
					className="min-h-[44px] rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
				>
					Retake
				</button>
				<button
					type="button"
					onClick={onExit}
					className="min-h-[44px] rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-foreground hover:border-accent"
				>
					New test
				</button>
			</div>
		</div>
	);
}
