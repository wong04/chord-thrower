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
		<div className="flex items-center gap-2" aria-hidden>
			{Array.from({ length: beatsPerBar }, (_, i) => {
				const active = i === beat;
				const isDownbeat = i === 0;
				return (
					<span
						key={i}
						className={`h-3 w-3 rounded-full transition-all duration-75 ${
							active
								? counting
									? "scale-125 bg-amber-400"
									: isDownbeat
										? "scale-125 bg-foreground"
										: "scale-110 bg-foreground/70"
								: "bg-foreground/15"
						}`}
					/>
				);
			})}
		</div>
	);
}
