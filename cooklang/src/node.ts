import * as common from './common.js';

import {Parser} from '#wasm/node';

export {stringifySection} from './common.js';
export type {CooklangSection} from './schema/index.js';

export function parseSection(step: string) {
	return common.parseSection(step, Parser);
}
