import { Hold } from "../data/datatypes/Hold";
import { HoldChange } from "../data/datatypes/HoldChange";
import { assertNotNull } from "../utils/Asserts";
import { SignalArrayOperation, SignalArrayOperator } from "../utils/SignalArray";
import { SignalValue } from "../utils/SignalValue";
import { HoldReader } from "./HoldReader";
import { HoldReaders } from "./HoldReaderManager";

const DEBOUNCE_DURATION = 2000;

const STORE_HOLDS = 'holds';
const STORE_CHANGES = 'changes';

class HoldIndexedStorageClass {
	private _dbOpenRequest: IDBOpenDBRequest;
	private _db?: IDBDatabase;

	private _storedHoldIds = new Set<number>();
	private _loadedHoldToChanges = new Map<number, HoldChange[]>();

	private _holdChangesSaveQueue = new Set<Hold>();
	private _saveAfterTimestamp = 0;

	private get db() {
		assertNotNull(this._db, "Accessing DB but it's not created yet");
		return this._db;
	}

	public isInitializing = new SignalValue(true);
	public isBusy = new SignalValue(false);

	private _saveLock = false;

	public constructor() {
		this._dbOpenRequest = window.indexedDB.open('holds', 3);
		this._dbOpenRequest.onerror = this.onDbOpenRequest_error.bind(this);
		this._dbOpenRequest.onsuccess = this.onDbOpenRequest_success.bind(this);
		this._dbOpenRequest.onupgradeneeded = this.onDbOpenRequest_upgrade.bind(this);

		setInterval(() => this.update(), 50);
	}

	public register() {
		HoldReaders.holdReaders.onChange.add(this.onHoldListChange.bind(this));
	}

	public getChangesForHold(holdId: number): HoldChange[] {
		return this._loadedHoldToChanges.get(holdId) ?? [];
	}

	private update() {
		this.isBusy.value = this._saveLock || this._holdChangesSaveQueue.size > 0;

		if (
			this._holdChangesSaveQueue.size > 0
			&& Date.now() > this._saveAfterTimestamp
			&& !this._saveLock
		) {
			this.storeHoldChanges(Array.from(this._holdChangesSaveQueue.values()));
		}
	}

	private onHoldListChange(op: SignalArrayOperation<HoldReader>) {
		if (op.operator === SignalArrayOperator.Add) {
			for (const holdReader of op.elements) {
				holdReader.onParsed.add(this.registerHoldForChanges.bind(this));

				if (this._storedHoldIds.has(holdReader.id)) {
					continue;
				}

				holdReader.onParsed.add(this.storeHoldXml.bind(this));
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

		const holdsStore = this.db.transaction([STORE_HOLDS], 'readwrite').objectStore(STORE_HOLDS);
		const holdsStoreRequest = holdsStore.add({ holdId: holdReader.id, xmlText });

		holdsStoreRequest.onerror = e => {
			console.log(e);
			console.log(holdsStoreRequest.error);
		}

		const changesStore = this.db.transaction([STORE_CHANGES], 'readwrite').objectStore(STORE_CHANGES);
		const changesStoreRequest = changesStore.add({ holdId: holdReader.id, changes: [] });

		changesStoreRequest.onerror = e => {
			console.log(e);
			console.log(changesStoreRequest.error);
		}
	}

	private storeHoldChanges(holds: Hold[]) {
		this._saveLock = true;
		this._holdChangesSaveQueue.clear();

		const rows = holds.map(hold => ({holdId: hold.id, changes: hold.$changes.list.values() }));

		let remaining = rows.length;
		const popRemaining = () => {
			remaining--;

			if (remaining <= 0) {
				this._saveLock = false;
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
			this._storedHoldIds.add(holdId);
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