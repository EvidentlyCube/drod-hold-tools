import {Data, DataFormat, DataLink} from "../data/Data";
import {CharCommand, CommandNameMap, ModelType} from "./Enums";
import {LocationUtils} from "./LocationUtils";
import {Hold} from "../data/Hold";

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

	describeDataLink(link: DataLink, hold: Hold) {
		switch (link.model.modelType) {
			case ModelType.Character:
				if (link.field === 'faceDataId') {
					return `${LocationUtils.getDisplay(link.model, hold)} - Face Image`;
				} else if (link.field === 'tilesDataId') {
					return `${LocationUtils.getDisplay(link.model, hold)} - Sprite Image`;
				}
				break;
			case ModelType.Entrance:
				if (link.field === 'dataId') {
					return `Entrance, ${LocationUtils.getDisplay(link.model, hold)} - Audio`
				}
				break;
			case ModelType.Room:
				if (link.field === 'customImageDataId') {
					return `Room, ${LocationUtils.getDisplay(link.model, hold)} - Room Image`
				} else if (link.field === 'overheadImageDataId') {
					return `Room, ${LocationUtils.getDisplay(link.model, hold)} - Overhead Image`
				}
				break;
			case ModelType.Speech:
				console.log(link.model.command.command);
				switch(link.model.command.command) {
					case CharCommand.CC_Speech:
						return `Speech, ${LocationUtils.getDisplay(link.model.command.source, hold)} ("${link.model.text}")`;
				}
				break;
			case ModelType.Command:
				const commandName = CommandNameMap.get(link.model.command);

				switch(link.model.command) {
					case CharCommand.CC_ImageOverlay:
						if (link.field === 'w') {
							return `Command #${link.model.index} ${commandName}, ${LocationUtils.getDisplay(link.model.source, hold)}`;
						}
						break;
					case CharCommand.CC_AmbientSound:
					case CharCommand.CC_AmbientSoundAt:
						if (link.field === 'w') {
							return `Command #${link.model.index} ${commandName}, ${LocationUtils.getDisplay(link.model.source, hold)}`;
						}
						break;
					case CharCommand.CC_SetMusic:
					case CharCommand.CC_WorldMapMusic:
						if (link.field === 'y') {
							return `Command #${link.model.index} ${commandName}, ${LocationUtils.getDisplay(link.model.source, hold)}`;
						}
						break;
					case CharCommand.CC_WorldMapImage:
						if (link.field === 'h') {
							return `Command #${link.model.index} ${commandName}, ${LocationUtils.getDisplay(link.model.source, hold)}`;
						}
						break;

				}

				return `Unknown command #${link.model.index} ${CommandNameMap.get(link.model.command)}, field ${link.field}, ${LocationUtils.getDisplay(link.model.source, hold)}.`
		}

		const modelName = ModelType[link.model.modelType];
		return `Unknown location, model ${modelName}, field ${link.field}`;
	},
};