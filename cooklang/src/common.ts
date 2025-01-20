type FallibleResult = {
	free(): void;
	value: string;
	error: string;
};

type Parser = {
	free(this: Parser): void;
	parse(this: Parser, input: string): FallibleResult;
};

type ParserClass = {
	new (): Parser;
};

export class ParseError extends Error {}

let parser: Parser | undefined;

export function parseStep(step: string, Parser: ParserClass) {
	// Collapse all whitespace to single whitespace
	// Collapse all newlines to ["\", "\n"]
	step = step.replaceAll(/\s+/g, s => (s.includes('\n') ? '\\\n' : ' '));

	parser ??= new Parser();

	const result = parser.parse(step);

	const {error, value} = result;

	if (error.trim()) {
		throw new ParseError(error);
	}

	result.free();

	const parsedResult = JSON.parse(value) as unknown;
	const errorResult = parsedResult as {error?: boolean};
	if ('error' in errorResult && errorResult['error'] === true) {
		throw new ParseError('Unknown error');
	}

	return parsedResult;
}
