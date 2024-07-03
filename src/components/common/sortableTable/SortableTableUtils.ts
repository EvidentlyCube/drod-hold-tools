
export function getPaginationPageNumbers(page: number, total: number) {
	const lastPage = total - 1;
	const items: (number|string)[] = [0];
	if (total <= 1) {
		return items;
	}

	if (page > 3) {
		items.push('ellipsis-1');
	}

	let lookahead = 2;
	let pagesFrom = Math.max(1, page - lookahead);
	let pagesTo = Math.min(lastPage - 1, page + lookahead);

	for (let i = pagesFrom; i <= pagesTo; i++) {
		items.push(i);
	}

	if (pagesTo + 1 < lastPage) {
		items.push('ellipsis-2');
	}

	if (pagesTo < lastPage) {
		items.push(lastPage);
	}

	return items;
}