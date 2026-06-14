"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tick } from "@/lib/audio/metronome";
import { Chord, Level, randomChord } from "@/lib/theory/chordPool";
import { Instrument } from "@/lib/theory/transpose";

export type DrillSettings = {
	level: Level;
	keyChoice: string | "all";
	instrument: Instrument;
	/** How many bars each chord is held for. */
	barsPerChord: number;
};

export type DrillState = {
	current: Chord | null;
	next: Chord | null;
	/** Feed this to the metronome so chords advance in time. */
	onTick: (tick: Tick) => void;
	/** Generate a fresh pair of chords (call when (re)starting). */
	reset: () => void;
};

function differentChord(settings: DrillSettings, avoid: Chord | null): Chord {
	for (let attempt = 0; attempt < 8; attempt++) {
		const chord = randomChord(settings.level, settings.keyChoice, settings.instrument);
		if (!avoid || chord.symbol !== avoid.symbol) return chord;
	}
	return randomChord(settings.level, settings.keyChoice, settings.instrument);
}

/** Drives the random-chord drill: advances to a new chord every `barsPerChord` bars. */
export function useDrill(settings: DrillSettings): DrillState {
	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	});

	const [current, setCurrent] = useState<Chord | null>(null);
	const [next, setNext] = useState<Chord | null>(null);
	const nextRef = useRef<Chord | null>(null);

	const reset = useCallback(() => {
		const first = differentChord(settingsRef.current, null);
		const second = differentChord(settingsRef.current, first);
		setCurrent(first);
		setNext(second);
		nextRef.current = second;
	}, []);

	// Seed an initial chord so the display isn't empty before the first start.
	useEffect(() => {
		if (!current) reset();
	}, [current, reset]);

	const onTick = useCallback((tick: Tick) => {
		if (tick.counting || tick.beat !== 0 || tick.bar <= 0) return;
		if (tick.bar % settingsRef.current.barsPerChord !== 0) return;

		const promoted = nextRef.current;
		const upcoming = differentChord(settingsRef.current, promoted);
		setCurrent(promoted);
		setNext(upcoming);
		nextRef.current = upcoming;
	}, []);

	return { current, next, onTick, reset };
}
