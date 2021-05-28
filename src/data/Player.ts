
export interface Player {
	xml: Element;
	name: string;
}

export function createNullPlayer(): Player {
	return {
		name: '',
		xml: document.createElement('Players')
	}
}