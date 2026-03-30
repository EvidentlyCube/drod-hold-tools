import { AsyncZlib, type FlateError } from "fflate";
import type { Hold } from "../data/datatypes/Hold";
import { holdToXml } from "../data/HoldToXml";
import { downloadBlob, stringToUint8 } from "../data/Utils";
import { sanitizeFileName } from "../utils/FileUtils";
import { SignalArray } from "../utils/SignalArray";

class HoldExporterImpl {
	public readonly exportingHolds = new SignalArray<Hold>();

	public exportHold(hold: Hold) {
		if (this.exportingHolds.contains(hold)) {
			return;
		}

		this.exportingHolds.push(hold);

		this.export(hold)
			.then(() => {})
			.catch(e => {
				console.error(e);
			})
			.finally(() => this.exportingHolds.remove(hold));
	}

	private async export(hold: Hold) {
		const xmlString = await holdToXml(hold, {
			updateHoldDate: true,
		});
		const xmlBytes = stringToUint8(xmlString);
		const asyncZlib = new AsyncZlib();

		const packedBytes = await new Promise<Uint8Array<ArrayBuffer>>(resolve => {
			let bytes = new Uint8Array();
			asyncZlib.ondata = (
				flateError: FlateError | null,
				data: Uint8Array,
				final: boolean,
			) => {
				if (flateError) {
					throw flateError;
				}

				const newBytes = new Uint8Array(bytes.length + data.length);
				newBytes.set(bytes);
				newBytes.set(data, bytes.length);
				bytes = newBytes;

				if (!final) {
					return;
				}

				resolve(bytes);
			};

			asyncZlib.push(xmlBytes, true);
		});

		for (let index = 0; index < packedBytes.length; index++) {
			packedBytes[index] = packedBytes[index] ^ 0xff;
		}

		downloadBlob(
			packedBytes,
			`${sanitizeFileName(hold.name.newValue)}.hold`,
			"application/octet-stream",
		);
	}
}

export const HoldExporter = new HoldExporterImpl();
