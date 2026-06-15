"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QualityId } from "@/lib/theory/qualities";
import { ChordPlayer } from "./chordPlayer";

export type PlayChord = (
	root: string,
	quality: QualityId,
	time: number,
	durationSeconds: number,
) => void;

/**
 * Owns a ChordPlayer and returns a `play` that no-ops while `enabled` is false,
 * plus a `ready` flag that is false while the piano samples are still loading.
 * @param volume chord level as linear gain (0–1).
 */
export function useChordPlayer(enabled: boolean, volume: number): { play: PlayChord; ready: boolean } {
	const playerRef = useRef<ChordPlayer | null>(null);
	const [ready, setReady] = useState(false);
	const enabledRef = useRef(enabled);
	useEffect(() => {
		enabledRef.current = enabled;
	});
	const volumeRef = useRef(volume);
	useEffect(() => {
		volumeRef.current = volume;
	});

	// Create the player as soon as audio is enabled so the piano samples preload
	// before the user presses Start.
	useEffect(() => {
		if (enabled && !playerRef.current) {
			playerRef.current = new ChordPlayer(volumeRef.current, () => setReady(true));
			if (playerRef.current.ready) setReady(true);
		}
	}, [enabled]);

	// Keep the live player's level in sync with the slider.
	useEffect(() => {
		playerRef.current?.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		return () => {
			playerRef.current?.dispose();
			playerRef.current = null;
		};
	}, []);

	const play = useCallback<PlayChord>((root, quality, time, durationSeconds) => {
		if (!enabledRef.current) return;
		if (!playerRef.current) {
			playerRef.current = new ChordPlayer(volumeRef.current, () => setReady(true));
		}
		playerRef.current.play(root, quality, time, durationSeconds);
	}, []);

	return { play, ready };
}
