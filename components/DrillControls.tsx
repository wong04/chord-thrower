"use client";

import { Level, TIERS } from "@/lib/theory/chordPool";
import { KEY_LEVEL_BLURB, Tonality } from "@/lib/theory/keyHarmony";
import { LevelSelector } from "./LevelSelector";
import { KeyTonalitySelector } from "./KeyTonalitySelector";
import { LevelInfoPopover } from "./LevelInfoPopover";

export type NextPreview = "auto" | "show" | "hide";

const BARS_OPTIONS = [1, 2, 4];

export function DrillControls({
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
	showRoman,
	onShowRomanChange,
	showKeyboard,
	onShowKeyboardChange,
	barsPerChord,
	onBarsChange,
	nextPreview,
	onNextPreviewChange,
}: {
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (tonality: Tonality) => void;
	showRoman: boolean;
	onShowRomanChange: (show: boolean) => void;
	showKeyboard: boolean;
	onShowKeyboardChange: (show: boolean) => void;
	barsPerChord: number;
	onBarsChange: (bars: number) => void;
	nextPreview: NextPreview;
	onNextPreviewChange: (value: NextPreview) => void;
}) {
	const keyMode = keyChoice !== "all";

	return (
		<div className="flex w-full flex-col gap-5">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted">Difficulty</span>
					<LevelInfoPopover keyMode={keyMode} />
				</div>
				<LevelSelector
					value={level}
					onChange={onLevelChange}
					getTitle={(l) => (keyMode ? KEY_LEVEL_BLURB[l] : TIERS[l].description)}
				/>
				<span className="text-xs text-muted/70">
					{keyMode ? KEY_LEVEL_BLURB[level] : TIERS[level].description}
				</span>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<span className="text-sm text-muted">Key</span>
					<KeyTonalitySelector
						keyChoice={keyChoice}
						onKeyChange={onKeyChange}
						tonality={tonality}
						onTonalityChange={onTonalityChange}
					/>
					{keyMode && (
						<label className="mt-1 flex items-center gap-2 text-xs text-muted">
							<input
								type="checkbox"
								checked={showRoman}
								onChange={(e) => onShowRomanChange(e.target.checked)}
								className="h-4 w-4 accent-accent"
							/>
							Roman numerals
						</label>
					)}
				</div>

				<Field label="Bars per chord">
					<div className="inline-flex rounded-full border border-rule p-0.5">
						{BARS_OPTIONS.map((b) => (
							<button
								key={b}
								type="button"
								onClick={() => onBarsChange(b)}
								className={`flex-1 rounded-full px-3 py-1 text-sm transition-colors ${
									barsPerChord === b
										? "bg-accent text-on-accent"
										: "text-muted hover:text-foreground"
								}`}
							>
								{b}
							</button>
						))}
					</div>
				</Field>

				<Field label="Show Next Chord">
					<select
						value={nextPreview}
						onChange={(e) => onNextPreviewChange(e.target.value as NextPreview)}
						className="w-full rounded-lg border border-rule bg-background px-2 py-1.5 text-sm"
					>
						<option value="auto">Auto (by difficulty)</option>
						<option value="show">Always show</option>
						<option value="hide">Always hide</option>
					</select>
				</Field>
			</div>

			<label className="flex items-center gap-2 text-sm text-muted">
				<input
					type="checkbox"
					checked={showKeyboard}
					onChange={(e) => onShowKeyboardChange(e.target.checked)}
					className="h-4 w-4 accent-accent"
				/>
				Show scale &amp; keyboard
			</label>
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
