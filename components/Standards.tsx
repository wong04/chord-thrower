"use client";

import { KEYS } from "@/lib/theory/transpose";
import { Standard } from "@/lib/standards/standards";
import { StandardsBrowser } from "./StandardsBrowser";

/** Standards setup panel: pick a tune and a key. Shown when stopped. */
export function Standards({
	standard,
	selectedId,
	onSelect,
	standardKey,
	onKeyChange,
}: {
	standard: Standard;
	selectedId: string;
	onSelect: (std: Standard) => void;
	standardKey: string;
	onKeyChange: (key: string) => void;
}) {
	return (
		<div className="flex w-full max-w-xl flex-col gap-4">
			<StandardsBrowser selectedId={selectedId} onSelect={onSelect} />

			<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface/50 p-4">
				<label className="flex items-center gap-2 text-sm text-muted">
					Key
					<select
						value={standardKey}
						onChange={(e) => onKeyChange(e.target.value)}
						className="rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						{KEYS.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
				</label>
				<span className="ml-auto text-xs text-muted">
					{standard.composer} · {standard.year}
					{standard.melodyAbc ? " · melody PD" : ""}
				</span>
			</div>

			<p className="text-xs text-muted/60">
				Melodies shown are public-domain transcriptions. Chord changes are not copyrightable.
			</p>
		</div>
	);
}
