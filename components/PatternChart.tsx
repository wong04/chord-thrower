"use client";

import React from "react";
import { Bar } from "@/lib/pattern/usePattern";

/** Lead-sheet style chord chart: barlines, hand-lettered symbols, boxed rehearsal marks. */
export function PatternChart({
	bars,
	activeIndex,
	sections,
}: {
	bars: Bar[];
	activeIndex: number;
	sections?: Array<{ bar: number; label: string }>;
}) {
	const sectionMap = new Map(sections?.map((s) => [s.bar, s.label]));

	return (
		<div className="grid w-full max-w-2xl grid-cols-2 gap-y-5 pl-px sm:grid-cols-4">
			{bars.map((bar, barIdx) => {
				const sectionLabel = sectionMap.get(barIdx);
				return (
					<React.Fragment key={barIdx}>
						{sectionLabel && (
							<div className="col-span-2 -mb-3 sm:col-span-4">
								<span className="inline-block border-[1.5px] border-foreground px-1.5 font-display text-base leading-tight">
									{sectionLabel}
								</span>
							</div>
						)}
						{/* Both edges + a 1px overlap, so neighbouring barlines merge and each row closes itself. */}
						<div className="-ml-px flex h-14 items-end gap-2 border-x border-foreground/60 px-2.5 pb-1.5">
							{bar.continuation ? (
								<span
									className={`font-display text-xl ${
										bar.startIndex === activeIndex ? "text-accent/70" : "text-foreground/30"
									}`}
								>
									%
								</span>
							) : (
								bar.chords.map((chord, i) => {
									const active = bar.startIndex + i === activeIndex;
									return (
										<span
											key={i}
											className={`flex-1 truncate font-display text-xl leading-none transition-colors ${
												active
													? "text-accent underline decoration-2 underline-offset-[3px]"
													: "text-foreground/85"
											}`}
										>
											{chord.symbol}
										</span>
									);
								})
							)}
						</div>
					</React.Fragment>
				);
			})}
		</div>
	);
}
