export type CustomHandler = (path: string, ...args: any[]) => void;

export class GhostProxy {
	public static create(handler: CustomHandler) {
		const createProxyHandler = (handler: CustomHandler, path?: string) => ({
			get: function (target: any, property: string) {
				const newPath = path ? `${path}.${property}` : property;
				if (!target[property]) {
					target[property] = {};
				}
				return new Proxy(
					(...args: any[]) => {
						if (typeof target[property] === "function") {
							return target[property](...args);
						}
						return handler(newPath, ...args);
					},
					createProxyHandler(handler, newPath)
				);
			},
		});

		return new Proxy({}, createProxyHandler(handler));
	}
}