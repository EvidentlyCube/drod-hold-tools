export enum CharCommand {
	CC_Appear = 0,
	CC_AppearAt,
	CC_MoveTo,
	CC_Wait,
	CC_WaitForCueEvent,
	CC_WaitForRect,
	CC_Speech,
	CC_Imperative,
	CC_Disappear,
	CC_TurnIntoMonster,
	CC_FaceDirection,
	CC_WaitForNotRect,
	CC_WaitForDoorTo,
	CC_Label,
	CC_GoTo,
	CC_GotoIf,
	CC_WaitForMonster,
	CC_WaitForNotMonster,
	CC_WaitForTurn,
	CC_WaitForCleanRoom,
	CC_WaitForPlayerToFace,
	CC_ActivateItemAt,
	CC_EndScript,
	CC_WaitForHalph,
	CC_WaitForNotHalph,
	CC_WaitForCharacter,
	CC_WaitForNotCharacter,
	CC_FlushSpeech,
	CC_Question,
	CC_SetMusic,
	CC_EndScriptOnExit,
	CC_If,
	CC_IfElse,
	CC_IfEnd,
	CC_LevelEntrance,
	CC_VarSet,
	CC_WaitForVar,
	CC_SetPlayerAppearance,
	CC_CutScene,
	CC_MoveRel,
	CC_PlayerEquipsWeapon,
	CC_AnswerOption,
	CC_BuildMarker,
	CC_AmbientSound,
	CC_AmbientSoundAt,
	CC_WaitForNoBuilding,
	CC_PlayVideo,
	CC_WaitForPlayerToMove,
	CC_WaitForPlayerToTouchMe,
	CC_SetNPCAppearance,
	CC_SetWaterTraversal,
	CC_StartGlobalScript,
	CC_WaitForItem,
	CC_GenerateEntity,
	CC_GameEffect,
	CC_RoomLocationText,
	CC_FlashingText,
	CC_DisplayFilter,
	CC_Build,
	CC_WorldMapMusic,
	CC_WorldMapIcon,
	CC_WorldMapSelect,
	CC_SetPlayerWeapon,
	CC_WaitForSomeoneToPushMe,
	CC_WaitForOpenMove,
	CC_WaitForCleanLevel,
	CC_ChallengeCompleted,
	CC_AttackTile,
	CC_SetPlayerStealth,
	CC_WaitForPlayerInput,
	CC_Return,
	CC_GoSub,
	CC_ImageOverlay,
	CC_WorldMapImage,
	CC_WaitForEntityType,
	CC_WaitForNotEntityType,
	CC_TeleportTo,
	CC_TeleportPlayerTo,
	CC_DestroyTrapdoor,
	CC_IfElseIf,
	CC_FaceTowards,
	CC_GetNaturalTarget,
	CC_GetEntityDirection,
}

export enum MonsterType {
	Roach = 0,
	RoachQueen = 1,
	RoachEgg = 2,
	Goblin = 3,
	Neather=4,
	Wraithwing=5,
	EvilEye=6,
	Serpent=7,
	TarMother = 8,
	TarBaby = 9,
	Brain = 10,
	Mimic = 11,
	Spider = 12,
	Adder = 13,
	Rattlesnake = 14,
	RockGolem=15,
	Waterskipper=16,
	WaterskipperNest=17,
	Aumtlich=18,
	Clone=19,
	Decoy=20,
	Wubba=21,
	Seep=22,
	Stalwart=23,
	HalphYoung=24,
	Slayer39th=25,
	Fegundo=26,
	FegundoAshes=27,
	Guard=28,
	Character=29,
	MudMother=30,
	MudBaby=31,
	GelMother=32,
	GelBaby=33,
	Citizen=34,
	RockGiant=35,
	HalphOld = 36,
	SlayerOther=37,
	Soldier=38,
	Architect=39,
	Construct = 40,
	Gentryii = 41,
	TemporalClone = 42,
	FluffBaby = 43,

	_CharacterTypesStart = 10000,
	Negotiator = _CharacterTypesStart,
	Citizen1 = 10001,
	Citizen2 = 10002,
	GoblinKing = 10003,
	Instructor = 10004,
	MudCoordinator = 10005,
	TarTechnician = 10006,
	EvilEyeActive = 10007,
	Beethro = 10008,
	Citizen3 = 10009,
	Citizen4 = 10010,
	BeethroInDisguise = 10011,
	Gunthro = 10012,

	_CustomCharactersStart = 20000
}

const _MonsterNameMap: Map<number, string> = new Map();
_MonsterNameMap.set(MonsterType.Roach, 'Roach');
_MonsterNameMap.set(MonsterType.RoachQueen, 'Roach Queen');
_MonsterNameMap.set(MonsterType.RoachEgg, 'Roach Egg');
_MonsterNameMap.set(MonsterType.Goblin, 'Goblin');
_MonsterNameMap.set(MonsterType.Neather, 'Neather');
_MonsterNameMap.set(MonsterType.Wraithwing, 'Wraithwing');
_MonsterNameMap.set(MonsterType.EvilEye, 'Evil Eye');
_MonsterNameMap.set(MonsterType.Serpent, 'Serpent');
_MonsterNameMap.set(MonsterType.TarMother, 'Tar Mother');
_MonsterNameMap.set(MonsterType.TarBaby, 'Tar Baby');
_MonsterNameMap.set(MonsterType.Brain, 'Brain');
_MonsterNameMap.set(MonsterType.Mimic, 'Mimic');
_MonsterNameMap.set(MonsterType.Spider, 'Spider');
_MonsterNameMap.set(MonsterType.Adder, 'Adder');
_MonsterNameMap.set(MonsterType.Rattlesnake, 'Rattlesnake');
_MonsterNameMap.set(MonsterType.RockGolem, 'Rock Golem');
_MonsterNameMap.set(MonsterType.Waterskipper, 'Waterskipper');
_MonsterNameMap.set(MonsterType.WaterskipperNest, 'Waterskipper Nest');
_MonsterNameMap.set(MonsterType.Aumtlich, 'Aumtlich');
_MonsterNameMap.set(MonsterType.Clone, 'Clone');
_MonsterNameMap.set(MonsterType.Decoy, 'Decoy');
_MonsterNameMap.set(MonsterType.Wubba, 'Wubba');
_MonsterNameMap.set(MonsterType.Seep, 'Seep');
_MonsterNameMap.set(MonsterType.Stalwart, 'Stalwart');
_MonsterNameMap.set(MonsterType.HalphYoung, 'Young Halph');
_MonsterNameMap.set(MonsterType.Slayer39th, '39th Slayer');
_MonsterNameMap.set(MonsterType.Fegundo, 'Fegundo');
_MonsterNameMap.set(MonsterType.FegundoAshes, 'Fegundo Ashes');
_MonsterNameMap.set(MonsterType.Guard, 'Guard');
_MonsterNameMap.set(MonsterType.Character, 'Character');
_MonsterNameMap.set(MonsterType.MudMother, 'Mud Mother');
_MonsterNameMap.set(MonsterType.MudBaby, 'Mud Baby');
_MonsterNameMap.set(MonsterType.GelMother, 'Gel Mother');
_MonsterNameMap.set(MonsterType.GelBaby, 'Gel Baby');
_MonsterNameMap.set(MonsterType.Citizen, 'Citizen');
_MonsterNameMap.set(MonsterType.RockGiant, 'Rock Giant');
_MonsterNameMap.set(MonsterType.HalphOld, 'Halph');
_MonsterNameMap.set(MonsterType.SlayerOther, 'Slayer');
_MonsterNameMap.set(MonsterType.Soldier, 'Soldier');
_MonsterNameMap.set(MonsterType.Architect, 'Architect');
_MonsterNameMap.set(MonsterType.Construct, 'Construct');
_MonsterNameMap.set(MonsterType.Gentryii, 'Gentryii');
_MonsterNameMap.set(MonsterType.TemporalClone, 'Temporal Clone');
_MonsterNameMap.set(MonsterType.FluffBaby, 'Fluff Baby');
_MonsterNameMap.set(MonsterType.Negotiator, 'Negotiator');
_MonsterNameMap.set(MonsterType.Citizen1, 'Citizen1');
_MonsterNameMap.set(MonsterType.Citizen2, 'Citizen2');
_MonsterNameMap.set(MonsterType.GoblinKing, 'Goblin King');
_MonsterNameMap.set(MonsterType.Instructor, 'Instructor');
_MonsterNameMap.set(MonsterType.MudCoordinator, 'Mud Coordinator');
_MonsterNameMap.set(MonsterType.TarTechnician, 'Tar Technician');
_MonsterNameMap.set(MonsterType.EvilEyeActive, 'Evil Eye Active');
_MonsterNameMap.set(MonsterType.Beethro, 'Beethro');
_MonsterNameMap.set(MonsterType.Citizen3, 'Citizen3');
_MonsterNameMap.set(MonsterType.Citizen4, 'Citizen4');
_MonsterNameMap.set(MonsterType.BeethroInDisguise, 'Beethro in disguise');
_MonsterNameMap.set(MonsterType.Gunthro, 'Gunthro');

export const MonsterNameMap: ReadonlyMap<number, string> = _MonsterNameMap;

const _CommandNameMap: Map<number, string> = new Map();
_CommandNameMap.set(CharCommand.CC_Appear, 'Appear');
_CommandNameMap.set(CharCommand.CC_AppearAt, 'Appear At');
_CommandNameMap.set(CharCommand.CC_MoveTo, 'Move To');
_CommandNameMap.set(CharCommand.CC_Wait, 'Wait');
_CommandNameMap.set(CharCommand.CC_WaitForCueEvent, 'Wait For Cue Event');
_CommandNameMap.set(CharCommand.CC_WaitForRect, 'Wait For Rect');
_CommandNameMap.set(CharCommand.CC_Speech, 'Speech');
_CommandNameMap.set(CharCommand.CC_Imperative, 'Imperative');
_CommandNameMap.set(CharCommand.CC_Disappear, 'CC_Disappear');
_CommandNameMap.set(CharCommand.CC_TurnIntoMonster, 'CC_TurnIntoMonster');
_CommandNameMap.set(CharCommand.CC_FaceDirection, 'CC_FaceDirection');
_CommandNameMap.set(CharCommand.CC_WaitForNotRect, 'CC_WaitForNotRect');
_CommandNameMap.set(CharCommand.CC_WaitForDoorTo, 'CC_WaitForDoorTo');
_CommandNameMap.set(CharCommand.CC_Label, 'CC_Label');
_CommandNameMap.set(CharCommand.CC_GoTo, 'CC_GoTo');
_CommandNameMap.set(CharCommand.CC_GotoIf, 'CC_GotoIf');
_CommandNameMap.set(CharCommand.CC_WaitForMonster, 'CC_WaitForMonster');
_CommandNameMap.set(CharCommand.CC_WaitForNotMonster, 'CC_WaitForNotMonster');
_CommandNameMap.set(CharCommand.CC_WaitForTurn, 'CC_WaitForTurn');
_CommandNameMap.set(CharCommand.CC_WaitForCleanRoom, 'CC_WaitForCleanRoom');
_CommandNameMap.set(CharCommand.CC_WaitForPlayerToFace, 'CC_WaitForPlayerToFace');
_CommandNameMap.set(CharCommand.CC_ActivateItemAt, 'CC_ActivateItemAt');
_CommandNameMap.set(CharCommand.CC_EndScript, 'CC_EndScript');
_CommandNameMap.set(CharCommand.CC_WaitForHalph, 'CC_WaitForHalph');
_CommandNameMap.set(CharCommand.CC_WaitForNotHalph, 'CC_WaitForNotHalph');
_CommandNameMap.set(CharCommand.CC_WaitForCharacter, 'CC_WaitForCharacter');
_CommandNameMap.set(CharCommand.CC_WaitForNotCharacter, 'CC_WaitForNotCharacter');
_CommandNameMap.set(CharCommand.CC_FlushSpeech, 'CC_FlushSpeech');
_CommandNameMap.set(CharCommand.CC_Question, 'CC_Question');
_CommandNameMap.set(CharCommand.CC_SetMusic, 'CC_SetMusic');
_CommandNameMap.set(CharCommand.CC_EndScriptOnExit, 'CC_EndScriptOnExit');
_CommandNameMap.set(CharCommand.CC_If, 'CC_If');
_CommandNameMap.set(CharCommand.CC_IfElse, 'CC_IfElse');
_CommandNameMap.set(CharCommand.CC_IfEnd, 'CC_IfEnd');
_CommandNameMap.set(CharCommand.CC_LevelEntrance, 'CC_LevelEntrance');
_CommandNameMap.set(CharCommand.CC_VarSet, 'CC_VarSet');
_CommandNameMap.set(CharCommand.CC_WaitForVar, 'CC_WaitForVar');
_CommandNameMap.set(CharCommand.CC_SetPlayerAppearance, 'CC_SetPlayerAppearance');
_CommandNameMap.set(CharCommand.CC_CutScene, 'CC_CutScene');
_CommandNameMap.set(CharCommand.CC_MoveRel, 'CC_MoveRel');
_CommandNameMap.set(CharCommand.CC_PlayerEquipsWeapon, 'CC_PlayerEquipsWeapon');
_CommandNameMap.set(CharCommand.CC_AnswerOption, 'CC_AnswerOption');
_CommandNameMap.set(CharCommand.CC_BuildMarker, 'CC_BuildMarker');
_CommandNameMap.set(CharCommand.CC_AmbientSound, 'CC_AmbientSound');
_CommandNameMap.set(CharCommand.CC_AmbientSoundAt, 'CC_AmbientSoundAt');
_CommandNameMap.set(CharCommand.CC_WaitForNoBuilding, 'CC_WaitForNoBuilding');
_CommandNameMap.set(CharCommand.CC_PlayVideo, 'CC_PlayVideo');
_CommandNameMap.set(CharCommand.CC_WaitForPlayerToMove, 'CC_WaitForPlayerToMove');
_CommandNameMap.set(CharCommand.CC_WaitForPlayerToTouchMe, 'CC_WaitForPlayerToTouchMe');
_CommandNameMap.set(CharCommand.CC_SetNPCAppearance, 'CC_SetNPCAppearance');
_CommandNameMap.set(CharCommand.CC_SetWaterTraversal, 'CC_SetWaterTraversal');
_CommandNameMap.set(CharCommand.CC_StartGlobalScript, 'CC_StartGlobalScript');
_CommandNameMap.set(CharCommand.CC_WaitForItem, 'CC_WaitForItem');
_CommandNameMap.set(CharCommand.CC_GenerateEntity, 'CC_GenerateEntity');
_CommandNameMap.set(CharCommand.CC_GameEffect, 'CC_GameEffect');
_CommandNameMap.set(CharCommand.CC_RoomLocationText, 'CC_RoomLocationText');
_CommandNameMap.set(CharCommand.CC_FlashingText, 'CC_FlashingText');
_CommandNameMap.set(CharCommand.CC_DisplayFilter, 'CC_DisplayFilter');
_CommandNameMap.set(CharCommand.CC_Build, 'CC_Build');
_CommandNameMap.set(CharCommand.CC_WorldMapMusic, 'CC_WorldMapMusic');
_CommandNameMap.set(CharCommand.CC_WorldMapIcon, 'CC_WorldMapIcon');
_CommandNameMap.set(CharCommand.CC_WorldMapSelect, 'CC_WorldMapSelect');
_CommandNameMap.set(CharCommand.CC_SetPlayerWeapon, 'CC_SetPlayerWeapon');
_CommandNameMap.set(CharCommand.CC_WaitForSomeoneToPushMe, 'CC_WaitForSomeoneToPushMe');
_CommandNameMap.set(CharCommand.CC_WaitForOpenMove, 'CC_WaitForOpenMove');
_CommandNameMap.set(CharCommand.CC_WaitForCleanLevel, 'CC_WaitForCleanLevel');
_CommandNameMap.set(CharCommand.CC_ChallengeCompleted, 'CC_ChallengeCompleted');
_CommandNameMap.set(CharCommand.CC_AttackTile, 'CC_AttackTile');
_CommandNameMap.set(CharCommand.CC_SetPlayerStealth, 'CC_SetPlayerStealth');
_CommandNameMap.set(CharCommand.CC_WaitForPlayerInput, 'CC_WaitForPlayerInput');
_CommandNameMap.set(CharCommand.CC_Return, 'CC_Return');
_CommandNameMap.set(CharCommand.CC_GoSub, 'CC_GoSub');
_CommandNameMap.set(CharCommand.CC_ImageOverlay, 'CC_ImageOverlay');
_CommandNameMap.set(CharCommand.CC_WorldMapImage, 'CC_WorldMapImage');
_CommandNameMap.set(CharCommand.CC_WaitForEntityType, 'CC_WaitForEntityType');
_CommandNameMap.set(CharCommand.CC_WaitForNotEntityType, 'CC_WaitForNotEntityType');
_CommandNameMap.set(CharCommand.CC_TeleportTo, 'CC_TeleportTo');
_CommandNameMap.set(CharCommand.CC_TeleportPlayerTo, 'CC_TeleportPlayerTo');
_CommandNameMap.set(CharCommand.CC_DestroyTrapdoor, 'CC_DestroyTrapdoor');
_CommandNameMap.set(CharCommand.CC_IfElseIf, 'CC_IfElseIf');
_CommandNameMap.set(CharCommand.CC_FaceTowards, 'CC_FaceTowards');
_CommandNameMap.set(CharCommand.CC_GetNaturalTarget, 'CC_GetNaturalTarget');
_CommandNameMap.set(CharCommand.CC_GetEntityDirection, 'CC_GetEntityDirection');
export const CommandNameMap: ReadonlyMap<number, string> = _CommandNameMap;