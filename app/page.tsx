"use client";

import { useEffect, useRef } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { useMetronome } from "@/lib/audio/useMetronome";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { useDrill } from "@/lib/drill/useDrill";
import { usePattern, KeyCycle } from "@/lib/pattern/usePattern";
import { Level } from "@/lib/theory/chordPool";
import { Instrument } from "@/lib/theory/transpose";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import { MAX_BPM, MIN_BPM, TransportControls } from "@/components/TransportControls";
import { ChordDisplay } from "@/components/ChordDisplay";
import { DrillControls, NextPreview } from "@/components/DrillControls";
import { PatternControls } from "@/components/PatternControls";
import { PatternChart } from "@/components/PatternChart";

type Mode = "drill" | "patterns";

const clampBpm = (bpm: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));

export default function Home() {
	const [mode, setMode] = usePersistentState<Mode>("mode", "drill");

	// Shared / transport settings
	const [bpm, setBpm] = usePersistentState("bpm", 100);
	const [beatsPerBar, setBeatsPerBar] = usePersistentState("beatsPerBar", 4);
	const [muted, setMuted] = usePersistentState("muted", false);
	const [audioEnabled, setAudioEnabled] = usePersistentState("audioEnabled", false);
	const [countIn, setCountIn] = usePersistentState("countIn", false);
	const [instrument, setInstrument] = usePersistentState<Instrument>("instrument", "C");
	const [clickVolume, setClickVolume] = usePersistentState("clickVolume", 0.8);
	const [chordVolume, setChordVolume] = usePersistentState("chordVolume", 0.8);

	// Drill settings
	const [level, setLevel] = usePersistentState<Level>("level", 1);
	const [keyChoice, setKeyChoice] = usePersistentState<string | "all">("keyChoice", "all");
	const [barsPerChord, setBarsPerChord] = usePersistentState("barsPerChord", 2);
	const [nextPreview, setNextPreview] = usePersistentState<NextPreview>("nextPreview", "auto");

	// Pattern settings
	const [progressionId, setProgressionId] = usePersistentState("progressionId", PROGRESSIONS[0].id);
	const [keyCycle, setKeyCycle] = usePersistentState<KeyCycle>("keyCycle", "lock");
	const [tempoRamp, setTempoRamp] = usePersistentState("tempoRamp", false);
	const [rampStep, setRampStep] = usePersistentState("rampStep", 2);
	const progression = PROGRESSIONS.find((p) => p.id === progressionId) ?? PROGRESSIONS[0];

	const playChord = useChordPlayer(audioEnabled, chordVolume);
	const secondsPerBeat = 60 / bpm;

	const drill = useDrill({
		level,
		keyChoice,
		instrument,
		barsPerChord,
		onChordChange: (chord, time) =>
			playChord(chord.root, chord.quality, time, barsPerChord * beatsPerBar * secondsPerBeat),
	});
	const pattern = usePattern({
		progression,
		instrument,
		keyCycle,
		onRep: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
		onChordChange: (chord, time) =>
			playChord(chord.root, chord.quality, time, chord.beats * secondsPerBeat),
	});

	const metronome = useMetronome({
		bpm,
		beatsPerBar,
		countInBars: countIn ? 1 : 0,
		muted,
		clickVolume,
		onTick: mode === "drill" ? drill.onTick : pattern.onTick,
	});

	const running = metronome.running;

	// Stop the transport when switching modes so the engines don't overlap.
	const { stop } = metronome;
	useEffect(() => {
		stop();
	}, [mode, stop]);

	const handleToggle = () => {
		if (metronome.running) {
			metronome.stop();
			return;
		}
		if (mode === "drill") drill.reset();
		else pattern.reset();
		void metronome.start();
	};

	// Keyboard shortcuts: Space = start/stop, ↑/↓ = tempo, F = fullscreen.
	const mainRef = useRef<HTMLElement>(null);
	const toggleRef = useRef(handleToggle);
	useEffect(() => {
		toggleRef.current = handleToggle;
	});
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement | null)?.tagName;
			if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
			if (e.code === "Space") {
				e.preventDefault();
				toggleRef.current();
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setBpm((b) => clampBpm(b + (e.shiftKey ? 5 : 1)));
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setBpm((b) => clampBpm(b - (e.shiftKey ? 5 : 1)));
			} else if (e.key === "f" || e.key === "F") {
				if (document.fullscreenElement) void document.exitFullscreen();
				else void mainRef.current?.requestFullscreen?.();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setBpm]);

	const countdown = metronome.counting ? beatsPerBar - metronome.beat : null;

	// Hero content per mode.
	const activeChord = pattern.chords[pattern.activeIndex];
	const drillShowNext = nextPreview === "show" || (nextPreview === "auto" && level <= 2);
	let patternBar = 0;
	pattern.bars.forEach((b, i) => {
		if (pattern.activeIndex >= b.startIndex) patternBar = i;
	});

	const hero =
		mode === "drill" ? (
			<ChordDisplay
				symbol={drill.current?.symbol ?? null}
				nextSymbol={drill.next?.symbol}
				showNext={drillShowNext}
				countdown={countdown}
				focused={running}
			/>
		) : (
			<div className="flex flex-col items-center gap-3">
				<ChordDisplay
					symbol={activeChord?.symbol ?? null}
					nextSymbol={pattern.chords[(pattern.activeIndex + 1) % (pattern.chords.length || 1)]?.symbol}
					showNext
					countdown={countdown}
					focused={running}
				/>
				<div className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
					key of {pattern.tonic} · bar {patternBar + 1}/{pattern.bars.length}
				</div>
			</div>
		);

	return (
		<main ref={mainRef} className="flex flex-1 flex-col items-center gap-8 bg-background px-4 py-8">
			{!running && (
				<header className="text-center">
					<h1 className="font-display text-3xl font-extrabold tracking-tight">Chord Thrower</h1>
					<p className="mt-1 text-sm text-muted">Drill chords and jazz patterns in time.</p>
				</header>
			)}

			{!running && (
				<nav className="inline-flex rounded-full border border-white/10 bg-surface/50 p-1">
					<TabButton active={mode === "drill"} onClick={() => setMode("drill")}>
						Drill
					</TabButton>
					<TabButton active={mode === "patterns"} onClick={() => setMode("patterns")}>
						Patterns
					</TabButton>
				</nav>
			)}

			{hero}

			{mode === "patterns" && !running && (
				<PatternChart bars={pattern.bars} activeIndex={pattern.activeIndex} />
			)}

			<TransportControls
				running={running}
				onToggle={handleToggle}
				bpm={bpm}
				onBpmChange={setBpm}
				beatsPerBar={beatsPerBar}
				onBeatsPerBarChange={setBeatsPerBar}
				muted={muted}
				onMutedChange={setMuted}
				audioEnabled={audioEnabled}
				onAudioEnabledChange={setAudioEnabled}
				countIn={countIn}
				onCountInChange={setCountIn}
				clickVolume={clickVolume}
				onClickVolumeChange={setClickVolume}
				chordVolume={chordVolume}
				onChordVolumeChange={setChordVolume}
				beat={metronome.beat}
				counting={metronome.counting}
				compact={running}
			/>

			{!running &&
				(mode === "drill" ? (
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
				) : (
					<PatternControls
						progressionId={progressionId}
						onProgressionChange={setProgressionId}
						keyCycle={keyCycle}
						onKeyCycleChange={setKeyCycle}
						instrument={instrument}
						onInstrumentChange={setInstrument}
						tempoRamp={tempoRamp}
						onTempoRampChange={setTempoRamp}
						rampStep={rampStep}
						onRampStepChange={setRampStep}
					/>
				))}

			{!running && (
				<p className="text-xs text-muted/70">
					Space start/stop · ↑↓ tempo · F fullscreen
				</p>
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
				active ? "bg-accent text-black" : "text-muted hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}
