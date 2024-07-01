import { AsyncZlib, FlateError } from "fflate";
import { holdToXml } from "../data/HoldToXml";
import { Hold } from "../data/datatypes/Hold";
import { SignalArray } from "../utils/SignalArray";
import { downloadBlob, stringToUint8 } from "../data/Utils";

class HoldExporterImpl {
	public readonly exportingHolds = new SignalArray<Hold>();

	public exportHold(hold: Hold) {
		if (this.exportingHolds.contains(hold)) {
			return;
		}

		this.exportingHolds.push(hold);

		this.export(hold)
			.then(() => {

			})
			.catch(e => {
				console.error(e);
			})
			.finally(() => this.exportingHolds.remove(hold));

	}

	private async export(hold: Hold) {
		const xmlString = await holdToXml(hold)
		const xmlBytes = stringToUint8(xmlString);
		const asyncZlib = new AsyncZlib();

		const packedBytes = await new Promise<Uint8Array>(resolve => {
			let bytes = new Uint8Array();
			asyncZlib.ondata = (flateError: FlateError | null, data: Uint8Array, final: boolean) => {
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
			packedBytes[index] = packedBytes[index] ^ 0xFF;
		}

		downloadBlob(
			packedBytes,
			hold.name.oldText.replace(/[^a-zA-Z0-9()_ -]/g, '') + ".hold",
			'application/octet-stream'
		);
	}
}

export const HoldExporter = new HoldExporterImpl();