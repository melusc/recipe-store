import {test, expect} from 'vitest';

import {parseStep} from '../src/node.js';

test.for([
	'abc',
	'abc\ndef',
	'abc\n\ndef',
	'abc\r\n\r\ndef',
	'abc \r\n\r\n def',
	'abc \r\n.\r\n def',
])('parseStep(%j)', input => {
	const parsed = parseStep(input) as {sections: Array<{content: unknown[]}>};
	expect(parsed.sections).toHaveLength(1);
	expect(parsed.sections[0]!.content).toHaveLength(1);
	expect(JSON.stringify(parseStep(input))).toMatchSnapshot();
	// @ts-expect-error Didn't type it this deeply
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	expect(parsed.sections[0]!.content[0]!.value.items).toHaveLength(1);
});
