import { uint8ToBase64 } from "../../utils/StringUtils";
import { DataFormat } from "../DrodEnums";
import { isAudioFormat, isImageFormat as isImageDataFormat } from "../Utils";
import { HoldData, HoldDataDetails } from "../datatypes/HoldData";

export async function parseFileToDataDetail(data: HoldData, file: File): Promise<HoldDataDetails> {
	validateFormat(data.details.oldValue.format, file);

	const fileData = await readFile(file);

	return {
		format: await mimeTypeToFormat(file),
		rawEncodedData: uint8ToBase64(fileData)
	}
}

function validateFormat(format: DataFormat, file: File): void {
	if (isImageDataFormat(format)) {
		if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/bmp') {
			throw new Error(`Data format is an image one but received an unsupported file type: ${file.type}`);
		}
	} else if (isAudioFormat(format)) {
		if (file.type !== 'audio/ogg' && file.type !== 'audio/wav' && file.type !== 'audio/x-wav') {
			throw new Error(`Data format is an audio one but received an unsupported file type: ${file.type}`);
		}
	}
}

async function readFile(file: File): Promise<Uint8Array> {
	return new Promise<Uint8Array>(resolve => {
		const fileReader = new FileReader();

		const onError = () => {
			throw new Error("Error occurred while reading the file.");
		}

		const onLoad = () => {
			const { result } = fileReader;

			if (result instanceof ArrayBuffer) {
				resolve(new Uint8Array(result));

			} else if (typeof result === 'string') {
				throw new Error("Error occurred while reading the file - got string as a response instead of an array buffer."
					+ " This is a problem with the code, it shouldn't happen!"
				);
			} else {
				throw new Error("Error occurred while reading the file - operation finished but no data is available");
			}
		}

		fileReader.addEventListener('error', onError);
		fileReader.addEventListener('load', onLoad);

		fileReader.readAsArrayBuffer(file)
	});
}

async function mimeTypeToFormat(file: File) {
	switch (file.type) {
		case 'image/bmp': return DataFormat.BMP;
		case 'image/png': return DataFormat.PNG;
		case 'image/jpeg': return DataFormat.JPG;
		case 'audio/wav': return DataFormat.WAV;
		case 'audio/x-wav': return DataFormat.WAV;
		case 'audio/ogg': return DataFormat.OGG;
		default:
			throw new Error(`Attempted to guess data format from mimetype but it was not supported: ${file.type}`);
	}
}