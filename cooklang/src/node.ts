import * as common from './common.js';

import {Parser} from '#wasm/node';

export function parseStep(step: string) {
	return common.parseStep(step, Parser);
}
