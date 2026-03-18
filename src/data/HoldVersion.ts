import { VERSION_AE, VERSION_JTRH, VERSION_TCB_301, VERSION_TSS_507 } from "../Constants";

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
		return this.version === VERSION_JTRH;
	}

	/**
	 * Extension of characterCommandsStoredInMultipleVars -
	 */
	public get characterCommandsStoredInMultipleVars_normalOrdering() {
		return this.version === VERSION_JTRH;
	}

	/**
	 * In TCB onwards commands are stored serialized into a `Commands`
	 * extra var.
	 */
	public get characterCommandsStoredInCommands() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * In AE there was only one room entrance per level and it was stored in
	 * Level attributes.
	 */
	public get entranceInLevelAttributes() {
		return this.version === VERSION_AE;
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
	 * In JtRH Datas were included before use, afterwards all <Data> tags
	 * are front loaded
	 */
	public get frontLoadedData() {
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
	 * In JtRH demos did not contain the next demo ID
	 */
	public get demoAttr_NextDemoId() {
		return this.version >= VERSION_TCB_301;
	}

	/**
	 * In AE <SavedGames> attribute "SavedGameID" was stored after "Type"
	 * but in later versions of the engine are stored after "StartRoomO"
	 */
	public get saveAttr_idEarly() {
		return this.version === VERSION_AE;
	}
}