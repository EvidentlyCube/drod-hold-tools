import { Hold } from "../data/datatypes/Hold";
import { HoldChange } from "../data/datatypes/HoldChange";
import { assertNotNull } from "../utils/Asserts";
import { SignalArrayOperation, SignalArrayOperator } from "../utils/SignalArray";
import { SignalValue } from "../utils/SignalValue";
import { HoldReader } from "./HoldReader";
import { HoldReaders } from "./HoldReaders";

const DEBOUNCE_DURATION = 2000;

const STORE_HOLDS = 'holds';
const STORE_CHANGES = 'changes';

class HoldIndexedStorageClass {
	private _dbOpenRequest: IDBOpenDBRequest;
	private _db?: IDBDatabase;

	private _storedHoldReaderIds = new Set<number>();
	private _loadedHoldToChanges = new Map<number, HoldChange[]>();

	private _holdChangesSaveQueue = new Set<Hold>();
	private _saveAfterTimestamp = 0;

	private get db() {
		assertNotNull(this._db, "Accessing DB but it's not created yet");
		return this._db;
	}

	public isInitializing = new SignalValue(true);
	public isBusy = new SignalValue(false);

	private _changesSaveLock = false;
	private _saveHoldCounter = 0;
	private _deleteCounter = 0;

	public constructor() {
		this._dbOpenRequest = window.indexedDB.open('holds', 3);
		this._dbOpenRequest.onerror = this.onDbOpenRequest_error.bind(this);
		this._dbOpenRequest.onsuccess = this.onDbOpenRequest_success.bind(this);
		this._dbOpenRequest.onupgradeneeded = this.onDbOpenRequest_upgrade.bind(this);

		setInterval(() => this.update(), 50);
	}

	public register() {
		window.onbeforeunload = () => {
			if (this.isBusy.value) {
				return "Changes are still saving, are you sure you want to continue?";
			}
		}
		HoldReaders.holdReaders.onChange.add(this.onHoldListChange.bind(this));
	}

	public getChangesForHold(holdReaderId: number): HoldChange[] {
		return this._loadedHoldToChanges.get(holdReaderId) ?? [];
	}

	private update() {
		this.isBusy.value = this._deleteCounter > 0
			|| this._saveHoldCounter > 0
			|| HoldReaders.isParsing
			|| this._changesSaveLock
			|| this._holdChangesSaveQueue.size > 0;

		if (
			this._holdChangesSaveQueue.size > 0
			&& Date.now() > this._saveAfterTimestamp
			&& !this._changesSaveLock
		) {
			this.storeHoldChanges(Array.from(this._holdChangesSaveQueue.values()));
		}
	}

	private onHoldListChange(op: SignalArrayOperation<HoldReader>) {
		if (op.operator === SignalArrayOperator.Add) {
			for (const holdReader of op.elements) {
				holdReader.onParsed.add(this.registerHoldForChanges.bind(this));

				if (this._storedHoldReaderIds.has(holdReader.id)) {
					continue;
				}

				holdReader.onParsed.add(this.storeHoldXml.bind(this));
			}
		} else if (op.operator === SignalArrayOperator.Remove) {
			for (const holdReader of op.elements) {
				this._deleteCounter += 2;

				const holdsStore = this.db.transaction([STORE_HOLDS], 'readwrite').objectStore(STORE_HOLDS);
				const holdsStoreRequest = holdsStore.delete(holdReader.id);

				holdsStoreRequest.onsuccess = e => {
					this._deleteCounter--;
				}
				holdsStoreRequest.onerror = e => {
					this._deleteCounter--;
					console.log(e);
					console.log(holdsStoreRequest.error);
				}

				const changesStore = this.db.transaction([STORE_CHANGES], 'readwrite').objectStore(STORE_CHANGES);
				const changesStoreRequest = changesStore.delete(holdReader.id);

				changesStoreRequest.onsuccess = e => {
					this._deleteCounter--;
				}
				changesStoreRequest.onerror = e => {
					this._deleteCounter--;
					console.log(e);
					console.log(changesStoreRequest.error);
				}

				this._storedHoldReaderIds.delete(holdReader.id);
				this._loadedHoldToChanges.delete(holdReader.id);
				if (holdReader.sharedState.hold) {
					this._holdChangesSaveQueue.delete(holdReader.sharedState.hold);
				}
			}
		}
	}

	private registerHoldForChanges(holdReader: HoldReader) {
		const { hold } = holdReader.sharedState;

		if (!hold) {
			return;
		}

		hold.$changes.onChange.add(this.onHoldChange.bind(this, hold));
	}

	private onHoldChange(hold: Hold) {
		this._holdChangesSaveQueue.add(hold);
		this._saveAfterTimestamp = Date.now() + DEBOUNCE_DURATION;
	}

	private storeHoldXml(holdReader: HoldReader) {
		const xmlText = holdReader.sharedState.holdXmlText;

		if (!xmlText) {
			return;
		}

		this._saveHoldCounter += 2;

		const holdsStore = this.db.transaction([STORE_HOLDS], 'readwrite').objectStore(STORE_HOLDS);
		const holdsStoreRequest = holdsStore.put({ holdId: holdReader.id, xmlText });

		holdsStoreRequest.onsuccess = e => {
			this._saveHoldCounter--;
		}
		holdsStoreRequest.onerror = e => {
			this._saveHoldCounter--;
			console.log(e);
			console.log(holdsStoreRequest.error);
		}

		const changesStore = this.db.transaction([STORE_CHANGES], 'readwrite').objectStore(STORE_CHANGES);
		const changesStoreRequest = changesStore.put({ holdId: holdReader.id, changes: [] });

		changesStoreRequest.onsuccess = e => {
			this._saveHoldCounter--;
		}
		changesStoreRequest.onerror = e => {
			this._saveHoldCounter--;
			console.log(e);
			console.log(changesStoreRequest.error);
		}
	}

	private storeHoldChanges(holds: Hold[]) {
		this._changesSaveLock = true;
		this._holdChangesSaveQueue.clear();

		const rows = holds.map(hold => ({ holdId: hold.$holdReaderId, changes: hold.$changes.list.values() }));

		let remaining = rows.length;
		const popRemaining = () => {
			remaining--;

			if (remaining <= 0) {
				this._changesSaveLock = false;
			}
		}
		for (const row of rows) {
			const changesStore = this.db.transaction([STORE_CHANGES], 'readwrite').objectStore(STORE_CHANGES);
			const changesStoreRequest = changesStore.put(row);

			// eslint-disable-next-line no-loop-func
			changesStoreRequest.onsuccess = e => {
				popRemaining();
			}
			changesStoreRequest.onerror = e => {
				popRemaining();

				console.log(e);
				console.log(changesStoreRequest.error);
			}
		}
	}

	private onDbOpenRequest_error(event: Event) {
		// @FIXME DB Open failed
	}

	private onDbOpenRequest_success(event: Event) {
		this._db = this._dbOpenRequest.result;

		this.loadHolds();
	}

	private onDbOpenRequest_upgrade(e: IDBVersionChangeEvent) {
		this._db = this._dbOpenRequest.result;

		this.db.onerror = (event) => {
			// @FIXME on error
		};

		if (!this.db.objectStoreNames.contains(STORE_HOLDS)) {
			const holdStore = this.db.createObjectStore(STORE_HOLDS, { keyPath: 'holdId' });
			holdStore.createIndex('xmlText', 'xmlText', { unique: false });
		}

		if (!this.db.objectStoreNames.contains(STORE_CHANGES)) {
			const changesStore = this.db.createObjectStore(STORE_CHANGES, { keyPath: 'holdId' });
			changesStore.createIndex('changes', 'changes', { unique: false });
		}
	}

	private loadHolds() {
		const holdsStore = this.db.transaction(STORE_HOLDS).objectStore(STORE_HOLDS);
		holdsStore.openCursor().onsuccess = (event) => {
			const cursor = (event as any).target.result as IDBCursorWithValue;

			if (!cursor) {
				this.loadChanges();
				return;
			}

			const { holdId, xmlText } = cursor.value;
			this._storedHoldReaderIds.add(holdId);
			HoldReaders.readHoldXmlString(xmlText, holdId);

			cursor.continue();
		}
	}

	private loadChanges() {
		const changesStore = this.db.transaction(STORE_CHANGES).objectStore(STORE_CHANGES);
		changesStore.openCursor().onsuccess = (event) => {
			const cursor = (event as any).target.result as IDBCursorWithValue;

			if (!cursor) {
				this.isInitializing.value = false
				return;
			}

			const { holdId, changes } = cursor.value;
			this._loadedHoldToChanges.set(holdId, changes);

			cursor.continue();
		}
	}
}

export const HoldIndexedStorage = new HoldIndexedStorageClass();