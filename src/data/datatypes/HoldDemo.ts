import { getSpeakerMood, getSpeakerName, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface DemoConstructor {
	id: number;
	savedGameId: number;
	isHidden: boolean;
	encDescription: string;
	showSequenceNo: number;
	beginTurnNo: number;
	endTurnNo: number;
	nextDemoId: number;
	checksum: number;

}
export class HoldDemo {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly savedGameId: number;
	public readonly isHidden: boolean;
	public readonly description: string;
	public readonly showSequenceNo: number;
	public readonly beginTurnNo: number;
	public readonly endTurnNo: number;
	public readonly nextDemoId: number;
	public readonly checksum: number;

	public constructor(hold: Hold, opts: DemoConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.savedGameId = opts.savedGameId;
		this.isHidden = opts.isHidden;
		this.description = wcharBase64ToString(opts.encDescription);
		this.showSequenceNo = opts.showSequenceNo;
		this.beginTurnNo = opts.beginTurnNo;
		this.endTurnNo = opts.endTurnNo;
		this.nextDemoId = opts.nextDemoId;
		this.checksum = opts.checksum;
	}
}