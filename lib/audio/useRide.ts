"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Ride } from "./ride";
import { ClosedHiHat } from "./closedHiHat";
import type { Subdivision } from "./metronome";

export type PlayRide = (time: number, velocity?: number) => void;

type RideVoice = { play: (time: number, velocity?: number) => void; setVolume: (v: number) => void; dispose: () => void };

/**
 * Owns a ride voice — either the sampled ride cymbal or a synthesized closed hi-hat
 * depending on subdivision. Swaps the voice automatically when subdivision changes.
 */
export function useRide(
	enabled: boolean,
	volume: number,
	subdivision: Subdivision,
): { play: PlayRide; ready: boolean; loadError: boolean } {
	const ref = useRef<RideVoice | null>(null);
	const [ready, setReady] = useState(false);
	const [loadError, setLoadError] = useState(false);

	const isBossa = subdivision === "bossanova";
	const enabledRef = useRef(enabled);
	useEffect(() => { enabledRef.current = enabled; });
	const volumeRef = useRef(volume);
	useEffect(() => { volumeRef.current = volume; });

	useEffect(() => {
		ref.current?.dispose();
		ref.current = null;
		setReady(false);
		setLoadError(false);
		if (!enabled) return;
		if (isBossa) {
			ref.current = new ClosedHiHat(volumeRef.current);
			setReady(true);
		} else {
			const ride = new Ride(volumeRef.current, () => setReady(true), () => setLoadError(true));
			ref.current = ride;
			if (ride.ready) setReady(true);
		}
	}, [enabled, isBossa]);

	useEffect(() => {
		ref.current?.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		return () => {
			ref.current?.dispose();
			ref.current = null;
		};
	}, []);

	const play = useCallback<PlayRide>((time, velocity) => {
		if (!enabledRef.current) return;
		if (!ref.current) {
			if (isBossa) {
				ref.current = new ClosedHiHat(volumeRef.current);
			} else {
				ref.current = new Ride(volumeRef.current, () => setReady(true), () => setLoadError(true));
			}
		}
		ref.current.play(time, velocity);
	}, [isBossa]);

	return { play, ready, loadError };
}
