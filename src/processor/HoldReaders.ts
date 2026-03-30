import type { HoldChange } from "../data/datatypes/HoldChange";
import { assertNotNull } from "../utils/Asserts";
import type { HoldReadProgressLog } from "../utils/Interfaces";
import { SignalArray } from "../utils/SignalArray";
import { Signal } from "../utils/Signals";
import { SignalValue } from "../utils/SignalValue";
import { type ReadHoldResult, type ReadHoldSource, readHold } from "./readHold";

export class HoldReader {
	public readonly id: number;
	/** Starts true to indicate it's not yet ready */
	public readonly isBusy = new SignalValue<boolean>(true);
	public readonly name = new SignalValue<string>("");
	public readonly lastLog = new SignalValue<string>("Not started yet");
	public readonly error = new SignalValue<string>("");
	public readonly onParsed = new Signal<HoldReader>();

	public get isFinished() {
		return this._isFinished;
	}

	public get isStarted() {
		return this._isStarted;
	}

	public get hold() {
		if (this._result?.isSuccess) {
			return this._result.hold;
		} else {
			throw new Error("Accessing hold before it's ready");
		}
	}

	public get holdSafe() {
		if (this._result?.isSuccess) {
			return this._result.hold;
		} else {
			return undefined;
		}
	}

	public get holdXmlString() {
		return this._result?.holdString;
	}

	private readonly _source: ReadHoldSource;
	private _isStarted = false;
	private _isFinished = false;
	private _result: ReadHoldResult | undefined;
	private _changes: HoldChange[];

	constructor(id: number, source: ReadHoldSource, changes: HoldChange[]) {
		this.id = id;
		this._source = source;
		this._changes = changes;
		this.name.value = id.toString();
	}

	public async start() {
		if (this._isStarted) {
			return;
		}

		this._isStarted = true;
		this.isBusy.value = true;

		const handleLog: HoldReadProgressLog = (step, progress, context) => {
			this.lastLog.value = `${step} (${(progress * 100).toFixed(2)}%): ${context}`;
		};

		try {
			const result = await readHold(
				this.id,
				this._source,
				this._changes,
				handleLog,
			);
			this._result = result;

			if (this._result.isSuccess) {
				this.name.value = this.hold.name.newValue;
				this.onParsed.dispatch(this);
			} else {
				this.error.value = this._result.causedBy.message;
			}
		} finally {
			this.isBusy.value = false;
			this._isFinished = true;
		}
	}
}

class HoldReaderManager {
	public holdReaders: SignalArray<HoldReader>;

	public get isParsing() {
		return !!this.holdReaders.array.find(r => !r.isFinished);
	}

	public constructor() {
		this.holdReaders = new SignalArray();

		setInterval(() => this.pushQueue(), 100);
	}

	public getParsed(holdReaderId?: string) {
		const id = parseInt(holdReaderId ?? "0", 10);
		const holdReader = this.getById(id);

		assertNotNull(
			holdReader,
			`Fatal error: no hold reader for ID=${holdReaderId}`,
		);
		assertNotNull(
			holdReader.hold,
			`Fatal error: hold reader missing Hold ID=${holdReaderId}`,
		);

		return {
			holdReader,
			hold: holdReader.hold,
		};
	}

	public getById(id: number) {
		return this.holdReaders.array.find(reader => reader.id === id);
	}

	public deleteById(id: number) {
		this.holdReaders.removeBy(holdReader => holdReader.id === id);
	}

	public readHoldXmlString(
		xmlString: string,
		id: number,
		changes: HoldChange[],
	) {
		const holdReader = new HoldReader(id, { xmlString }, changes);

		this.holdReaders.push(holdReader);
		this.pushQueue();

		return holdReader;
	}

	public readHoldFile(file: File, changes: HoldChange[]) {
		const id = Date.now();

		const holdReader = new HoldReader(id, { file }, changes);
		this.holdReaders.push(holdReader);
		this.pushQueue();

		return holdReader;
	}

	public pushQueue() {
		for (const reader of this.holdReaders.array) {
			if (reader.isStarted && !reader.isFinished) {
				return;
			} else if (!reader.isStarted) {
				void reader.start();
				return;
			}
		}
	}
}

export const HoldReaders = new HoldReaderManager();
