import { assertNotNull } from "../utils/Asserts";
import { SignalArrayOperation, SignalArrayOperator } from "../utils/SignalArray";
import { HoldReader } from "./HoldReader";
import { HoldReaders } from "./HoldReaderManager";

const STORE_HOLDS = 'holds';
const STORE_CHANGES = 'changes';

class IndexedDbStoreClass {
	private _dbOpenRequest: IDBOpenDBRequest;
	private _db?: IDBDatabase;

	private _storedHoldIds = new Set<number>();

	private get db() {
		assertNotNull(this._db, "Accessing DB but it's not created yet");
		return this._db;
	}

	public constructor() {
		this._dbOpenRequest = window.indexedDB.open('holds', 3);
		this._dbOpenRequest.onerror = this.onDbOpenRequest_error.bind(this);
		this._dbOpenRequest.onsuccess = this.onDbOpenRequest_success.bind(this);
		this._dbOpenRequest.onupgradeneeded = this.onDbOpenRequest_upgrade.bind(this);
	}

	public register() {
		HoldReaders.holdReaders.onChange.add(this.onHoldChange.bind(this));
	}

	private onHoldChange(op: SignalArrayOperation<HoldReader>) {
		if (op.operator === SignalArrayOperator.Add) {
			for (const holdReader of op.elements) {
				if (this._storedHoldIds.has(holdReader.id)) {
					continue;
				}

				holdReader.onParsed.add(this.onHoldParsed.bind(this));
			}
		}
	}
	private onHoldParsed(holdReader: HoldReader) {
		const xmlText = holdReader.sharedState.holdXmlText;

		if (!xmlText) {
			return;
		}

		const transaction = this.db.transaction([STORE_HOLDS], 'readwrite');
		const objectStore = transaction.objectStore(STORE_HOLDS);
		const objectStoreRequest = objectStore.add({ holdId: holdReader.id, xmlText });
		objectStoreRequest.onerror = e => {
			console.log(e);
			console.log(objectStoreRequest.error);
		}

	}
	private onDbOpenRequest_error(event: Event) {
		// @FIXME DB Open failed
	}

	private onDbOpenRequest_success(event: Event) {
		this._db = this._dbOpenRequest.result;

		const objectStore = this.db.transaction(STORE_HOLDS).objectStore(STORE_HOLDS);
		objectStore.openCursor().onsuccess = (event) => {
			const cursor = (event as any).target.result;

			if (!cursor) {
				return;
			}

			const { holdId, xmlText } = cursor.value;
			this._storedHoldIds.add(holdId);
			HoldReaders.readHoldXmlString(xmlText, holdId);
		}
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
}

export const IndexedDbStore = new IndexedDbStoreClass();