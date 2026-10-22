"use client";

import React, { useEffect, useRef } from "react";
import { Bar } from "@/lib/pattern/bars";
import { ChordSymbol } from "./ChordSymbol";

/** Lead-sheet style chord chart: 4 bars a line, hand-lettered symbols, boxed rehearsal marks. */
export function PatternChart({
	bars,
	activeIndex,
	activeBar,
	sections,
}: {
	bars: Bar[];
	activeIndex: number;
	/** Bar currently sounding — washed red and kept scrolled into view. */
	activeBar: number;
	sections?: Array<{ bar: number; label: string }>;
}) {
	const sectionMap = new Map(sections?.map((s) => [s.bar, s.label]));
	const activeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [activeBar]);

	return (
		<div className="grid w-full max-w-2xl grid-cols-4 gap-y-4 pl-px sm:gap-y-5">
			{bars.map((bar, barIdx) => {
				const sectionLabel = sectionMap.get(barIdx);
				const isActiveBar = barIdx === activeBar;
				return (
					<React.Fragment key={barIdx}>
						{sectionLabel && (
							<div className="col-span-4 -mb-2 sm:-mb-3">
								<span className="inline-block border-[1.5px] border-foreground px-1.5 font-display text-base leading-tight">
									{sectionLabel}
								</span>
							</div>
						)}
						{/* Both edges + a 1px overlap, so neighbouring barlines merge and each row closes itself. */}
						<div
							ref={isActiveBar ? activeRef : undefined}
							className={`-ml-px flex h-12 scroll-my-24 items-end gap-1 border-x border-foreground/60 px-1.5 pb-1.5 sm:h-14 sm:gap-2 sm:px-2.5 ${
								isActiveBar ? "bg-accent/10" : ""
							}`}
						>
							{bar.continuation ? (
								<span
									className={`font-display text-[15px] sm:text-xl ${
										bar.startIndex === activeIndex ? "text-accent/70" : "text-foreground/30"
									}`}
								>
									%
								</span>
							) : (
								bar.chords.map((chord, i) => {
									const active = bar.startIndex + i === activeIndex;
									// Split bars shrink on phones (as iReal does) so e.g. "Bm7♭5 E7♭9" fits.
									const size = bar.chords.length > 1 ? "text-[12px] tracking-tight" : "text-[15px]";
									return (
										<span
											key={i}
											style={{ flexGrow: chord.beats, flexBasis: 0 }}
											className={`min-w-0 truncate pt-[0.5em] font-display leading-none sm:text-xl sm:tracking-normal ${size} ${
												active
													? "text-accent underline decoration-2 underline-offset-[3px]"
													: "text-foreground/85"
											}`}
										>
											<ChordSymbol symbol={chord.symbol} />
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
