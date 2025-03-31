export class UnauthorisedError extends Error {
	constructor() {
		super('401 Unauthorised.');
	}
}
