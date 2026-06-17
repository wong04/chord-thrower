"use client";

import { Standard, STANDARDS } from "@/lib/standards/standards";

function Stars({ n }: { n: number }) {
	return (
		<span className="font-mono text-xs tracking-tight text-accent" aria-label={`difficulty ${n} of 5`}>
			{"★".repeat(n)}
			<span className="text-muted/40">{"★".repeat(5 - n)}</span>
		</span>
	);
}

/** Pick a tune. Each row shows difficulty stars. */
export function StandardsBrowser({
	selectedId,
	onSelect,
}: {
	selectedId: string;
	onSelect: (std: Standard) => void;
}) {
	return (
		<div className="flex w-full flex-col divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-surface/50">
			{STANDARDS.map((std) => {
				const active = std.id === selectedId;
				return (
					<button
						key={std.id}
						type="button"
						onClick={() => onSelect(std)}
						className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
							active ? "bg-accent/15" : "hover:bg-white/5"
						}`}
					>
						<div className="min-w-0 flex-1">
							<div className="truncate font-display text-sm font-medium">{std.title}</div>
							<div className="truncate text-xs text-muted">
								{std.composer} · {std.form}
							</div>
						</div>
						<Stars n={std.difficulty} />
					</button>
				);
			})}
		</div>
	);
}
