import { rename } from "node:fs/promises";

const baseDirectory = new URL('../dist/wasm/', import.meta.url);

const fileRenames = {
	'cooklang_wasm.js': 'cooklang_wasm.cjs',
	'cooklang_wasm.d.ts': 'cooklang_wasm.d.cts',
};

for (const [oldName, newName] of Object.entries(fileRenames)) {
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	await rename(new URL(oldName, baseDirectory), new URL(newName, baseDirectory))
}
