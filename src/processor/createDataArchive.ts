import { type Zippable, zip } from "fflate";
import type { Hold } from "../data/datatypes/Hold";
import { shouldYieldToUi, yieldToUi } from "../utils/AsyncUtils";
import { base64ToUint8 } from "../utils/StringUtils";

export async function createDataArchive(
	hold: Hold,
	onProgress?: (percent: number) => void,
): Promise<Uint8Array<ArrayBuffer>> {
	onProgress?.(0);
	const files = {} as Zippable;

	for (const [, data, index] of hold.datas) {
		files[data.name.newValue] = base64ToUint8(
			data.details.newValue.rawEncodedData,
		);

		if (shouldYieldToUi()) {
			await yieldToUi();
			onProgress?.(index / hold.datas.size);
		}
	}

	for (let i = 0; i < 100; i++) {
		await yieldToUi();
		onProgress?.(i / 100);
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
