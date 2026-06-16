"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { EarItem, EarMode, makeEarItem } from "./earItem";
import { arpeggiateEarItem, EarPlayer, playEarItem } from "./earPlayback";
import { EarTestResult, EarTestSummary, summarizeTest } from "./testSummary";

export type EarTestConfig = {
	mode: EarMode;
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
	questionCount: number;
	/** Allowed attempts per question (e.g. 2 = "try twice"). */
	attempts: number;
	revealOnWrong: boolean;
};

export type EarTestState = {
	phase: "running" | "done";
	index: number;
	total: number;
	item: EarItem;
	labels: string[];
	correctIndex: number;
	picks: number[];
	resolved: boolean;
	attemptsLeft: number;
	revealOnWrong: boolean;
	ready: boolean;
	play: () => void;
	arpeggiate: () => void;
	guess: (index: number) => void;
	next: () => void;
	restart: () => void;
	summary: EarTestSummary | null;
};

function buildItems(config: EarTestConfig): EarItem[] {
	return Array.from({ length: config.questionCount }, () => makeEarItem(config));
}

/** A graded ear-training session: a fixed list of questions, attempts, and a summary. */
export function useEarTest(config: EarTestConfig, active: boolean): EarTestState {
	const { play: playChord, playPitch, arpeggiate, playSequence, ready } = useChordPlayer(active, 0.85);
	const player = useMemo<EarPlayer>(
		() => ({ play: playChord, playPitch, arpeggiate, playSequence }),
		[playChord, playPitch, arpeggiate, playSequence],
	);

	const [gen, setGen] = useState(0);
	const [items, setItems] = useState<EarItem[]>(() => buildItems(config));
	const [index, setIndex] = useState(0);
	const [picks, setPicks] = useState<number[]>([]);
	const [resolved, setResolved] = useState(false);
	const [results, setResults] = useState<EarTestResult[]>([]);
	const [phase, setPhase] = useState<"running" | "done">("running");

	// Regenerate the session when the config changes or restart() bumps `gen`
	// (render-time adjustment to props — no setState-in-effect).
	const sig = `${gen}|${config.mode}|${config.level}|${config.keyChoice}|${config.tonality}|${config.questionCount}|${config.attempts}|${config.revealOnWrong}`;
	const [prevSig, setPrevSig] = useState(sig);
	if (sig !== prevSig) {
		setPrevSig(sig);
		setItems(buildItems(config));
		setIndex(0);
		setPicks([]);
		setResolved(false);
		setResults([]);
		setPhase("running");
	}

	const item = items[index];
	const itemRef = useRef(item);
	const resolvedRef = useRef(resolved);
	const picksRef = useRef(picks);
	const indexRef = useRef(index);
	useEffect(() => {
		itemRef.current = item;
		resolvedRef.current = resolved;
		picksRef.current = picks;
		indexRef.current = index;
	});

	const play = useCallback(() => playEarItem(player, itemRef.current), [player]);
	const arpeggiateNow = useCallback(() => arpeggiateEarItem(player, itemRef.current), [player]);

	const guess = useCallback(
		(picked: number) => {
			if (resolvedRef.current) return;
			const current = itemRef.current;
			const correct = picked === current.correctIndex;
			const nextPicks = [...picksRef.current, picked];
			picksRef.current = nextPicks;
			setPicks(nextPicks);
			if (correct || nextPicks.length >= config.attempts) {
				resolvedRef.current = true;
				setResolved(true);
				setResults((rs) => [
					...rs,
					{ item: current, picks: nextPicks, correct, attemptsUsed: nextPicks.length },
				]);
			}
		},
		[config.attempts],
	);

	const next = useCallback(() => {
		if (!resolvedRef.current) return;
		const ni = indexRef.current + 1;
		if (ni >= items.length) {
			setPhase("done");
			return;
		}
		indexRef.current = ni;
		picksRef.current = [];
		resolvedRef.current = false;
		setIndex(ni);
		setPicks([]);
		setResolved(false);
		// Playback is driven by the runner's autoplay effect (keyed on index).
	}, [items.length]);

	const restart = useCallback(() => setGen((g) => g + 1), []);

	const summary = phase === "done" ? summarizeTest(results) : null;

	return useMemo(
		() => ({
			phase,
			index,
			total: items.length,
			item,
			labels: item.labels,
			correctIndex: item.correctIndex,
			picks,
			resolved,
			attemptsLeft: config.attempts - picks.length,
			revealOnWrong: config.revealOnWrong,
			ready,
			play,
			arpeggiate: arpeggiateNow,
			guess,
			next,
			restart,
			summary,
		}),
		[
			phase,
			index,
			items.length,
			item,
			picks,
			resolved,
			config.attempts,
			config.revealOnWrong,
			ready,
			play,
			arpeggiateNow,
			guess,
			next,
			restart,
			summary,
		],
	);
}
