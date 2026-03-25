import { zip, Zippable } from "fflate";
import { Hold } from "../data/datatypes/Hold";
import { base64ToUint8 } from "../utils/StringUtils";
import { shouldYieldToUi, yieldToUi } from "../utils/AsyncUtils";

export async function createDataArchive(
	hold: Hold,
	onProgress?: (percent: number) => void
): Promise<Uint8Array<ArrayBuffer>> {
	onProgress?.(0);
	const files = {} as Zippable;

	for (const [, data, index] of hold.datas) {
		files[data.name.newValue] = base64ToUint8(data.details.newValue.rawEncodedData);

		if (shouldYieldToUi()) {
			await yieldToUi();
			onProgress?.(index / hold.datas.size);
		}
	}

	return new Promise((resolve, reject) => {
		zip(files, (error, data) => {
			if (error) {
				reject(error);
			}

			resolve(new Uint8Array(data));
		});
	});
}