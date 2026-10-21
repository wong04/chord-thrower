"use client";

import { useMemo } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import type { Progression } from "@/lib/theory/progressionEngine";
import { KeyCycle } from "./usePattern";
import { CustomProgression, customToProgression } from "./customProgressions";

export type PatternSettings = {
	progressionId: string;
	setProgressionId: (v: string) => void;
	patternKey: string;
	setPatternKey: (v: string) => void;
	keyCycle: KeyCycle;
	setKeyCycle: (v: KeyCycle) => void;
	progression: Progression;
	customProgressions: CustomProgression[];
	saveCustom: (cp: CustomProgression) => void;
	deleteCustom: (id: string) => void;
};

export function usePatternSettings(): PatternSettings {
	const [progressionId, setProgressionId] = usePersistentState("progressionId", PROGRESSIONS[0].id);
	const [patternKey, setPatternKey] = usePersistentState("patternKey", "C");
	const [keyCycle, setKeyCycle] = usePersistentState<KeyCycle>("keyCycle", "lock");
	const [customProgressions, setCustomProgressions] = usePersistentState<CustomProgression[]>("customProgressions", []);
	const customs = useMemo(() => customProgressions.map(customToProgression), [customProgressions]);
	const progression =
		PROGRESSIONS.find((p) => p.id === progressionId) ?? customs.find((p) => p.id === progressionId) ?? PROGRESSIONS[0];

	const saveCustom = (cp: CustomProgression) => {
		setCustomProgressions((list) =>
			list.some((x) => x.id === cp.id) ? list.map((x) => (x.id === cp.id ? cp : x)) : [...list, cp],
		);
		setProgressionId(cp.id);
		setPatternKey(cp.key);
	};

	const deleteCustom = (id: string) => {
		setCustomProgressions((list) => list.filter((x) => x.id !== id));
		if (progressionId === id) setProgressionId(PROGRESSIONS[0].id);
	};

	return {
		progressionId,
		setProgressionId,
		patternKey,
		setPatternKey,
		keyCycle,
		setKeyCycle,
		progression,
		customProgressions,
		saveCustom,
		deleteCustom,
	};
}
