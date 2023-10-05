import { libx } from "libx.js/build/bundles/node.essentials";
import { helper } from "./helpers/helper";
import { network } from "libx.js/build/modules/Network";
import { CustomHandler, GhostProxy } from "./GhostProxy";

export class Client<T = any> {
	public ghost: T;

	public constructor(private jsonDescriptor: any, public options?: Partial<ModuleOptions>) {
		this.options = { ...new ModuleOptions(), ...options };

		this.ghost = GhostProxy.create(this.customHandler.bind(this));
	}

	public static async fromUrl<T = any>(moduleDescriptorUrl: string, options?: Partial<ModuleOptions>) {
		const jsonDescriptor = await network.httpGetJson(moduleDescriptorUrl);
		if (options.urlPrefix == null) {
			const url = new URL(moduleDescriptorUrl);
			const prefix = `${url.protocol}//${url.host}/`;
			options.urlPrefix = prefix;
		}
		if (options.customRoot == null) {
			const match = moduleDescriptorUrl.match(/\/([^/]+)\/definition$/);
			options.customRoot = match[1];
		}
		const ret = new Client<T>(jsonDescriptor, options);
		return ret;
	}

	private async customHandler(path, ...args) {
		try {
			const pointer = this.jsonDescriptor;
			const entry = Object.keys(pointer)[0]?.toLowerCase();
			const root = this?.options?.customRoot ?? entry;

			for (let p of path.split('/')) {
				pointer[p];
			}

			let hasNonPrimitiveValue = false;
			let body = null;
			const params = [];
			for (let arg of args) {
				if (!helper.isPrimitive(arg)) {
					hasNonPrimitiveValue = true;
					body = arg;
					break;
				} else {
					params.push(arg);
				}
			}

			const url = `${this.options.urlPrefix}/${root}/${path}/${params.join('/')}`;
			const httpMethod = !hasNonPrimitiveValue ? 'get' : 'post';
			// libx.log.d(`Client:customHandler: Custom handler called instead of ${path}() with arguments:`, args, httpMethod, url);

			const res = await network.httpRequest(url, body, httpMethod)
			const resStr = res.toString();
			let resObj = null;
			try {
				resObj = JSON.parse(resStr);
			} catch (err) {
				libx.log.w('Client:customHandler: failed to parse object, fallback to string result.', resStr);
			}

			libx.log.d('Client:customHandler: res: ', resObj ?? resStr);

			return resObj ?? resStr;
		} catch (err) {
			libx.log.e('Client:customHandler: ', err);
			throw err;
		}

	}
}

export class ModuleOptions {
	customRoot: string;
	urlPrefix: string;
}
