export const VERSION_AE = 100;
export const VERSION_JTRH = 201;
export const VERSION_TCB_301 = 301;
export const VERSION_TCB_302 = 302;
export const VERSION_TCB_303 = 303;
export const VERSION_TCB_304 = 304;
export const VERSION_GATEB = 400;
export const VERSION_TSS_507 = 507;
export const VERSION_TSS_508 = 508;
export const VERSION_TSS_509 = 509;

export const Constants = {
	isDev: process.env.NODE_ENV === "development",

	yieldFrameDuration: 100,
	yieldSleepDuration: 16,

	xmlReader: {
		// 8 Megabytes per chunk
		xorDecodeChunk: 1024 * 1024 * 8,
		// 4 Megabytes per chunk
		textDecodeChunk: 1024 * 1024 * 4,
	},
};
