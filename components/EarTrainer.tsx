"use client";

import { Level, TIERS } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";
import { EarMode, EarState } from "@/lib/ear/useEarTrainer";

export function EarTrainer({
	ear,
	mode,
	onModeChange,
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
}: {
	ear: EarState;
	mode: EarMode;
	onModeChange: (mode: EarMode) => void;
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (tonality: Tonality) => void;
}) {
	const keyMode = keyChoice !== "all";

	const optionClass = (i: number) => {
		if (!ear.revealed) return "border-white/15 text-foreground hover:border-accent/60";
		if (i === ear.correctIndex) return "border-accent bg-accent text-black";
		if (i === ear.pickedIndex) return "border-red-500/60 text-muted line-through";
		return "border-white/10 text-muted/60";
	};

	return (
		<div className="flex w-full max-w-xl flex-col items-center gap-6">
			<div className="flex items-center gap-6 text-sm text-muted">
				<span>
					Streak <span className="font-mono text-base text-foreground">{ear.streak}</span>
				</span>
				<span className="uppercase tracking-[0.2em]">
					{mode === "function" && keyMode ? "name the function" : "name the chord"}
				</span>
			</div>

			<button
				type="button"
				onClick={ear.play}
				className="rounded-full bg-accent px-8 py-3 text-base font-semibold text-black transition hover:brightness-110"
			>
				▶ {ear.revealed ? "Replay" : "Play chord"}
			</button>
			{!ear.ready && <span className="text-xs text-muted">loading piano sounds…</span>}

			<div className="grid w-full grid-cols-2 gap-3">
				{ear.labels.map((label, i) => (
					<button
						key={i}
						type="button"
						onClick={() => ear.guess(i)}
						disabled={ear.revealed}
						className={`rounded-xl border px-3 py-4 text-center font-mono text-lg transition-colors ${optionClass(i)}`}
					>
						{label}
					</button>
				))}
			</div>

			{ear.revealed && (
				<button
					type="button"
					onClick={ear.next}
					className="rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-foreground hover:border-accent"
				>
					Next →
				</button>
			)}

			{/* settings */}
			<div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-surface/50 p-5">
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
					{([1, 2, 3, 4] as Level[]).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => onLevelChange(l)}
							className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
								level === l ? "bg-accent text-black" : "bg-white/5 text-muted hover:bg-white/10"
							}`}
						>
							{TIERS[l].name}
						</button>
					))}
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm text-muted">Key</span>
						<select
							value={keyChoice}
							onChange={(e) => onKeyChange(e.target.value)}
							className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
						>
							<option value="all">All keys (chromatic)</option>
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
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-sm text-muted">Identify by</span>
						<div className="inline-flex rounded-full border border-white/15 p-0.5">
							<ModeButton active={mode === "quality"} onClick={() => onModeChange("quality")}>
								Chord
							</ModeButton>
							<ModeButton
								active={mode === "function" && keyMode}
								disabled={!keyMode}
								onClick={() => onModeChange("function")}
							>
								Function
							</ModeButton>
						</div>
						{!keyMode && (
							<span className="text-xs text-muted/70">Pick a key to identify by function.</span>
						)}
					</label>
				</div>
			</div>
		</div>
	);
}

function ModeButton({
	active,
	disabled = false,
	onClick,
	children,
}: {
	active: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`flex-1 rounded-full px-3 py-1 text-sm transition-colors disabled:opacity-30 ${
				active ? "bg-accent text-black" : "text-muted hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}
