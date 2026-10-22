"use client";

import { useEffect } from "react";
import { Mixer, MixerProps } from "./Mixer";
import { Segmented } from "./controls";

export type DrawerTab = "practice" | "sound";

/**
 * Single home for every setting: a right-hand panel on desktop, a bottom sheet on
 * phones. "Practice" holds what you're playing; "Sound" is the band mixer.
 * Closes on backdrop tap, Esc, or the X.
 */
export function SettingsDrawer({
	tab,
	onTabChange,
	onClose,
	practice,
	mixer,
}: {
	/** Open tab, or null when closed. */
	tab: DrawerTab | null;
	onTabChange: (tab: DrawerTab) => void;
	onClose: () => void;
	practice: React.ReactNode;
	mixer: MixerProps;
}) {
	const open = tab !== null;

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};
		// Capture so this runs before the page-level Esc (which exits fullscreen).
		window.addEventListener("keydown", onKey, true);
		return () => window.removeEventListener("keydown", onKey, true);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-40 flex flex-col justify-end sm:flex-row">
			<button
				type="button"
				aria-label="Close settings"
				onClick={onClose}
				className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
			/>
			<aside className="drawer relative flex max-h-[85vh] w-full flex-col rounded-t-3xl border-t border-rule bg-background shadow-2xl sm:ml-auto sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-l sm:border-t-0">
				<header className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3">
					<Segmented
						value={tab}
						onChange={onTabChange}
						options={[
							["practice", "Practice"],
							["sound", "Sound"],
						]}
						ariaLabel="Settings section"
					/>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close settings"
						className="grid h-9 w-9 place-items-center rounded-full border border-rule text-muted transition-colors hover:text-foreground"
					>
						✕
					</button>
				</header>
				<div className="flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
					{tab === "practice" ? practice : <Mixer {...mixer} />}
				</div>
			</aside>
		</div>
	);
}
