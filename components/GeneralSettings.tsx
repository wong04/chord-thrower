"use client";

import { INSTRUMENTS, Instrument } from "@/lib/theory/transpose";
import { Row, Segmented } from "./controls";
import { TIME_SIGNATURES } from "./TransportControls";

/** Settings shared by every play-along mode, shown once below the mode's own controls. */
export function GeneralSettings({
	instrument,
	onInstrumentChange,
	beatsPerBar,
	onBeatsPerBarChange,
	countIn,
	onCountInChange,
}: {
	instrument: Instrument;
	onInstrumentChange: (instrument: Instrument) => void;
	beatsPerBar: number;
	onBeatsPerBarChange: (beats: number) => void;
	countIn: boolean;
	onCountInChange: (enabled: boolean) => void;
}) {
	return (
		<section className="flex flex-col gap-4">
			<h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted">General</h2>

			<Row label="Read as">
				<select
					value={instrument}
					onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
					className="max-w-[60%] rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
				>
					{INSTRUMENTS.map((inst) => (
						<option key={inst.id} value={inst.id}>
							{inst.label}
						</option>
					))}
				</select>
			</Row>

			<Row label="Time">
				<Segmented
					value={String(beatsPerBar)}
					onChange={(v) => onBeatsPerBarChange(Number(v))}
					options={TIME_SIGNATURES.map((ts) => [String(ts.beatsPerBar), ts.label])}
					ariaLabel="Time signature"
				/>
			</Row>

			<label className="flex items-center gap-2 text-sm text-muted">
				<input
					type="checkbox"
					checked={countIn}
					onChange={(e) => onCountInChange(e.target.checked)}
					className="h-4 w-4 accent-accent"
				/>
				One-bar count-in
			</label>

			<p className="pt-2 text-xs text-muted/70">Space start/stop · ↑↓ tempo · F fullscreen · Esc exit</p>
		</section>
	);
}
