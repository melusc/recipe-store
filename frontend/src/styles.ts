const styles: Record<string, string> = {};

export function registerStyle(name: string, style: string) {
	styles[name] = style;
}

export function serveStyle(name: string) {
	if (name.endsWith('.css')) {
		name = name.slice(0, -'.css'.length);
	}

	return styles[name];
}
