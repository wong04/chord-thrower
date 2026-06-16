"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { EarItem, EarMode, makeEarItem } from "./earItem";
import { arpeggiateEarItem, EarPlayer, playEarItem } from "./earPlayback";

export type { EarMode } from "./earItem";
export type { EarItem } from "./earItem";

export type EarSettings = {
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
	mode: EarMode;
	/** Only load audio / be live while the Ear tab is open. */
	active: boolean;
};

export type EarStats = { correct: number; total: number };

export type EarState = {
	item: EarItem;
	labels: string[];
	revealed: boolean;
	correctIndex: number;
	pickedIndex: number | null;
	streak: number;
	stats: EarStats;
	ready: boolean;
	play: () => void;
	arpeggiate: () => void;
	guess: (index: number) => void;
	next: () => void;
};

/** Ear-training quiz: hear a chord/note in a key and identify it. */
export function useEarTrainer(settings: EarSettings): EarState {
	const { play: playChord, playPitch, arpeggiate, playSequence, ready } = useChordPlayer(
		settings.active,
		0.85,
	);
	const player = useMemo<EarPlayer>(
		() => ({ play: playChord, playPitch, arpeggiate, playSequence }),
		[playChord, playPitch, arpeggiate, playSequence],
	);

	const [item, setItem] = useState<EarItem>(() => makeEarItem(settings));
	const [revealed, setRevealed] = useState(false);
	const [pickedIndex, setPickedIndex] = useState<number | null>(null);
	const [streak, setStreak] = useState(0);
	const [stats, setStats] = useState<EarStats>({ correct: 0, total: 0 });

	// Reset the question + stats when the exercise settings change (render-time
	// adjustment to props — the sanctioned pattern, no effect/setState-in-effect).
	const sig = `${settings.mode}|${settings.level}|${settings.keyChoice}|${settings.tonality}`;
	const [prevSig, setPrevSig] = useState(sig);
	if (sig !== prevSig) {
		setPrevSig(sig);
		setItem(makeEarItem(settings));
		setRevealed(false);
		setPickedIndex(null);
		setStreak(0);
		setStats({ correct: 0, total: 0 });
	}

	const itemRef = useRef(item);
	const revealedRef = useRef(revealed);
	useEffect(() => {
		itemRef.current = item;
		revealedRef.current = revealed;
	});

	const play = useCallback(() => playEarItem(player, itemRef.current), [player]);
	const arpeggiateNow = useCallback(() => arpeggiateEarItem(player, itemRef.current), [player]);

	const guess = useCallback((index: number) => {
		if (revealedRef.current) return;
		const correct = index === itemRef.current.correctIndex;
		setPickedIndex(index);
		setRevealed(true);
		setStreak((s) => (correct ? s + 1 : 0));
		setStats((st) => ({ correct: st.correct + (correct ? 1 : 0), total: st.total + 1 }));
	}, []);

	const next = useCallback(() => {
		const q = makeEarItem(settings);
		setItem(q);
		itemRef.current = q;
		setRevealed(false);
		setPickedIndex(null);
		playEarItem(player, q);
	}, [settings, player]);

	return useMemo(
		() => ({
			item,
			labels: item.labels,
			revealed,
			correctIndex: item.correctIndex,
			pickedIndex,
			streak,
			stats,
			ready,
			play,
			arpeggiate: arpeggiateNow,
			guess,
			next,
		}),
		[item, revealed, pickedIndex, streak, stats, ready, play, arpeggiateNow, guess, next],
	);
}
