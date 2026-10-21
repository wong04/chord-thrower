import type { Progression } from "@/lib/theory/progressionEngine";
import { parseProgressionText } from "@/lib/theory/parseProgression";
import { KEYS } from "@/lib/theory/transpose";

export const CUSTOM_ID_PREFIX = "custom:";

/** A user-entered progression, stored as its source text so it stays editable. */
export type CustomProgression = {
	id: string;
	name: string;
	/** Concert key the chord symbols were written in. */
	key: string;
	text: string;
};

export class ShareLinkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ShareLinkError";
	}
}

export function newCustomId(): string {
	return CUSTOM_ID_PREFIX + crypto.randomUUID();
}

/** Wrap a custom progression as a Progression so it feeds the existing pattern engine. */
export function customToProgression(cp: CustomProgression): Progression {
	return {
		id: cp.id,
		name: cp.name,
		// Custom progressions are grouped on their own in the UI; level is unused.
		level: 1,
		devices: ["custom"],
		description: cp.text,
		defaultTonic: cp.key,
		chords: parseProgressionText(cp.text, cp.key),
	};
}

const toBase64Url = (s: string) =>
	btoa(String.fromCharCode(...new TextEncoder().encode(s)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

const fromBase64Url = (s: string) =>
	new TextDecoder().decode(
		Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (ch) => ch.charCodeAt(0)),
	);

export function encodeShare(cp: CustomProgression): string {
	return toBase64Url(JSON.stringify({ n: cp.name, k: cp.key, t: cp.text }));
}

/** Decode a share-link payload into a new custom progression (fresh id). Throws on anything invalid. */
export function decodeShare(payload: string): CustomProgression {
	let data: unknown;
	try {
		data = JSON.parse(fromBase64Url(payload));
	} catch {
		throw new ShareLinkError("share link is malformed");
	}
	const { n, k, t } = (data ?? {}) as Record<string, unknown>;
	if (typeof n !== "string" || typeof k !== "string" || typeof t !== "string" || !KEYS.includes(k)) {
		throw new ShareLinkError("share link is missing a name, key or chords");
	}
	const cp = { id: newCustomId(), name: n, key: k, text: t };
	customToProgression(cp);
	return cp;
}
