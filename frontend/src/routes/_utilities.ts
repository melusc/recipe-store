import {readFile} from 'node:fs/promises';

import {$, type SafeString} from '../$.js';
import {header} from '../components/header.js';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const baseHtml = await readFile(
	new URL('../../src/base.html', import.meta.url),
	'utf8',
);

export type Route<Parameters extends readonly unknown[]> = (
	loggedIn: boolean,
	...templateParameters: Parameters
) => SafeString;

export function createRoute<Parameters extends readonly unknown[]>(
	title: string,
	template: (...parameters: Parameters) => SafeString,
): Route<Parameters> {
	return (loggedIn: boolean, ...templateParameters: Parameters) => $`
		${$.trusted(baseHtml)}

		${title ? $`<title>${title} | Recipe Store</title>` : undefined}

		${header(loggedIn)}

		<div id="App" class="m-3">
			${template(...templateParameters)}
		</div>
	`;
}
