"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { ensureAudioReady } from "@/lib/audio/audioContext";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { EarMode, EarQuestion, makeQuestion } from "./earQuestion";

export type { EarMode, EarQuestion } from "./earQuestion";

export type EarSettings = {
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
	mode: EarMode;
	/** Only load audio / be live while the Ear tab is open. */
	active: boolean;
};

export type EarState = {
	question: EarQuestion;
	labels: string[];
	revealed: boolean;
	correctIndex: number;
	pickedIndex: number | null;
	streak: number;
	ready: boolean;
	play: () => void;
	guess: (index: number) => void;
	next: () => void;
};

/** Ear-training quiz: hear a chord, identify it (by quality or by function). */
export function useEarTrainer(settings: EarSettings): EarState {
	const { play: playChord, ready } = useChordPlayer(settings.active, 0.85);

	const [question, setQuestion] = useState<EarQuestion>(() => makeQuestion(settings));
	const [revealed, setRevealed] = useState(false);
	const [pickedIndex, setPickedIndex] = useState<number | null>(null);
	const [streak, setStreak] = useState(0);
	const questionRef = useRef(question);
	useEffect(() => {
		questionRef.current = question;
	});

	const sound = useCallback(
		(q: EarQuestion) => {
			void ensureAudioReady().then(() => {
				playChord(q.target.concertRoot, q.target.quality, Tone.now() + 0.05, 2);
			});
		},
		[playChord],
	);

	const play = useCallback(() => sound(questionRef.current), [sound]);

	const next = useCallback(() => {
		const q = makeQuestion(settings);
		setQuestion(q);
		setRevealed(false);
		setPickedIndex(null);
		sound(q);
	}, [settings, sound]);

	const guess = useCallback(
		(index: number) => {
			if (revealed) return;
			setPickedIndex(index);
			setRevealed(true);
			setStreak((s) => (index === questionRef.current.correctIndex ? s + 1 : 0));
		},
		[revealed],
	);

	return useMemo(
		() => ({
			question,
			labels: question.labels,
			revealed,
			correctIndex: question.correctIndex,
			pickedIndex,
			streak,
			ready,
			play,
			guess,
			next,
		}),
		[question, revealed, pickedIndex, streak, ready, play, guess, next],
	);
}
