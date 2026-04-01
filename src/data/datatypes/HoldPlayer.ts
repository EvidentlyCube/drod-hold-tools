import { Memoizer } from "../../utils/Memoizer";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { drodMultilineStringToHtmlString } from "../../utils/StringUtils";
import { type HoldRef, HoldRefModel } from "../references/HoldReference";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

const usesMemoizer = new Memoizer<number, ReadonlyArray<HoldRef>>();

interface PlayerConstructor {
	id: number;
	encOriginalName: string;
	gidCreated: number;
	encName: string;
	encEmailMessage: string | undefined;
	$isNewlyAdded: boolean;
}
export class HoldPlayer {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly gidOriginalName: string;
	public readonly gidCreated: number;
	public readonly name: SignalUpdatableValue<string>;

	/** @version 100 Only spotted in some AE holds */
	public readonly encEmailMessage: string | undefined;

	public readonly $isDeleted: SignalUpdatableValue<boolean>;
	public readonly $isNewlyAdded: boolean;

	public get $isModified() {
		return this.name.isChanged;
	}

	public get $uses(): ReadonlyArray<HoldRef> {
		return usesMemoizer.grab(this.id, () => {
			const uses: HoldRef[] = [];

			if (this.$hold.playerId.newValue === this.id) {
				uses.push({
					hold: this.$hold,
					model: HoldRefModel.Hold,
				});
			}

			this.$hold.levels.forEach(level => {
				if (level.playerId.newValue === this.id) {
					uses.push({
						hold: this.$hold,
						model: HoldRefModel.Level,
						levelId: level.id,
					});
				}
			});

			return uses;
		});
	}

	public constructor(hold: Hold, opts: PlayerConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.gidOriginalName = wcharBase64ToString(opts.encOriginalName);
		this.gidCreated = opts.gidCreated;
		this.name = new SignalUpdatableValue(
			drodMultilineStringToHtmlString(wcharBase64ToString(opts.encName)),
		);
		this.encEmailMessage = opts.encEmailMessage;

		this.$isNewlyAdded = opts.$isNewlyAdded;
		this.$isDeleted = new SignalUpdatableValue(false);
	}
}
