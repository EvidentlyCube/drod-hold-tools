import {Data, DataFormat} from "../data/Data";

export const DataUtils = {
	dataFormatToText(type: DataFormat) {
		switch (type) {
			case DataFormat.BMP:
				return "Image (BMP)";
			case DataFormat.JPG:
				return "Image (JPG)";
			case DataFormat.PNG:
				return "Image (PNG)";
			case DataFormat.S3M:
				return "Audio (S3M)";
			case DataFormat.WAV:
				return "Audio (WAV)";
			case DataFormat.OGG:
				return "Audio (OGG)";
			case DataFormat.THEORA:
				return "Video (THEORA)";
			default:
				return "Unknown";
		}
	},

	formatSize(size: number) {
		const bytes = size;
		const kbytes = bytes / 1024;
		const mbytes = bytes / 1024 / 1024;
		if (mbytes >= 1) {
			if (mbytes >= 100) {
				return mbytes.toFixed(0) + ' mbytes';
			} else if (mbytes >= 10) {
				return mbytes.toFixed(1) + ' mbytes';
			} else {
				return mbytes.toFixed(2) + ' mbytes';
			}
		} else if (kbytes >= 1) {
			if (kbytes >= 100) {
				return kbytes.toFixed(0) + ' kbytes';
			} else if (kbytes >= 10) {
				return kbytes.toFixed(1) + ' kbytes';
			} else {
				return kbytes.toFixed(2) + ' kbytes';
			}
		} else {
			return bytes + ' bytes';
		}
	},

	getDataUrl(data: Data, forceOld: boolean) {
		const rawData = (forceOld ? undefined : data.changes.data) ?? data.data;
		let type = "audio/ogg";
		if (data.format === DataFormat.WAV) {
			type = 'audio/wav';
		} else if (data.format === DataFormat.BMP) {
			type = 'image/bmp';
		} else if (data.format === DataFormat.PNG) {
			type = 'image/png';
		} else if (data.format === DataFormat.JPG) {
			type = 'image/jpg';
		}

		return `data:${type};base64,${rawData}`;
	},

	isAudio(dataFormat: DataFormat) {
		return dataFormat === DataFormat.OGG || dataFormat === DataFormat.WAV;
	},

	isImage(dataFormat: DataFormat) {
		return dataFormat === DataFormat.JPG || dataFormat === DataFormat.PNG || dataFormat === DataFormat.BMP;
	},

	extensionToFormat(extension: string) {
		switch (extension.toLowerCase()) {
			case 'jpg':
			case 'jpeg':
				return DataFormat.JPG;

			case 'png':
				return DataFormat.PNG;
			case 'bmp':
				return DataFormat.BMP;
			case 'ogg':
				return DataFormat.OGG;
			case 'wav':
				return DataFormat.WAV;
			default:
				throw new Error(`Unsupported file extension ${extension}`);
		}
	},
};