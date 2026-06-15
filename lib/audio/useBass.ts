"use client";

import { useCallback, useEffect, useRef } from "react";
import { Bass } from "./bass";

export type PlayBass = (note: string, time: number, durationSeconds: number) => void;

/** Owns a Bass voice; `play` no-ops while `enabled` is false. */
export function useBass(enabled: boolean, volume: number): PlayBass {
	const ref = useRef<Bass | null>(null);
	const enabledRef = useRef(enabled);
	useEffect(() => {
		enabledRef.current = enabled;
	});

	useEffect(() => {
		if (enabled && !ref.current) ref.current = new Bass(volume);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled]);

	useEffect(() => {
		ref.current?.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		return () => {
			ref.current?.dispose();
			ref.current = null;
		};
	}, []);

	return useCallback<PlayBass>((note, time, durationSeconds) => {
		if (!enabledRef.current) return;
		if (!ref.current) ref.current = new Bass();
		ref.current.play(note, time, durationSeconds);
	}, []);
}
