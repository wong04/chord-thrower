"use client";

import { useEffect, useRef } from "react";
import { EarTestConfig, useEarTest } from "@/lib/ear/useEarTest";
import { AudioControls, OptionGrid, RevealKeyboard } from "./EarOptions";
import { EarTestSummary } from "./EarTestSummary";

export function EarTestRunner({
	config,
	active,
	onExit,
}: {
	config: EarTestConfig;
	active: boolean;
	onExit: () => void;
}) {
	const test = useEarTest(config, active);
	const { ready, index, play, summary } = test;

	// Auto-play each question once audio is ready (and on each new question).
	const playedFor = useRef(-1);
	useEffect(() => {
		if (summary) return;
		if (ready && playedFor.current !== index) {
			playedFor.current = index;
			play();
		}
	}, [ready, index, play, summary]);

	if (summary) {
		return (
			<EarTestSummary
				summary={summary}
				onRetake={() => {
					playedFor.current = -1;
					test.restart();
				}}
				onExit={onExit}
			/>
		);
	}

	const showReveal = test.resolved && (test.picks.includes(test.correctIndex) || test.revealOnWrong);

	return (
		<div className="flex w-full flex-col items-center gap-6">
			<div className="flex w-full items-center justify-between text-sm text-muted">
				<button type="button" onClick={onExit} className="hover:text-foreground">
					← Exit
				</button>
				<span className="font-mono">
					Q {index + 1} / {test.total}
				</span>
				<span>
					{test.attemptsLeft > 0 ? `${test.attemptsLeft} ${test.attemptsLeft === 1 ? "try" : "tries"} left` : "—"}
				</span>
			</div>

			<AudioControls
				revealed={test.resolved}
				ready={ready}
				onPlay={test.play}
				onArpeggiate={test.arpeggiate}
			/>

			<OptionGrid
				labels={test.labels}
				correctIndex={test.correctIndex}
				picks={test.picks}
				resolved={test.resolved}
				onGuess={test.guess}
			/>

			{showReveal && <RevealKeyboard notes={test.item.revealNotes} />}

			{test.resolved && (
				<button
					type="button"
					onClick={test.next}
					className="min-h-[44px] rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
				>
					{index + 1 >= test.total ? "See results →" : "Next →"}
				</button>
			)}
		</div>
	);
}
