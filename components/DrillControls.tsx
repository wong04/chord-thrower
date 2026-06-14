"use client";

import { useEffect, useRef, useState } from "react";
import { Level, TIERS } from "@/lib/theory/chordPool";
import { KEY_LEVEL_BLURB, Tonality } from "@/lib/theory/keyHarmony";
import { INSTRUMENTS, Instrument, KEYS } from "@/lib/theory/transpose";

export type NextPreview = "auto" | "show" | "hide";

const BARS_OPTIONS = [1, 2, 4];

export function DrillControls({
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
	barsPerChord,
	onBarsChange,
	instrument,
	onInstrumentChange,
	nextPreview,
	onNextPreviewChange,
}: {
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (tonality: Tonality) => void;
	barsPerChord: number;
	onBarsChange: (bars: number) => void;
	instrument: Instrument;
	onInstrumentChange: (instrument: Instrument) => void;
	nextPreview: NextPreview;
	onNextPreviewChange: (value: NextPreview) => void;
}) {
	const keyMode = keyChoice !== "all";

	return (
		<div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-white/10 bg-surface/50 p-5">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted">Difficulty</span>
					<LevelInfo keyMode={keyMode} />
				</div>
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
					{([1, 2, 3, 4] as Level[]).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => onLevelChange(l)}
							className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
								level === l ? "bg-accent text-black" : "bg-white/5 text-muted hover:bg-white/10"
							}`}
							title={keyMode ? KEY_LEVEL_BLURB[l] : TIERS[l].description}
						>
							{TIERS[l].name}
						</button>
					))}
				</div>
				<span className="text-xs text-muted/70">
					{keyMode ? KEY_LEVEL_BLURB[level] : TIERS[level].description}
				</span>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<span className="text-sm text-muted">Key</span>
					<select
						value={keyChoice}
						onChange={(e) => onKeyChange(e.target.value)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="all">All keys (random)</option>
						{KEYS.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
					{keyMode && (
						<div className="inline-flex rounded-full border border-white/15 p-0.5">
							{(["major", "minor"] as Tonality[]).map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => onTonalityChange(t)}
									className={`flex-1 rounded-full px-3 py-1 text-xs capitalize transition-colors ${
										tonality === t ? "bg-accent text-black" : "text-muted hover:text-foreground"
									}`}
								>
									{t}
								</button>
							))}
						</div>
					)}
				</div>

				<Field label="Bars per chord">
					<div className="inline-flex rounded-full border border-white/15 p-0.5">
						{BARS_OPTIONS.map((b) => (
							<button
								key={b}
								type="button"
								onClick={() => onBarsChange(b)}
								className={`flex-1 rounded-full px-3 py-1 text-sm transition-colors ${
									barsPerChord === b
										? "bg-accent text-black"
										: "text-muted hover:text-foreground"
								}`}
							>
								{b}
							</button>
						))}
					</div>
				</Field>

				<Field label="Read as">
					<select
						value={instrument}
						onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						{INSTRUMENTS.map((inst) => (
							<option key={inst.id} value={inst.id}>
								{inst.label}
							</option>
						))}
					</select>
				</Field>

				<Field label="Show Next Chord">
					<select
						value={nextPreview}
						onChange={(e) => onNextPreviewChange(e.target.value as NextPreview)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="auto">Auto (by difficulty)</option>
						<option value="show">Always show</option>
						<option value="hide">Always hide</option>
					</select>
				</Field>
			</div>
		</div>
	);
}

function LevelInfo({ keyMode }: { keyMode: boolean }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div ref={ref} className="relative inline-block">
			<button
				type="button"
				aria-expanded={open}
				aria-label="What each difficulty level includes"
				onClick={() => setOpen((o) => !o)}
				className="grid h-4 w-4 place-items-center rounded-full border border-white/30 text-[10px] leading-none text-muted transition-colors hover:border-accent hover:text-foreground"
			>
				?
			</button>
			{open && (
				<div className="absolute left-0 top-6 z-20 w-64 rounded-xl border border-white/15 bg-surface p-3 text-xs shadow-xl">
					<p className="mb-2 font-medium text-foreground">
						{keyMode ? "Chords drawn from the selected key" : "Random chord qualities"}
					</p>
					<ul className="flex flex-col gap-1.5">
						{([1, 2, 3, 4] as Level[]).map((l) => (
							<li key={l} className="flex gap-2">
								<span className="font-mono text-accent">L{l}</span>
								<span className="text-muted">
									{keyMode ? KEY_LEVEL_BLURB[l] : `${TIERS[l].name} — ${TIERS[l].description}`}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</label>
	);
}
