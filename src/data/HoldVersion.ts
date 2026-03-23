import { Option } from "../components/common/Select";
import { VERSION_AE, VERSION_JTRH, VERSION_TCB_301, VERSION_TSS_507, VERSION_TSS_508 } from "../Constants";
import { getShowDescriptionName } from "./Utils";

export class HoldVersion {
	public readonly version: number;

	public constructor(version: number | undefined) {
		this.version = version ?? 100;
	}

	public get holdNestsEverything() {
		return this.version <= VERSION_JTRH;
	}

	public get isVersionPrinted() {
		return this.version > VERSION_AE;
	}

	public get playerAttr_emailMessage() {
		return this.version <= VERSION_JTRH;
	}

	public get playerAttr_forumName() {
		return this.version >= VERSION_JTRH;
	}

	public get playerAttr_forumPassword() {
		return this.version >= VERSION_JTRH;
	}

	public get hasTabCharacters() {
		return this.version >= VERSION_TCB_301;
	}

	public get hasTabData() {
		return this.version >= VERSION_JTRH;
	}

	/**
	 * In JtRH speeches were included before <Rooms> rather than before the
	 * <Monster> or <Character> because back then there were no custom
	 * characters, only the monster type.
	 */
	public get exportSpeechesBeforeRoom() {
		return this.version === VERSION_JTRH;
	}

	/**
	 * In JtRH commands are not stored serialized into one
	 * variable `Commands` but instead each command is 7 variables in the format
	 * `<number><field>`, eg. `0x 0y 0w 0h 0f 0l 0s`
	 */
	public get characterCommandsStoredInMultipleVars() {
		return [VERSION_JTRH, VERSION_TCB_301].includes(this.version);
	}

	/**
	 * Flags field for commands was only introduced in TCB
	 */
	public get characterCommandsSupportFlags() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * In TCB onwards commands are stored serialized into a `Commands`
	 * extra var.
	 */
	public get characterCommandsStoredInCommands() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * Audio on entrance screen was only added in TSS
	 */
	public get entrancesSupportData() {
		return this.version >= VERSION_TSS_507;
	}

	/**
	 * Audio on entrance screen was only added in TSS
	 */
	public get entrancesSupportControlOnDescriptionShowing() {
		return this.version >= VERSION_TSS_507;
	}

	public get entrance(): HoldVersionEntrance {
		// In AE there was only one room entrance per level and it was stored
		// in Level attributes.
		const isStoredInLevelAttributes = this.version === VERSION_AE;
		const canShowDescriptionOnce = this.version >= VERSION_TSS_507;
		const canHideDescription = this.version >= VERSION_TCB_301;
		const canAddSound = this.version >= VERSION_TSS_507;
		const showDescriptionOptions: Option[] = [];

		if (canHideDescription) {
			showDescriptionOptions.push({ id: '0', value: '0', label: getShowDescriptionName(0) });
			showDescriptionOptions.push({ id: '1', value: '1', label: getShowDescriptionName(1) });
		}

		if (canShowDescriptionOnce) {
			showDescriptionOptions.push({ id: '2', value: '2', label: getShowDescriptionName(2) });

		}

		return {
			isStoredInLevelAttributes,
			canShowDescriptionOnce,
			canHideDescription,
			canAddSound,
			showDescriptionOptions,
		}
	}

	public get data(): HoldVersionData {
		// JtRH added scripting, speech and ability to play custom voices
		const isSupported = this.version >= VERSION_JTRH;

		return {
			isSupported
		};
	}

	public get characters(): HoldVersionCharacter {
		// JtRH had scripting but predefined custom characters were first
		// added in TCB
		const isSupported = this.version >= VERSION_TCB_301;

		return {
			isSupported
		};
	}

	public get scripting(): HoldVersionScripting {
		// JtRH added scripting
		const isSupported = this.version >= VERSION_JTRH;
		const hasVariables = this.version >= VERSION_TCB_301;

		return {
			isSupported,
			hasVariables,
		};
	}

	public get worldMaps(): HoldVersionWorldMaps {
		// TSS added world maps
		const isSupported = this.version >= VERSION_TSS_507;

		return {
			isSupported,
		};
	}

	/**
	 * Before JtRH levels ordered by the order they appear in the file.
	 */
	public get levelsHaveOrderIndex() {
		return this.version >= VERSION_JTRH;
	}

	public get holdAttr_charId() {
		return this.version >= VERSION_TCB_301;
	}

	public get holdAttr_varId() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * In JtRH `DataID` attribute was always included in Speech node,
	 * even if its value was 0.
	 */
	public get speechAttr_alwaysDataId() {
		return this.version === VERSION_JTRH;
	}

	/**
	 * In JtRH Data did not have HoldID attribute.
	 */
	public get dataAttr_holdId() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * JtRH has introduced scripting
	 */
	public get hasScripting() {
		return this.version >= VERSION_JTRH;
	}

	/**
	 * The Second Sky has introduced world maps
	 */
	public get hasWorldMaps() {
		return this.version >= VERSION_TSS_507;
	}

	/**
	 * TCB added support for controlling how entrance descriptions are displayed.
	 */
	public get entranceAttr_ShowDescription() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * In AE <SavedGames> attribute "SavedGameID" was stored after "Type"
	 * but in later versions of the engine are stored after "StartRoomO"
	 */
	public get saveAttr_idEarly() {
		return this.version === VERSION_AE;
	}

	public toString() {
		return `${this.gameName} (${this.version})`;
	}

	public get gameName() {
		if (this.version >= 500) {
			return "The Second Sky";
		} else if (this.version >= 400) {
			return "Gunthro and the Epic Blunder";
		} else if (this.version >= 300) {
			return "The City Beneath";
		} else if (this.version > 200) {
			return "Journey to Rooted Hold"
		} else {
			return "Architect's Edition";
		}
	}
}

interface HoldVersionEntrance {
	isStoredInLevelAttributes: boolean;
	canShowDescriptionOnce: boolean;
	canHideDescription: boolean;
	canAddSound: boolean;
	showDescriptionOptions: Option[];
}

interface HoldVersionData {
	isSupported: boolean;
}

interface HoldVersionCharacter {
	isSupported: boolean;
}

interface HoldVersionWorldMaps {
	isSupported: boolean;
}

interface HoldVersionScripting {
	isSupported: boolean;
	hasVariables: boolean;
}