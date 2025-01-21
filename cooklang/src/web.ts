import * as common from './common.js';

import init, {Parser} from '#wasm/web';

export type {CooklangSection} from './schema/index.js';
export {stringifySection} from './common.js';

await init();

export function parseSection(step: string) {
	return common.parseSection(step, Parser);
}
