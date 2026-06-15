"use client";

import { useEffect } from "react";

type WakeLockSentinelLike = { release: () => Promise<void> };

/**
 * Keep the screen awake while `active` (e.g. during practice on a music stand).
 * Re-acquires the lock when the tab becomes visible again. No-ops where the
 * Wake Lock API is unavailable.
 */
export function useWakeLock(active: boolean): void {
	useEffect(() => {
		if (!active) return;
		const wakeLock = (
			navigator as Navigator & {
				wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
			}
		).wakeLock;
		if (!wakeLock) return;

		let sentinel: WakeLockSentinelLike | null = null;
		let released = false;

		const acquire = async () => {
			try {
				sentinel = await wakeLock.request("screen");
			} catch {
				// user/agent denied or not allowed — ignore
			}
		};

		const onVisibility = () => {
			if (document.visibilityState === "visible" && !released) void acquire();
		};

		void acquire();
		document.addEventListener("visibilitychange", onVisibility);

		return () => {
			released = true;
			document.removeEventListener("visibilitychange", onVisibility);
			void sentinel?.release();
		};
	}, [active]);
}
