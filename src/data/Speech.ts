export interface Speech {
	id: number;
	xml: Element;
	text: string;

	linked?: string;
	isDeleted?: true;
}