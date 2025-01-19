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

class ParseError extends Error {}

export function parseStep(step: string, Parser: ParserClass) {
	step = step.replaceAll(/\s+/g, ' ');

	console.log(JSON.stringify(step));

	const parser = new Parser();

	const result = parser.parse(step);

	const {error, value} = result;
	console.error(error);
	if (error.trim()) {
		throw new ParseError(error);
	}
	result.free();
	parser.free();

	const parsedResult = JSON.parse(value) as unknown;
	const errorResult = parsedResult as {error?: boolean};
	if ('error' in errorResult && errorResult['error'] === true) {
		throw new ParseError('Unknown error');
	}

	return parsedResult;
}
