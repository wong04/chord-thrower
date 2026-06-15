"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Tick } from "@/lib/audio/metronome";
import { Chord, Level, randomChord } from "@/lib/theory/chordPool";
import { Tonality, tonicChord } from "@/lib/theory/keyHarmony";
import { Instrument } from "@/lib/theory/transpose";

export type DrillSettings = {
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
	instrument: Instrument;
	/** How many bars each chord is held for. */
	barsPerChord: number;
	/** Called when a chord starts sounding, with its audio-clock time. */
	onChordChange?: (chord: Chord, time: number) => void;
	/** Called every beat (for the bass), with the now-current chord. */
	onBeat?: (
		concertRoot: string,
		quality: Chord["quality"],
		nextConcertRoot: string | undefined,
		beat: number,
		time: number,
	) => void;
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
		const chord = randomChord(
			settings.level,
			settings.keyChoice,
			settings.tonality,
			settings.instrument,
		);
		if (!avoid || chord.symbol !== avoid.symbol) return chord;
	}
	return randomChord(settings.level, settings.keyChoice, settings.tonality, settings.instrument);
}

/** Drives the random-chord drill: advances to a new chord every `barsPerChord` bars. */
export function useDrill(settings: DrillSettings): DrillState {
	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	});

	const [current, setCurrent] = useState<Chord | null>(null);
	const [next, setNext] = useState<Chord | null>(null);
	const currentRef = useRef<Chord | null>(null);
	const nextRef = useRef<Chord | null>(null);

	const reset = useCallback(() => {
		const s = settingsRef.current;
		// In key mode, always open on the tonic chord at the current level.
		const first =
			s.keyChoice === "all"
				? differentChord(s, null)
				: tonicChord(s.keyChoice, s.tonality, s.level, s.instrument);
		const second = differentChord(s, first);
		setCurrent(first);
		setNext(second);
		currentRef.current = first;
		nextRef.current = second;
	}, []);

	// Seed an initial chord so the display isn't empty before the first start.
	useEffect(() => {
		if (!current) reset();
	}, [current, reset]);

	const onTick = useCallback((tick: Tick) => {
		if (tick.counting) return;
		const settings = settingsRef.current;

		if (tick.beat === 0) {
			if (tick.bar === 0) {
				// First downbeat: sound the chord already on screen.
				if (currentRef.current) settings.onChordChange?.(currentRef.current, tick.time);
			} else if (tick.bar % settings.barsPerChord === 0) {
				const promoted = nextRef.current;
				const upcoming = differentChord(settings, promoted);
				currentRef.current = promoted;
				nextRef.current = upcoming;
				if (promoted) settings.onChordChange?.(promoted, tick.time);
				// Defer the on-screen swap to land on the beat, not at look-ahead.
				Tone.getDraw().schedule(() => {
					setCurrent(promoted);
					setNext(upcoming);
				}, tick.time);
			}
		}

		// Bass: every beat, follow the now-current chord.
		const cur = currentRef.current;
		if (cur) {
			settings.onBeat?.(cur.concertRoot, cur.quality, nextRef.current?.concertRoot, tick.beat, tick.time);
		}
	}, []);

	return { current, next, onTick, reset };
}
