"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

// The theme lives on <html data-theme> (set before first paint), so read it from there.
function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	return () => observer.disconnect();
}
const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const getServerTheme = () => "light" as Theme;

export function ThemeToggle() {
	const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
	const next: Theme = theme === "dark" ? "light" : "dark";

	const toggle = () => {
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
		} catch {
			// storage unavailable (private mode) — the switch still works for this visit
		}
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={`Switch to ${next} mode`}
			title={`Switch to ${next} mode`}
			className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
		>
			{theme === "dark" ? (
				<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
					<circle cx="12" cy="12" r="4.5" />
					<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
				</svg>
			) : (
				<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
					<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
				</svg>
			)}
		</button>
	);
}
