"use client";

import { useRef, useState } from "react";
import { KEYS } from "@/lib/theory/transpose";
import { MetronomeIndicator } from "./MetronomeIndicator";

export const TIME_SIGNATURES: { label: string; beatsPerBar: number }[] = [
	{ label: "4/4", beatsPerBar: 4 },
	{ label: "3/4", beatsPerBar: 3 },
	{ label: "2/4", beatsPerBar: 2 },
	{ label: "6/8", beatsPerBar: 6 },
];

export const MIN_BPM = 1;
export const MAX_BPM = 300;

const clampBpm = (bpm: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));

export type TransportProps = {
	running: boolean;
	onToggle: () => void;
	bpm: number;
	onBpmChange: (bpm: number) => void;
	beatsPerBar: number;
	beat: number;
	counting: boolean;
	/** True while any instrument's samples are still loading. */
	chordsLoading?: boolean;
	/** Quick key picker for chart modes; omitted in drill. */
	keySelect?: { value: string; onChange: (key: string) => void };
	onOpenPractice: () => void;
	onOpenSound: () => void;
};

/** The always-visible bottom bar: start/stop, tempo, beat dots, key, and drawer shortcuts. */
export function TransportControls(props: TransportProps) {
	const { running, onToggle, bpm, onBpmChange, beatsPerBar, beat, counting, keySelect } = props;

	const tapsRef = useRef<number[]>([]);
	const onTap = () => {
		const now = performance.now();
		const taps = tapsRef.current;
		// Reset if the last tap was a long time ago (new tempo).
		if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
		taps.push(now);
		if (taps.length > 4) taps.shift();
		if (taps.length >= 2) {
			const intervals = taps.slice(1).map((t, i) => t - taps[i]);
			const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			onBpmChange(clampBpm(Math.round(60000 / avg)));
		}
	};

	const isLoading = !running && !!props.chordsLoading;

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
			<button
				type="button"
				onClick={onToggle}
				disabled={isLoading}
				aria-label={running ? "Stop" : "Start"}
				className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg transition-colors ${
					running
						? "bg-foreground text-background"
						: isLoading
							? "cursor-not-allowed bg-accent/40 text-on-accent/60"
							: "bg-accent text-on-accent hover:brightness-110"
				}`}
			>
				{running ? "■" : "▶"}
			</button>

			<div className="flex items-center gap-1">
				<StepButton label="Slower" onClick={() => onBpmChange(clampBpm(bpm - 1))}>
					−
				</StepButton>
				<div className="flex items-baseline gap-1">
					<BpmInput
						bpm={bpm}
						onBpmChange={onBpmChange}
						className="w-[3.2ch] bg-transparent text-center font-mono text-2xl tabular-nums caret-accent outline-none focus:text-accent"
					/>
					<span className="text-[10px] uppercase tracking-widest text-muted">bpm</span>
				</div>
				<StepButton label="Faster" onClick={() => onBpmChange(clampBpm(bpm + 1))}>
					+
				</StepButton>
				<button
					type="button"
					onClick={onTap}
					className="ml-1 rounded-full border border-rule px-3 py-1 text-xs text-muted transition-colors hover:text-foreground"
				>
					Tap
				</button>
			</div>

			<MetronomeIndicator beatsPerBar={beatsPerBar} beat={beat} counting={counting} />

			{isLoading && <span className="text-xs text-muted">loading sounds…</span>}

			<div className="ml-auto flex items-center gap-2">
				{keySelect && (
					<label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted">
						Key
						<select
							value={keySelect.value}
							onChange={(e) => keySelect.onChange(e.target.value)}
							className="rounded-lg border border-rule bg-background px-2 py-1 font-display text-base normal-case tracking-normal text-foreground"
						>
							{KEYS.map((k) => (
								<option key={k} value={k}>
									{k}
								</option>
							))}
						</select>
					</label>
				)}
				<BarButton onClick={props.onOpenPractice}>Settings</BarButton>
				<BarButton onClick={props.onOpenSound}>Mix</BarButton>
			</div>
		</div>
	);
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="grid h-8 w-8 place-items-center rounded-full text-lg text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
		>
			{children}
		</button>
	);
}

function BarButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="min-h-[36px] rounded-full border border-rule px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
		>
			{children}
		</button>
	);
}

function BpmInput({
	bpm,
	onBpmChange,
	className,
}: {
	bpm: number;
	onBpmChange: (bpm: number) => void;
	className?: string;
}) {
	// While focused, hold a free-text draft so partial entries (e.g. "1" before "120")
	// aren't clamped mid-typing; commit + clamp on blur/Enter.
	const [draft, setDraft] = useState<string | null>(null);

	const commit = () => {
		const n = parseInt(draft ?? "", 10);
		if (!Number.isNaN(n)) onBpmChange(clampBpm(n));
		setDraft(null);
	};

	return (
		<input
			type="text"
			inputMode="numeric"
			value={draft ?? String(bpm)}
			onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
			onFocus={(e) => {
				setDraft(String(bpm));
				e.target.select();
			}}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					commit();
					e.currentTarget.blur();
				} else if (e.key === "Escape") {
					setDraft(null);
					e.currentTarget.blur();
				}
			}}
			aria-label="Tempo in BPM"
			className={className}
		/>
	);
}
