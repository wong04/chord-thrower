"use client";

import { useCallback, useEffect, useRef } from "react";
import { QualityId } from "@/lib/theory/qualities";
import { ChordPlayer } from "./chordPlayer";

export type PlayChord = (
	root: string,
	quality: QualityId,
	time: number,
	durationSeconds: number,
) => void;

/** Owns a ChordPlayer and returns a `play` that no-ops while `enabled` is false. */
export function useChordPlayer(enabled: boolean): PlayChord {
	const playerRef = useRef<ChordPlayer | null>(null);
	const enabledRef = useRef(enabled);
	useEffect(() => {
		enabledRef.current = enabled;
	});

	// Create the player as soon as audio is enabled so the piano samples preload
	// before the user presses Start.
	useEffect(() => {
		if (enabled && !playerRef.current) playerRef.current = new ChordPlayer();
	}, [enabled]);

	useEffect(() => {
		return () => {
			playerRef.current?.dispose();
			playerRef.current = null;
		};
	}, []);

	return useCallback<PlayChord>((root, quality, time, durationSeconds) => {
		if (!enabledRef.current) return;
		if (!playerRef.current) playerRef.current = new ChordPlayer();
		playerRef.current.play(root, quality, time, durationSeconds);
	}, []);
}
