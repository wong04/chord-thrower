"use client";

import { Standard } from "@/lib/standards/standards";
import { StandardsBrowser } from "./StandardsBrowser";

/** Standards setup panel: pick a tune. The key lives in the transport bar. */
export function Standards({
	standard,
	selectedId,
	onSelect,
}: {
	standard: Standard;
	selectedId: string;
	onSelect: (std: Standard) => void;
}) {
	return (
		<div className="flex w-full flex-col gap-3">
			<p className="text-sm text-muted">
				<span className="font-display text-lg text-foreground">{standard.title}</span> · {standard.composer},{" "}
				{standard.year}
			</p>
			<StandardsBrowser selectedId={selectedId} onSelect={onSelect} />
		</div>
	);
}
