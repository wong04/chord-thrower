"use client";

import { useEffect, useRef } from "react";
import abcjs from "abcjs";
import { Note } from "tonal";

/** Semitone shift from one key to another, picked in the nearest direction (-5..+6). */
function transposeSemitones(fromKey: string, toKey: string): number {
	const from = Note.chroma(fromKey);
	const to = Note.chroma(toKey);
	if (from == null || to == null) return 0;
	const up = (to - from + 12) % 12;
	return up > 6 ? up - 12 : up;
}

/** Engraved melody (abcjs), transposed to the chosen key. Display only. */
export function AbcScore({ abc, homeKey, toKey }: { abc: string; homeKey: string; toKey: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		abcjs.renderAbc(ref.current, abc, {
			visualTranspose: transposeSemitones(homeKey, toKey),
			responsive: "resize",
			paddingtop: 0,
			paddingbottom: 0,
		});
	}, [abc, homeKey, toKey]);

	return <div ref={ref} className="abc-score w-full max-w-xl overflow-x-auto" aria-hidden />;
}
