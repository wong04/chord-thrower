"use client";

import { useState } from "react";
import { KEYS } from "@/lib/theory/transpose";
import { expandProgression } from "@/lib/theory/progressionEngine";
import { ChordParseError } from "@/lib/theory/parseProgression";
import { CustomProgression, customToProgression, newCustomId } from "@/lib/pattern/customProgressions";

const PLACEHOLDER = "Dm7 G7 | Cmaj7 | % | Am7 D7 | G7";

function preview(draft: CustomProgression): { symbols: string[] } | { error: string } {
	if (!draft.text.trim()) return { error: "" };
	try {
		return { symbols: expandProgression(customToProgression(draft), draft.key).map((c) => c.symbol) };
	} catch (e) {
		if (e instanceof ChordParseError) return { error: e.message };
		throw e;
	}
}

export function CustomProgressionEditor({
	initial,
	onSave,
	onCancel,
}: {
	initial?: CustomProgression;
	onSave: (cp: CustomProgression) => void;
	onCancel: () => void;
}) {
	const [draft, setDraft] = useState<CustomProgression>(
		() => initial ?? { id: newCustomId(), name: "", key: "C", text: "" },
	);
	const result = preview(draft);
	const canSave = "symbols" in result && draft.name.trim() !== "";

	return (
		<div className="flex flex-col gap-3 rounded-xl border border-rule bg-background/60 p-4">
			<div className="grid grid-cols-[1fr_auto] gap-3">
				<input
					value={draft.name}
					onChange={(e) => setDraft({ ...draft, name: e.target.value })}
					placeholder="Name"
					aria-label="Progression name"
					className="rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
				/>
				<select
					value={draft.key}
					onChange={(e) => setDraft({ ...draft, key: e.target.value })}
					aria-label="Key the chords are written in"
					className="rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
				>
					{KEYS.map((k) => (
						<option key={k} value={k}>
							{k}
						</option>
					))}
				</select>
			</div>

			<textarea
				value={draft.text}
				onChange={(e) => setDraft({ ...draft, text: e.target.value })}
				placeholder={PLACEHOLDER}
				aria-label="Chord symbols"
				rows={3}
				className="rounded-lg border border-rule bg-background px-2 py-1.5 font-mono text-sm"
			/>
			<p className="text-xs text-muted/70">
				Separate bars with <code>|</code> · 1, 2 or 4 chords per bar · <code>%</code> holds the previous chord ·{" "}
				<code>C/E</code> for a bass note
			</p>

			{"symbols" in result ? (
				<p className="font-mono text-xs text-muted">{result.symbols.join("  ")}</p>
			) : (
				result.error && <p className="text-xs text-warn">⚠ {result.error}</p>
			)}

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-full px-4 py-1.5 text-sm text-muted hover:text-foreground"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={() => onSave({ ...draft, name: draft.name.trim(), text: draft.text.trim() })}
					disabled={!canSave}
					className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-on-accent disabled:opacity-40"
				>
					Save
				</button>
			</div>
		</div>
	);
}
