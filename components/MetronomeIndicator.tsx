"use client";

export function MetronomeIndicator({
	beatsPerBar,
	beat,
	counting,
}: {
	beatsPerBar: number;
	/** Active beat (0-based), or -1 when stopped. */
	beat: number;
	counting: boolean;
}) {
	return (
		<div className="flex items-center gap-2.5" aria-hidden>
			{Array.from({ length: beatsPerBar }, (_, i) => {
				const active = i === beat;
				const isDownbeat = i === 0;
				let cls = "bg-foreground/15";
				if (active) {
					if (counting) cls = "scale-150 bg-accent";
					else if (isDownbeat) cls = "scale-150 bg-accent shadow-[0_0_16px_var(--accent)]";
					else cls = "scale-125 bg-foreground";
				}
				return (
					<span
						key={i}
						className={`h-3.5 w-3.5 rounded-full transition-all duration-75 ${cls}`}
					/>
				);
			})}
		</div>
	);
}
