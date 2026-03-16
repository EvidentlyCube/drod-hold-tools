import { parseFileToDataDetail } from "../data/actions/parseFileToDataDetail";
import { Hold } from "../data/datatypes/Hold";
import { ArchiveContents, unzipPromise } from "../utils/FflateUtils";
import { guessMimeType } from "../utils/FileUtils";

export type ImportDataArchiveFileStatus = 'replaced'
	| 'identical'
	| 'no-match'
	| 'error'

interface ImportDataArchiveOptions {
	onLog: (path: string, status: ImportDataArchiveFileStatus, context: string) => void;
}

export async function importDataArchive(
	hold: Hold,
	archiveBytes: Uint8Array<ArrayBuffer>,
	options?: Partial<ImportDataArchiveOptions>
): Promise<void> {
	const files = await extractArchive(archiveBytes);

	for (const [path, bytes] of files.entries()) {
		const fileName = extractFilename(path);
		if (!fileName) {
			// Skip, it's a directory
			continue;
		}

		const matchedData = hold.datas.find(data => data.name.newValue === fileName);

		if (!matchedData) {
			options?.onLog?.(path, 'no-match', '');
			continue;
		}

		const file = new File([bytes], fileName, { type: guessMimeType(bytes) });
		try {
			const newDetail = await parseFileToDataDetail(matchedData, file);

			if (newDetail.rawEncodedData === matchedData.details.newValue.rawEncodedData) {
				options?.onLog?.(path, 'identical', '');
				continue;
			}

			matchedData.$lastReplaceError.unset();
			matchedData.details.newValue = newDetail;

			options?.onLog?.(path, 'replaced', '');
		} catch (e) {
			options?.onLog?.(path, 'error', String(e));
		}
	}
}

async function extractArchive(archiveBytes: Uint8Array): Promise<ArchiveContents> {
	switch (guessMimeType(archiveBytes)) {
		case 'application/zip': return unzipPromise(archiveBytes.slice());
		default: throw new Error("Unsupported file format");
	}
}

function extractFilename(path: string): string {
	return path.match(/[^\/\\]*$/)![0];
}