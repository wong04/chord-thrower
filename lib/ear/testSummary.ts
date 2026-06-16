import { EarItem } from "./earItem";

export type EarTestResult = {
	item: EarItem;
	/** Indices the user picked, in order. */
	picks: number[];
	correct: boolean;
	attemptsUsed: number;
};

export type EarTestSummary = {
	total: number;
	correct: number;
	scorePct: number;
	wrongPct: number;
	/** The questions answered wrong, with the right answer and what was picked. */
	missed: { answer: string; picked: string[] }[];
	/** Accuracy per answer label, weakest first — so you see what you miss most. */
	perCategory: { label: string; correct: number; total: number }[];
};

/** Score a finished test session. Pure — no audio, unit-tested. */
export function summarizeTest(results: EarTestResult[]): EarTestSummary {
	const total = results.length;
	const correct = results.filter((r) => r.correct).length;
	const scorePct = total ? Math.round((correct / total) * 100) : 0;

	const missed = results
		.filter((r) => !r.correct)
		.map((r) => ({
			answer: r.item.categoryLabel,
			picked: r.picks.map((i) => r.item.labels[i]),
		}));

	const byLabel = new Map<string, { correct: number; total: number }>();
	for (const r of results) {
		const key = r.item.categoryLabel;
		const entry = byLabel.get(key) ?? { correct: 0, total: 0 };
		entry.total += 1;
		if (r.correct) entry.correct += 1;
		byLabel.set(key, entry);
	}
	const perCategory = [...byLabel.entries()]
		.map(([label, v]) => ({ label, ...v }))
		.sort((a, b) => a.correct / a.total - b.correct / b.total);

	return { total, correct, scorePct, wrongPct: 100 - scorePct, missed, perCategory };
}
