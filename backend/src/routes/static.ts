import {fileURLToPath} from 'node:url';

import express, {Router} from 'express';

const router = Router();

const cssDirectory = fileURLToPath(import.meta.resolve('frontend/css'));
router.use(
	'/css',
	express.static(cssDirectory, {
		index: false,
		dotfiles: 'ignore',
	}),
);

export {router as staticRouter};
