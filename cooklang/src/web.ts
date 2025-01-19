import * as common from './common.js';

import init, {Parser} from '#wasm/web';

await init();

export function parseStep(step: string) {
	return common.parseStep(step, Parser);
}
