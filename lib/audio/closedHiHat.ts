import * as Tone from "tone";

/**
 * Synthesized closed hi-hat: white noise through a steep highpass filter with a fast
 * percussive envelope. Much tighter than the ride sample — suits bossa nova feel.
 */
export class ClosedHiHat {
	private synth: Tone.NoiseSynth;
	private filter: Tone.Filter;
	private gain: Tone.Gain;

	constructor(volume = 0.7) {
		this.gain = new Tone.Gain(volume).toDestination();
		this.filter = new Tone.Filter(9000, "highpass").connect(this.gain);
		this.synth = new Tone.NoiseSynth({
			noise: { type: "white" },
			envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.02 },
		}).connect(this.filter);
	}

	setVolume(volume: number): void {
		this.gain.gain.value = volume;
	}

	play(time: number, velocity = 0.7): void {
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		this.synth.triggerAttackRelease("16n", at, velocity);
	}

	dispose(): void {
		this.synth.dispose();
		this.filter.dispose();
		this.gain.dispose();
	}
}
