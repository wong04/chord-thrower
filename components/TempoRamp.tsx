"use client";

const RAMP_STEPS = [2, 4, 6];

/** Shared "ramp the tempo by N bpm" control, used by both Drill and Patterns. */
export function TempoRamp({
	label,
	tempoRamp,
	onTempoRampChange,
	rampStep,
	onRampStepChange,
}: {
	label: string;
	tempoRamp: boolean;
	onTempoRampChange: (enabled: boolean) => void;
	rampStep: number;
	onRampStepChange: (step: number) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<label className="flex items-center gap-2 text-sm text-muted">
				<input
					type="checkbox"
					checked={tempoRamp}
					onChange={(e) => onTempoRampChange(e.target.checked)}
					className="h-4 w-4 accent-accent"
				/>
				{label}
			</label>
			<div className="inline-flex items-center gap-2">
				<span className="text-sm text-muted">+</span>
				<select
					value={rampStep}
					onChange={(e) => onRampStepChange(Number(e.target.value))}
					disabled={!tempoRamp}
					className="rounded-lg border border-white/15 bg-background px-2 py-1 text-sm disabled:opacity-40"
				>
					{RAMP_STEPS.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
				<span className="text-sm text-muted">bpm</span>
			</div>
		</div>
	);
}
