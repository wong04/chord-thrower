"use client";

import { useState } from "react";
import { EarTestConfig } from "@/lib/ear/useEarTest";
import { EarTestSetup } from "./EarTestSetup";
import { EarTestRunner } from "./EarTestRunner";

/** Orchestrates the test flow: setup → run (+ summary), then back to setup. */
export function EarTest({ active }: { active: boolean }) {
	const [config, setConfig] = useState<EarTestConfig | null>(null);

	if (!config) return <EarTestSetup onStart={setConfig} />;
	return <EarTestRunner config={config} active={active} onExit={() => setConfig(null)} />;
}
