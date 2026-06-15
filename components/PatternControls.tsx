"use client";

import { Level, TIERS } from "@/lib/theory/chordPool";
import { INSTRUMENTS, Instrument } from "@/lib/theory/transpose";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import { KeyCycle } from "@/lib/pattern/usePattern";
import { TempoRamp } from "./TempoRamp";

export function PatternControls({
	progressionId,
	onProgressionChange,
	keyCycle,
	onKeyCycleChange,
	instrument,
	onInstrumentChange,
	tempoRamp,
	onTempoRampChange,
	rampStep,
	onRampStepChange,
}: {
	progressionId: string;
	onProgressionChange: (id: string) => void;
	keyCycle: KeyCycle;
	onKeyCycleChange: (cycle: KeyCycle) => void;
	instrument: Instrument;
	onInstrumentChange: (instrument: Instrument) => void;
	tempoRamp: boolean;
	onTempoRampChange: (enabled: boolean) => void;
	rampStep: number;
	onRampStepChange: (step: number) => void;
}) {
	return (
		<div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-white/10 bg-surface/50 p-5">
			<Field label="Pattern">
				<select
					value={progressionId}
					onChange={(e) => onProgressionChange(e.target.value)}
					className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
				>
					{([1, 2, 3, 4] as Level[]).map((level) => (
						<optgroup key={level} label={`Level ${level} — ${TIERS[level].name}`}>
							{PROGRESSIONS.filter((p) => p.level === level).map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</optgroup>
					))}
				</select>
			</Field>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Key cycling">
					<select
						value={keyCycle}
						onChange={(e) => onKeyCycleChange(e.target.value as KeyCycle)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="lock">Stay in one key</option>
						<option value="cycle4">Cycle 4ths each rep</option>
						<option value="random">Random key each rep</option>
					</select>
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
			</div>

			<TempoRamp
				label="Ramp tempo each rep"
				tempoRamp={tempoRamp}
				onTempoRampChange={onTempoRampChange}
				rampStep={rampStep}
				onRampStepChange={onRampStepChange}
			/>
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
