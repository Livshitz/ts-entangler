import { error, json, IRequest, Router, withParams, withContent, RouterType, Route, createCors } from 'itty-router';
// import { Module } from "./tests/Module";
import { helper } from "./helpers/helper";

type RequestParams = {
	request: IRequest,
	moduleName: string,
	method: string,
	path: string,
	params: string[],
	httpMethod: 'get' | 'post',
}

// console.log('test: ', libx.node.args.input);

export class ModuleRouter<T> {
	public router: RouterType;

	public constructor(private moduleInstance: T, private jsonService: Object, public options?: Partial<ModuleOptions>) {
		this.options = { ...new ModuleOptions(), ...options };
		this.router = Router({ base: this.options?.baseUrl });

		this.jsonToService(this.jsonService);

		// this.router.get('/imodule/dosomething', (request, env, ctx) => {
		// 	return 'Success! 7';
		// })
		// this.router.get('/imodule', (request, env, ctx) => {
		// 	return 'Success! 8';
		// })
	}

	public static createRouter<T>(moduleInstance: T, jsonService: Object, options?: Partial<ModuleOptions>) {
		const ret = new ModuleRouter(moduleInstance, jsonService, options);
		return ret.router;

	}

	private async requestHandler({ request, moduleName, path, method, params, httpMethod }: RequestParams) {
		console.log('Server:requestHandler: ', moduleName, path, method, {
			body: request.content,
			// headers: request.headers,
			method: request.method
		})
		const m = this.moduleInstance;

		const p = {};
		const pArr = [];
		for (let param of params) {
			const pName = param.replace(/[\:\?]/gi, '');
			p[pName] = request.params[pName]
			pArr.push(p[pName]);
		}

		if (httpMethod == "post") pArr.push(request.content);

		const ret = await m[method].apply(m, pArr);
		return ret;
	}

	private jsonToService(jsonServiceDefinition: Object) {
		const moduleName = Object.keys(jsonServiceDefinition)[0];
		const root = this?.options?.customRoot ?? moduleName;

		const methods = jsonServiceDefinition[moduleName];

		let createdEndpoints = [];
		for (let method in methods) {
			const m = methods[method];
			if (m.kind != 'method') continue;

			let params = [];
			let hasNonPrimitive = false;
			for (let [k, x] of Object.entries<any>(m.parameters)) {
				if (x.isPrimitive == false) {
					hasNonPrimitive = true;
					break;
				}
				const p = `:${k}${x.isOptional ? '?' : ''}`;
				params.push(p);
			}

			const httpMethod = !hasNonPrimitive ? 'get' : 'post';
			let path = `/${root.toLowerCase()}/${method.toLowerCase()}/${params.join('/')}`;
			if (path.endsWith('/')) path = path.slice(0, -1);
			const handler = (request) => this.requestHandler({ request, moduleName, method, path, params, httpMethod });
			if (httpMethod == "post")
				this.router[httpMethod](path, withContent, handler);
			else
				this.router[httpMethod](path, handler);

			createdEndpoints.push(`[${httpMethod}] ${this.options.baseUrl}${path}`);
			// libx.log.d(`jsonToService: [${httpMethod}] ${path}`, method, m);
		}

		if (this.options.serveDefinition) {
			const defPath = `/${root.toLowerCase()}/definition`;
			this.router.all(defPath, (request, env, ctx) => {
				return json(jsonServiceDefinition);
			});
			createdEndpoints.push(`[GET] ${defPath}`);
		}

		console.log('Server:jsonToService: Established those endpoints: ', JSON.stringify(createdEndpoints));
	}

	public fetch = (request, env, ctx) => {
		return this.router.handle(request, env, ctx).then(json).catch(error);
	}
}

export class ModuleOptions {
	customRoot: string;
	baseUrl = '';
	serveDefinition = true;
}
