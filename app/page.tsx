"use client";

import { useState } from "react";
import { useMetronome } from "@/lib/audio/useMetronome";
import { useDrill } from "@/lib/drill/useDrill";
import { Level } from "@/lib/theory/chordPool";
import { Instrument } from "@/lib/theory/transpose";
import { TransportControls } from "@/components/TransportControls";
import { ChordDisplay } from "@/components/ChordDisplay";
import { DrillControls, NextPreview } from "@/components/DrillControls";

type Mode = "drill" | "patterns";

export default function Home() {
	const [mode, setMode] = useState<Mode>("drill");

	// Shared / transport settings
	const [bpm, setBpm] = useState(100);
	const [beatsPerBar, setBeatsPerBar] = useState(4);
	const [muted, setMuted] = useState(false);
	const [instrument, setInstrument] = useState<Instrument>("C");

	// Drill settings
	const [level, setLevel] = useState<Level>(1);
	const [keyChoice, setKeyChoice] = useState<string | "all">("all");
	const [barsPerChord, setBarsPerChord] = useState(2);
	const [nextPreview, setNextPreview] = useState<NextPreview>("auto");

	const drill = useDrill({ level, keyChoice, instrument, barsPerChord });

	const metronome = useMetronome({
		bpm,
		beatsPerBar,
		countInBars: 0,
		muted,
		onTick: mode === "drill" ? drill.onTick : undefined,
	});

	const handleToggle = () => {
		if (metronome.running) {
			metronome.stop();
			return;
		}
		if (mode === "drill") drill.reset();
		void metronome.start();
	};

	const showNext = nextPreview === "show" || (nextPreview === "auto" && level <= 2);

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

			{mode === "drill" ? (
				<>
					<ChordDisplay
						symbol={drill.current?.symbol ?? null}
						nextSymbol={drill.next?.symbol}
						showNext={showNext}
					/>
					<TransportControls
						running={metronome.running}
						onToggle={handleToggle}
						bpm={bpm}
						onBpmChange={setBpm}
						beatsPerBar={beatsPerBar}
						onBeatsPerBarChange={setBeatsPerBar}
						muted={muted}
						onMutedChange={setMuted}
						beat={metronome.beat}
						counting={metronome.counting}
					/>
					<DrillControls
						level={level}
						onLevelChange={setLevel}
						keyChoice={keyChoice}
						onKeyChange={setKeyChoice}
						barsPerChord={barsPerChord}
						onBarsChange={setBarsPerChord}
						instrument={instrument}
						onInstrumentChange={setInstrument}
						nextPreview={nextPreview}
						onNextPreviewChange={setNextPreview}
					/>
				</>
			) : (
				<section className="flex min-h-44 flex-col items-center justify-center">
					<div className="text-5xl font-bold tracking-tight">ii–V–I</div>
					<p className="mt-4 text-sm text-foreground/50">Jazz pattern practice — coming next.</p>
				</section>
			)}
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
