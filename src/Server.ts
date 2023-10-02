import { createServerAdapter } from "@whatwg-node/server";
import { getExpress } from "./helpers/getExpress";
import { error, json, IRequest, Router, withParams, withContent, RouterType, Route, createCors } from 'itty-router';
import { Module } from "./tests/Module";
import { libx } from "libx.js/build/bundles/node.essentials";
import { Reflector } from "ts-reflector";
import { helper } from "./helpers/helper";
import { Express } from "express";
import { Server as HttpServer } from "http";

type RequestParams = {
	request: IRequest,
	moduleName: string,
	method: string,
	path: string,
	params: string[],
	httpMethod: 'get' | 'post',
}

// console.log('test: ', libx.node.args.input);

export class Server {
	public router = Router();
	public app: Express;
	private server: HttpServer;

	public constructor(private jsonService: string, public options?: Partial<ModuleOptions>) {
		this.options = { ...new ModuleOptions(), ...options };

		this.app = getExpress().app;
		this.jsonToService(this.jsonService);
	}

	public async serve() {
		this.app.use(
			'/',
			createServerAdapter((request) => this.router.handle(request, {}).then(json).catch(error))
		);

		const port = this.options.port;
		try {
			this.server = this.app.listen(port, () => {
				libx.log.v(`Server listening on http://0.0.0.0:${port}`);
			});
		} catch (err) {
			libx.log.e(`LOCAL: Failed to start local server on port: ${port}`);
		}
	}

	public async close() {
		return this.server?.close();
	}

	private async requestHandler({ request, moduleName, path, method, params, httpMethod }: RequestParams) {
		libx.log.v('Server:requestHandler: ', moduleName, path, method, {
			body: request.content,
			// headers: request.headers,
			method: request.method
		})
		const m = new Module(1);

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

	private jsonToService(jsonServiceDefinition: string) {
		const moduleName = Object.keys(jsonServiceDefinition)[0];

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
			let path = `/${moduleName.toLowerCase()}/${method.toLowerCase()}/${params.join('/')}`;
			if (path.endsWith('/')) path = path.slice(0, -1);
			const handler = (request) => this.requestHandler({ request, moduleName, method, path, params, httpMethod });
			if (httpMethod == "post")
				this.router[httpMethod](path, withContent, handler);
			else
				this.router[httpMethod](path, handler);

			createdEndpoints.push(`[${httpMethod}] ${path}`);
			// libx.log.d(`jsonToService: [${httpMethod}] ${path}`, method, m);
		}

		libx.log.i('Server:jsonToService: Established those endpoints: ', createdEndpoints);
	}
}

export class ModuleOptions {
	port = 59898; //8080;
}
