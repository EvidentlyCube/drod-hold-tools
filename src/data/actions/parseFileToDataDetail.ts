import { assertNotNull } from '../../utils/Asserts';
import { uint8ToBase64 } from '../../utils/StringUtils';
import { DataFormat } from '../DrodEnums';
import { isAudioFormat, isImageFormat as isImageDataFormat } from '../Utils';
import { HoldData, HoldDataDetails } from '../datatypes/HoldData';

export async function parseFileToDataDetail(
	data: HoldData,
	file: File,
): Promise<HoldDataDetails> {
	validateFormat(data.details.oldValue.format, file);

	const fileData = await readFile(file);

	return {
		format: mimeTypeToFormat(file),
		rawEncodedData: uint8ToBase64(fileData),
	};
}

function validateFormat(format: DataFormat, file: File): void {
	if (isImageDataFormat(format)) {
		if (
			file.type !== 'image/png'
			&& file.type !== 'image/jpeg'
			&& file.type !== 'image/bmp'
		) {
			throw new Error(
				`Data format is an image one but received an unsupported file type: ${file.type}`,
			);
		}
	} else if (isAudioFormat(format)) {
		if (
			file.type !== 'audio/ogg'
			&& file.type !== 'application/ogg'
			&& file.type !== 'audio/wav'
			&& file.type !== 'audio/x-wav'
		) {
			throw new Error(
				`Data format is an audio one but received an unsupported file type: ${file.type}`,
			);
		}
	}
}

async function readFile(file: File): Promise<Uint8Array> {
	return new Promise<Uint8Array>((resolve) => {
		const fileReader = new FileReader();

		const onError = () => {
			throw new Error('Error occurred while reading the file.');
		};

		const onLoad = () => {
			const { result } = fileReader;

			if (result instanceof ArrayBuffer) {
				resolve(new Uint8Array(result));
			} else if (typeof result === 'string') {
				throw new Error(
					'Error occurred while reading the file - got string as a response instead of an array buffer.'
						+ " This is a problem with the code, it shouldn't happen!",
				);
			} else {
				throw new Error(
					'Error occurred while reading the file - operation finished but no data is available',
				);
			}
		};

		fileReader.addEventListener('error', onError);
		fileReader.addEventListener('load', onLoad);

		fileReader.readAsArrayBuffer(file);
	});
}

const mimeTypeToFormatMap = new Map<string, DataFormat>([
	['image/bmp', DataFormat.BMP],
	['image/png', DataFormat.PNG],
	['image/jpeg', DataFormat.JPG],
	['audio/wav', DataFormat.WAV],
	['audio/x-wav', DataFormat.WAV],
	['audio/ogg', DataFormat.OGG],
	['application/ogg', DataFormat.OGG],
]);

function mimeTypeToFormat(file: File): DataFormat {
	const type = mimeTypeToFormatMap.get(file.type);
	assertNotNull(
		type,
		`Attempted to guess data format from mimetype but it was not supported: ${file.type}`,
	);
	return type;
}
