export function formatBytes(bytes: number) {
	// KB should be the smallest
	bytes /= 1024;

    const units = ['KB', 'MB', 'GB'];
    let unit = 0;
    while (bytes >= 1024 && unit < units.length - 1) {
        bytes /= 1024;
        unit++;
    }
    return `${bytes.toFixed(3)	} ${units[unit]}`;
}