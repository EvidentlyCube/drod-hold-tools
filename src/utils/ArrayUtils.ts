export function range(from: number, to: number, step: number = 1) {
	const len = Math.floor((to - from) / step) + 1
	return Array(len).fill(0).map((_, idx) => from + (idx * step))
}