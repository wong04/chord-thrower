"use client";

import { useState } from "react";
import { useMetronome } from "@/lib/audio/useMetronome";
import { TransportControls } from "@/components/TransportControls";

type Mode = "drill" | "patterns";

export default function Home() {
	const [mode, setMode] = useState<Mode>("drill");
	const [bpm, setBpm] = useState(100);
	const [beatsPerBar, setBeatsPerBar] = useState(4);
	const [muted, setMuted] = useState(false);

	const metronome = useMetronome({ bpm, beatsPerBar, countInBars: 0, muted });

	return (
		<main className="flex flex-1 flex-col items-center gap-8 px-4 py-8">
			<header className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Improv Practice Tool</h1>
				<p className="mt-1 text-sm text-foreground/60">Drill chords and jazz patterns in time.</p>
			</header>

			<nav className="inline-flex rounded-full border border-foreground/15 p-1">
				<TabButton active={mode === "drill"} onClick={() => setMode("drill")}>
					Drill
				</TabButton>
				<TabButton active={mode === "patterns"} onClick={() => setMode("patterns")}>
					Patterns
				</TabButton>
			</nav>

			<section className="flex min-h-40 flex-col items-center justify-center">
				<div className="text-7xl font-bold tracking-tight tabular-nums">
					{mode === "drill" ? "Cmaj7" : "ii–V–I"}
				</div>
				<p className="mt-4 text-sm text-foreground/50">
					{mode === "drill" ? "Random chord drill" : "Jazz pattern practice"} — coming together.
				</p>
			</section>

			<TransportControls
				running={metronome.running}
				onToggle={metronome.toggle}
				bpm={bpm}
				onBpmChange={setBpm}
				beatsPerBar={beatsPerBar}
				onBeatsPerBarChange={setBeatsPerBar}
				muted={muted}
				onMutedChange={setMuted}
				beat={metronome.beat}
				counting={metronome.counting}
			/>
		</main>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
				active ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}
