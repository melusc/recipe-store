import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import {homedir} from 'node:os';

const wasmBin = path.join(homedir(), '.cargo', 'bin', 'wasm-pack');
const cwd = new URL('../', import.meta.url);
const pkgDir = 'pkg';

async function clean() {
	await fs.rm(new URL(pkgDir, cwd), {recursive: true, force: true});
}

async function build(target: string) {
	return new Promise<void>((resolve, reject) => {
		const process = spawn(
			wasmBin,
			['build', '--target', target, '-d', `${pkgDir}/${target}`],
			{
				stdio: 'inherit',
				cwd: cwd,
			},
		);

		process.on('error', reject);
		process.on('close', code => {
			if (code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
}

await clean();
await build('nodejs');
await build('web');
