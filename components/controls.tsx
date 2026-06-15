"use client";

/** Shared form controls used across the transport bar and the ensemble mixer. */

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</div>
	);
}

export function Segmented<T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	disabled = false,
}: {
	value: T;
	onChange: (value: T) => void;
	options: [T, string][];
	ariaLabel?: string;
	disabled?: boolean;
}) {
	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className="inline-flex rounded-full border border-white/15 p-0.5"
		>
			{options.map(([val, label]) => {
				const selected = value === val;
				// When disabled, the selected option stays legible but goes neutral grey
				// rather than accent — so an "off" channel never shows a dimmed red chip.
				const cls = disabled
					? selected
						? "bg-white/10 text-foreground/60"
						: "text-muted/50"
					: selected
						? "bg-accent text-black"
						: "text-muted hover:text-foreground";
				return (
					<button
						key={val}
						type="button"
						onClick={() => onChange(val)}
						disabled={disabled}
						aria-pressed={selected}
						className={`min-h-[36px] rounded-full px-3 py-1.5 text-sm transition-colors ${cls}`}
					>
						{label}
					</button>
				);
			})}
		</div>
	);
}

export function IconToggle({
	on,
	onClick,
	label,
	title,
}: {
	on: boolean;
	onClick: () => void;
	label: string;
	title: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={on}
			title={title}
			className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
				on
					? "border-accent bg-accent text-black"
					: "border-white/15 text-muted hover:text-foreground"
			}`}
		>
			{label}
		</button>
	);
}

export function VolumeSlider({
	label,
	value,
	onChange,
	disabled = false,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}) {
	return (
		<div className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
			<span className="w-16 shrink-0 text-sm text-muted">{label}</span>
			<input
				type="range"
				min={0}
				max={1}
				step={0.01}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(Number(e.target.value))}
				aria-label={`${label} volume`}
				className="fader flex-1 accent-accent"
			/>
			<span className="w-9 text-right font-mono text-sm tabular-nums text-foreground/80">
				{Math.round(value * 100)}
			</span>
		</div>
	);
}

/** Small LED dot that glows coral when the channel is active. */
export function Led({ on }: { on: boolean }) {
	return (
		<span
			aria-hidden
			className={`h-2 w-2 shrink-0 rounded-full transition-all ${
				on ? "bg-accent shadow-[0_0_10px_var(--accent)]" : "bg-white/15"
			}`}
		/>
	);
}
