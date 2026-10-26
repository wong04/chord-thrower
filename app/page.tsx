"use client";

import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { useMetronome } from "@/lib/audio/useMetronome";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { useBass } from "@/lib/audio/useBass";
import { useRide } from "@/lib/audio/useRide";
import { useWakeLock } from "@/lib/audio/useWakeLock";
import { useRimClick } from "@/lib/audio/useRimClick";
import { bassNote, BassMode } from "@/lib/audio/bass";
import { Subdivision } from "@/lib/audio/metronome";
import { Voicing } from "@/lib/audio/chordPlayer";
import { useDrill } from "@/lib/drill/useDrill";
import { useDrillSettings } from "@/lib/drill/useDrillSettings";
import { usePattern } from "@/lib/pattern/usePattern";
import { usePatternSettings } from "@/lib/pattern/usePatternSettings";
import { useStandardsSettings } from "@/lib/standards/useStandardsSettings";
import { Instrument } from "@/lib/theory/transpose";
import { scaleForChord, chordTones } from "@/lib/theory/scales";
import { MAX_BPM, MIN_BPM, TransportControls } from "@/components/TransportControls";
import { MixerProps } from "@/components/Mixer";
import { DrawerTab, SettingsDrawer } from "@/components/SettingsDrawer";
import { GeneralSettings } from "@/components/GeneralSettings";
import { TempoRamp } from "@/components/TempoRamp";
import { Segmented } from "@/components/controls";
import { ChordDisplay } from "@/components/ChordDisplay";
import { Keyboard } from "@/components/Keyboard";
import { DrillControls } from "@/components/DrillControls";
import { PatternControls } from "@/components/PatternControls";
import { PatternChart } from "@/components/PatternChart";
import { ChartHeader } from "@/components/ChartHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Standards } from "@/components/Standards";
import { EarTrainer } from "@/components/EarTrainer";
import { EarMode } from "@/lib/ear/earItem";
import { decodeShare, ShareLinkError } from "@/lib/pattern/customProgressions";
import { ChordParseError } from "@/lib/theory/parseProgression";

type Mode = "drill" | "patterns" | "ear" | "standards";
type PlayMode = Exclude<Mode, "ear">;

const PLAY_MODES: [PlayMode, string][] = [
	["drill", "Drill"],
	["patterns", "Patterns"],
	["standards", "Standards"],
];

const clampBpm = (bpm: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));

export default function Home() {
	const [mode, setMode] = usePersistentState<Mode>("mode", "drill");
	const [lastPlayMode, setLastPlayMode] = usePersistentState<PlayMode>("lastPlayMode", "drill");
	const [drawer, setDrawer] = useState<DrawerTab | null>(null);
	const selectPlayMode = (m: PlayMode) => {
		setMode(m);
		setLastPlayMode(m);
	};

	// Shared / transport settings
	const [bpm, setBpm] = usePersistentState("bpm", 100);
	const [beatsPerBar, setBeatsPerBar] = usePersistentState("beatsPerBar", 4);
	const [muted, setMuted] = usePersistentState("muted", false);
	const [audioEnabled, setAudioEnabled] = usePersistentState("audioEnabled", false);
	const [countIn, setCountIn] = usePersistentState("countIn", false);
	const [instrument, setInstrument] = usePersistentState<Instrument>("instrument", "C");
	const [clickVolume, setClickVolume] = usePersistentState("clickVolume", 0.8);
	const [chordVolume, setChordVolume] = usePersistentState("chordVolume", 0.8);
	const [subdivision, setSubdivision] = usePersistentState<Subdivision>("subdivision", "none");
	const [backbeat, setBackbeat] = usePersistentState("backbeat", false);
	const [bassMode, setBassMode] = usePersistentState<BassMode>("bassMode", "off");
	const [bassVolume, setBassVolume] = usePersistentState("bassVolume", 0.85);
	const [rideVolume, setRideVolume] = usePersistentState("rideVolume", 0.7);
	const [voicing, setVoicing] = usePersistentState<Voicing>("voicing", "block");

	// Mode-specific settings (each hook manages its own persistence keys)
	const drillSettings = useDrillSettings();
	const patternSettings = usePatternSettings();
	const standardsSettings = useStandardsSettings();

	// Shared tempo ramp (used by both drill and pattern modes)
	const [tempoRamp, setTempoRamp] = usePersistentState("tempoRamp", false);
	const [rampStep, setRampStep] = usePersistentState("rampStep", 2);

	// Ear-training settings
	const [earMode, setEarMode] = usePersistentState<EarMode>("earMode", "quality");

	const { play: playChord, ready: chordsReady, loadError: chordsError } = useChordPlayer(audioEnabled, chordVolume, voicing);
	const { play: playBass, ready: bassReady, loadError: bassError } = useBass(bassMode !== "off", bassVolume);
	const { play: playRide, ready: rideReady, loadError: rideError } = useRide(subdivision !== "none", rideVolume, subdivision);
	const { play: playRimClick } = useRimClick(subdivision === "bossanova", rideVolume);
	const secondsPerBeat = 60 / bpm;

	const onBeat = (
		concertRoot: string,
		quality: Parameters<typeof bassNote>[0]["quality"],
		nextConcertRoot: string | undefined,
		beat: number,
		time: number,
		concertBass?: string,
	) => {
		const note = bassNote({
			mode: bassMode,
			root: concertRoot,
			quality,
			bass: concertBass,
			beat,
			beatsPerBar,
			nextRoot: nextConcertRoot,
		});
		if (note) playBass(note, time, secondsPerBeat);
	};

	const { level, setLevel, keyChoice, setKeyChoice, tonality, setTonality,
		showRoman, setShowRoman, showKeyboard, setShowKeyboard,
		barsPerChord, setBarsPerChord, nextPreview, setNextPreview } = drillSettings;
	const { progression, progressionId, setProgressionId, patternKey, setPatternKey,
		keyCycle, setKeyCycle, customProgressions, saveCustom, deleteCustom } = patternSettings;
	const { standard, standardProg, standardKey, setStandardKey, standardId, selectStandard } = standardsSettings;

	// Import a progression from a share link (?prog=...) once on load.
	const [shareError, setShareError] = useState<string | null>(null);
	const shareHandled = useRef(false);
	useEffect(() => {
		if (shareHandled.current) return;
		shareHandled.current = true;
		const url = new URL(window.location.href);
		const payload = url.searchParams.get("prog");
		if (!payload) return;
		url.searchParams.delete("prog");
		history.replaceState(null, "", url);
		try {
			saveCustom(decodeShare(payload));
			setMode("patterns");
			setLastPlayMode("patterns");
		} catch (e) {
			if (!(e instanceof ShareLinkError || e instanceof ChordParseError)) throw e;
			// The URL is only readable after mount (kept out of render to avoid SSR mismatch).
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setShareError(e.message);
		}
	}, [saveCustom, setMode, setLastPlayMode]);

	const drill = useDrill({
		level,
		keyChoice,
		tonality,
		instrument,
		barsPerChord,
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, barsPerChord * beatsPerBar * secondsPerBeat),
		onBeat,
		onAdvance: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
	});
	const pattern = usePattern({
		progression,
		instrument,
		keyCycle,
		tonic: patternKey,
		onRep: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, chord.beats * secondsPerBeat, chord.concertBass),
		onBeat,
	});
	const standards = usePattern({
		progression: standardProg,
		instrument,
		keyCycle: "lock",
		tonic: standardKey,
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, chord.beats * secondsPerBeat, chord.concertBass),
		onBeat,
	});

	const activeEngine =
		mode === "drill" ? drill.onTick : mode === "patterns" ? pattern.onTick : mode === "standards" ? standards.onTick : undefined;
	const metronome = useMetronome({
		bpm,
		beatsPerBar,
		countInBars: countIn ? 1 : 0,
		muted,
		clickVolume,
		subdivision,
		backbeat,
		onTick: activeEngine,
		onRide: playRide,
		onRimClick: playRimClick,
	});

	const running = metronome.running;
	useWakeLock(running);

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
		else if (mode === "standards") standards.reset();
		else pattern.reset();
		void metronome.start();
	};

	// Keyboard shortcuts: Space = start/stop, ↑/↓ = tempo, F = fullscreen, Esc = exit fullscreen.
	const mainRef = useRef<HTMLDivElement>(null);
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
			} else if (e.key === "Escape") {
				// The mixer sheet handles its own Esc (capture phase) and stops propagation,
				// so reaching here means no sheet is open — exit fullscreen if active.
				if (document.fullscreenElement) void document.exitFullscreen();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setBpm]);

	const countdown = metronome.counting ? beatsPerBar - metronome.beat : null;

	const chordsLoading =
		(audioEnabled && !chordsReady) ||
		(bassMode !== "off" && !bassReady) ||
		(subdivision !== "none" && !rideReady);

	const audioLoadError =
		(audioEnabled && chordsError) ||
		(bassMode !== "off" && bassError) ||
		(subdivision !== "none" && rideError);

	const mixerProps: MixerProps = {
		muted,
		onMutedChange: setMuted,
		clickVolume,
		onClickVolumeChange: setClickVolume,
		beatsPerBar,
		backbeat,
		onBackbeatChange: setBackbeat,
		audioEnabled,
		onAudioEnabledChange: setAudioEnabled,
		chordVolume,
		onChordVolumeChange: setChordVolume,
		voicing,
		onVoicingChange: setVoicing,
		bassMode,
		onBassModeChange: setBassMode,
		bassVolume,
		onBassVolumeChange: setBassVolume,
		subdivision,
		onSubdivisionChange: setSubdivision,
		rideVolume,
		onRideVolumeChange: setRideVolume,
	};

	// Hero content per mode. Patterns + Standards share the chart-playing engine.
	const chartEngine = mode === "standards" ? standards : pattern;
	const chartActive = chartEngine.chords[chartEngine.activeIndex];
	const chartNext = chartEngine.chords[(chartEngine.activeIndex + 1) % (chartEngine.chords.length || 1)];
	const drillShowNext = nextPreview === "show" || (nextPreview === "auto" && level <= 2);

	// Chart modes: the full chart is the stage (iReal-style), with a compact now/next strip.
	const hero =
		mode === "drill" ? (
			<ChordDisplay
				symbol={drill.current?.symbol ?? null}
				nextSymbol={drill.next?.symbol}
				showNext={drillShowNext}
				countdown={countdown}
				focused={running}
				roman={drill.current?.roman}
				showRoman={showRoman && keyChoice !== "all"}
			/>
		) : (
			<>
				<ChartHeader
					symbol={chartActive?.symbol ?? null}
					nextSymbol={chartNext?.symbol}
					countdown={countdown}
					title={mode === "standards" ? standard.title : progression.name}
					tonic={chartEngine.tonic}
					bar={chartEngine.activeBar}
					barCount={chartEngine.bars.length}
				/>
				<PatternChart
					bars={chartEngine.bars}
					activeIndex={chartEngine.activeIndex}
					activeBar={chartEngine.activeBar}
					sections={mode === "standards" ? standard.sections : undefined}
				/>
			</>
		);

	const practiceSettings =
		mode === "drill" ? (
			<>
				<DrillControls
					level={level}
					onLevelChange={setLevel}
					keyChoice={keyChoice}
					onKeyChange={setKeyChoice}
					tonality={tonality}
					onTonalityChange={setTonality}
					showRoman={showRoman}
					onShowRomanChange={setShowRoman}
					showKeyboard={showKeyboard}
					onShowKeyboardChange={setShowKeyboard}
					barsPerChord={barsPerChord}
					onBarsChange={setBarsPerChord}
					nextPreview={nextPreview}
					onNextPreviewChange={setNextPreview}
				/>
				<TempoRamp
					label="Ramp tempo each chord"
					tempoRamp={tempoRamp}
					onTempoRampChange={setTempoRamp}
					rampStep={rampStep}
					onRampStepChange={setRampStep}
				/>
			</>
		) : mode === "patterns" ? (
			<>
				<PatternControls
					progressionId={progressionId}
					onProgressionChange={setProgressionId}
					keyCycle={keyCycle}
					onKeyCycleChange={setKeyCycle}
					customProgressions={customProgressions}
					onSaveCustom={saveCustom}
					onDeleteCustom={deleteCustom}
				/>
				<TempoRamp
					label="Ramp tempo each rep"
					tempoRamp={tempoRamp}
					onTempoRampChange={setTempoRamp}
					rampStep={rampStep}
					onRampStepChange={setRampStep}
				/>
			</>
		) : (
			<Standards standard={standard} selectedId={standardId} onSelect={selectStandard} />
		);

	const keySelect =
		mode === "patterns"
			? { value: patternKey, onChange: setPatternKey }
			: mode === "standards"
				? { value: standardKey, onChange: setStandardKey }
				: undefined;

	return (
		<div ref={mainRef} className="flex min-h-dvh flex-col bg-background">
			{!running && (
				<header className="zone mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-5">
					<h1 className="font-display text-2xl">Chord Thrower</h1>
					{mode !== "ear" && (
						<div className="order-last flex w-full justify-center sm:order-none sm:w-auto">
							<Segmented value={mode} onChange={selectPlayMode} options={PLAY_MODES} ariaLabel="Practice mode" />
						</div>
					)}
					<div className="flex items-center gap-2">
						{mode === "ear" ? (
							<button
								type="button"
								onClick={() => setMode(lastPlayMode)}
								className="text-sm text-muted transition-colors hover:text-foreground"
							>
								← Back to playing
							</button>
						) : (
							<button
								type="button"
								onClick={() => setMode("ear")}
								className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
							>
								Ear training
							</button>
						)}
						<ThemeToggle />
					</div>
				</header>
			)}

			<main
				className={`mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-8 ${
					mode === "drill" ? "justify-center gap-8" : "justify-start gap-6"
				}`}
			>
				{shareError && (
					<p className="text-xs text-warn">⚠ Couldn&apos;t import shared progression: {shareError}</p>
				)}

				{mode === "ear" ? (
					<EarTrainer
						active={mode === "ear"}
						mode={earMode}
						onModeChange={setEarMode}
						level={level}
						onLevelChange={setLevel}
						keyChoice={keyChoice}
						onKeyChange={setKeyChoice}
						tonality={tonality}
						onTonalityChange={setTonality}
					/>
				) : (
					<>
						{hero}

						{mode === "drill" && showKeyboard && drill.current && !metronome.counting && (
							<div className="flex w-full max-w-xl flex-col items-center gap-2">
								<Keyboard
									chordTones={chordTones(drill.current.root, drill.current.quality)}
									scaleNotes={scaleForChord(drill.current.root, drill.current.quality).notes}
								/>
								<div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
									{scaleForChord(drill.current.root, drill.current.quality).name}
								</div>
							</div>
						)}

						{audioLoadError && (
							<p className="text-xs text-warn">
								⚠ Some audio samples failed to load — check your connection and refresh.
							</p>
						)}
					</>
				)}
			</main>

			{mode !== "ear" && (
				<footer className="sticky bottom-0 z-30 border-t border-rule bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
					<TransportControls
						running={running}
						onToggle={handleToggle}
						bpm={bpm}
						onBpmChange={setBpm}
						beatsPerBar={beatsPerBar}
						beat={metronome.beat}
						counting={metronome.counting}
						chordsLoading={chordsLoading}
						keySelect={keySelect}
						onOpenPractice={() => setDrawer("practice")}
						onOpenSound={() => setDrawer("sound")}
					/>
				</footer>
			)}

			<SettingsDrawer
				tab={drawer}
				onTabChange={setDrawer}
				onClose={() => setDrawer(null)}
				mixer={mixerProps}
				practice={
					<div className="flex flex-col gap-6">
						{practiceSettings}
						<hr className="border-rule" />
						<GeneralSettings
							instrument={instrument}
							onInstrumentChange={setInstrument}
							beatsPerBar={beatsPerBar}
							onBeatsPerBarChange={setBeatsPerBar}
							countIn={countIn}
							onCountInChange={setCountIn}
						/>
					</div>
				}
			/>
		</div>
	);
}
