"use client";

import { Keyboard } from "./Keyboard";

/** The answer-choice grid, shared by practice and test. Picks drive the wrong-answer
 *  strike-through (so multi-attempt tests show prior wrong guesses). */
export function OptionGrid({
	labels,
	correctIndex,
	picks,
	resolved,
	onGuess,
}: {
	labels: string[];
	correctIndex: number;
	picks: number[];
	resolved: boolean;
	onGuess: (index: number) => void;
}) {
	const cls = (i: number) => {
		const picked = picks.includes(i);
		if (resolved) {
			if (i === correctIndex) return "border-green-500 bg-green-500 text-black";
			if (picked) return "border-red-500/60 text-muted line-through";
			return "border-white/10 text-muted/60";
		}
		if (picked) return "border-red-500/60 text-muted line-through";
		return "border-white/15 text-foreground hover:border-accent/60";
	};

	return (
		<div className="grid w-full grid-cols-2 gap-3">
			{labels.map((label, i) => (
				<button
					key={i}
					type="button"
					onClick={() => onGuess(i)}
					disabled={resolved || picks.includes(i)}
					className={`min-h-[56px] rounded-xl border px-3 py-4 text-center font-mono text-lg transition-colors ${cls(i)}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}

/** Replay / arpeggiate controls, shared by practice and test. */
export function AudioControls({
	revealed,
	ready,
	onPlay,
	onArpeggiate,
}: {
	revealed: boolean;
	ready: boolean;
	onPlay: () => void;
	onArpeggiate: () => void;
}) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onPlay}
					className="min-h-[44px] rounded-full bg-accent px-7 py-3 text-base font-semibold text-black transition hover:brightness-110"
				>
					▶ {revealed ? "Replay" : "Play"}
				</button>
				<button
					type="button"
					onClick={onArpeggiate}
					title="Hear the notes one at a time"
					className="min-h-[44px] rounded-full border border-white/15 px-4 py-3 text-sm text-muted transition-colors hover:text-foreground"
				>
					⇡ Arpeggiate
				</button>
			</div>
			{!ready && <span className="text-xs text-muted">loading piano sounds…</span>}
		</div>
	);
}

/** Light up the answer notes on a piano once revealed. */
export function RevealKeyboard({ notes }: { notes: string[] }) {
	return <Keyboard chordTones={notes} scaleNotes={[]} />;
}
