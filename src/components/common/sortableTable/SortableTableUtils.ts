export const PAGINATION_ELLIPSIS_BUTTON = -1;

export function getPaginationPageNumbers(
	page: number,
	total: number,
): number[] {
	const lastPage = total - 1;
	const items: number[] = [0];
	if (total <= 1) {
		return items;
	}

	if (page > 3) {
		items.push(PAGINATION_ELLIPSIS_BUTTON);
	}

	const lookahead = 2;
	const pagesFrom = Math.max(1, page - lookahead);
	const pagesTo = Math.min(lastPage - 1, page + lookahead);

	for (let i = pagesFrom; i <= pagesTo; i++) {
		items.push(i);
	}

	if (pagesTo + 1 < lastPage) {
		items.push(PAGINATION_ELLIPSIS_BUTTON);
	}

	if (pagesTo < lastPage) {
		items.push(lastPage);
	}

	return items;
}
