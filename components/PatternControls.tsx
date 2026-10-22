"use client";

import { useState } from "react";
import { Level, TIERS } from "@/lib/theory/chordPool";
import { INSTRUMENTS, Instrument, KEYS } from "@/lib/theory/transpose";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import { KeyCycle } from "@/lib/pattern/usePattern";
import { CustomProgression, encodeShare } from "@/lib/pattern/customProgressions";
import { TempoRamp } from "./TempoRamp";
import { CustomProgressionEditor } from "./CustomProgressionEditor";

type EditorState = { open: false } | { open: true; initial?: CustomProgression };

export function PatternControls({
	progressionId,
	onProgressionChange,
	patternKey,
	onPatternKeyChange,
	keyCycle,
	onKeyCycleChange,
	instrument,
	onInstrumentChange,
	tempoRamp,
	onTempoRampChange,
	rampStep,
	onRampStepChange,
	customProgressions,
	onSaveCustom,
	onDeleteCustom,
}: {
	progressionId: string;
	onProgressionChange: (id: string) => void;
	patternKey: string;
	onPatternKeyChange: (key: string) => void;
	keyCycle: KeyCycle;
	onKeyCycleChange: (cycle: KeyCycle) => void;
	instrument: Instrument;
	onInstrumentChange: (instrument: Instrument) => void;
	tempoRamp: boolean;
	onTempoRampChange: (enabled: boolean) => void;
	rampStep: number;
	onRampStepChange: (step: number) => void;
	customProgressions: CustomProgression[];
	onSaveCustom: (cp: CustomProgression) => void;
	onDeleteCustom: (id: string) => void;
}) {
	const [editor, setEditor] = useState<EditorState>({ open: false });
	const [copied, setCopied] = useState(false);
	const selectedCustom = customProgressions.find((cp) => cp.id === progressionId);

	const copyShareLink = async (cp: CustomProgression) => {
		await navigator.clipboard.writeText(`${location.origin}/?prog=${encodeShare(cp)}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-rule bg-surface/50 p-5">
			<Field label="Pattern">
				<select
					value={progressionId}
					onChange={(e) => onProgressionChange(e.target.value)}
					className="w-full rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
				>
					{customProgressions.length > 0 && (
						<optgroup label="My progressions">
							{customProgressions.map((cp) => (
								<option key={cp.id} value={cp.id}>
									{cp.name}
								</option>
							))}
						</optgroup>
					)}
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

			{editor.open ? (
				<CustomProgressionEditor
					key={editor.initial?.id ?? "new"}
					initial={editor.initial}
					onSave={(cp) => {
						onSaveCustom(cp);
						setEditor({ open: false });
					}}
					onCancel={() => setEditor({ open: false })}
				/>
			) : (
				<div className="flex flex-wrap gap-2">
					<SmallButton onClick={() => setEditor({ open: true })}>+ New progression</SmallButton>
					{selectedCustom && (
						<>
							<SmallButton onClick={() => setEditor({ open: true, initial: selectedCustom })}>Edit</SmallButton>
							<SmallButton onClick={() => void copyShareLink(selectedCustom)}>
								{copied ? "Link copied" : "Copy share link"}
							</SmallButton>
							<SmallButton
								onClick={() => {
									if (confirm(`Delete "${selectedCustom.name}"?`)) onDeleteCustom(selectedCustom.id);
								}}
							>
								Delete
							</SmallButton>
						</>
					)}
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Key">
					<select
						value={patternKey}
						onChange={(e) => onPatternKeyChange(e.target.value)}
						className="w-full rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
					>
						{KEYS.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
				</Field>

				<Field label="Key cycling">
					<select
						value={keyCycle}
						onChange={(e) => onKeyCycleChange(e.target.value as KeyCycle)}
						className="w-full rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
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
						className="w-full rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
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

function SmallButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="rounded-full border border-rule px-3 py-1 text-sm text-muted transition-colors hover:text-foreground"
		>
			{children}
		</button>
	);
}
