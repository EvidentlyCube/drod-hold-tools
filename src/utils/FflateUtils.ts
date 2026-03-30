import { unzip } from "fflate";

export type ArchiveContents = Map<string, Uint8Array<ArrayBuffer>>;

export function unzipPromise(
	data: Uint8Array<ArrayBuffer>,
): Promise<ArchiveContents> {
	return new Promise((resolve, reject) => {
		unzip(data, (err, unzipped) => {
			if (err) {
				return reject(err);
			}

			const archiveContents: ArchiveContents = new Map();
			for (const [path, data] of Object.entries(unzipped)) {
				// Calling slice() to "cast" it to appropriate subtype,
				// otherwise Typescript is unhappy
				archiveContents.set(path, data.slice());
			}

			resolve(archiveContents);
		});
	});
}
