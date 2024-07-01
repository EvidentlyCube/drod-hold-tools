import { assertNotNull } from "../utils/Asserts";
import { SignalArray } from "../utils/SignalArray";
import { HoldReader } from "./HoldReader";


class HoldReaderManager {
	private readonly _unfinishedReaders: HoldReader[];

	public holdReaders: SignalArray<HoldReader>

	public get isParsing() {
		return this._unfinishedReaders.length > 0;
	}

	public constructor() {
		this.holdReaders = new SignalArray();
		this._unfinishedReaders = [];

		setInterval(() => this.update(), 50);
	}

	public getParsed(holdReaderId?: string) {
		const id = parseInt(holdReaderId ?? "0");
		const holdReader = HoldReaders.getById(id);

		assertNotNull(holdReader, `Fatal error: no hold reader for ID=${holdReaderId}`);
		assertNotNull(holdReader.sharedState.hold, `Fatal error: hold reader missing Hold ID=${holdReaderId}`);

		return {
			holdReader,
			hold: holdReader.sharedState.hold
		};
	}

	public getById(id: number) {
		return this.holdReaders.array.find(reader => reader.id === id);
	}

	public deleteById(id: number) {
		this.holdReaders.removeBy(holdReader => holdReader.id === id);
	}

	public readHoldXmlString(xmlString: string, id?: number) {
		id = id ?? Date.now();

		const holdReader = new HoldReader(id, { xmlString });
		this._unfinishedReaders.push(holdReader);
		this.holdReaders.push(holdReader);

		return holdReader;
	}

	public readHoldFile(file: File) {
		const id = Date.now();

		const holdReader = new HoldReader(id, { file });
		this._unfinishedReaders.push(holdReader);
		this.holdReaders.push(holdReader);

		return holdReader;
	}

	private update() {
		if (this._unfinishedReaders.length > 0) {
			this._unfinishedReaders[0].update();

			if (this._unfinishedReaders[0].isFinished) {
				this._unfinishedReaders.splice(0, 1);
			}
		}
	}

}

export const HoldReaders = new HoldReaderManager();