import {ModelType} from "../common/Enums";

export interface Var {
	modelType: ModelType.Var;
	xml: Element;

	name: string;
}