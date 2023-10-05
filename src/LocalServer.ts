import { createServerAdapter } from "@whatwg-node/server";
import { getExpress } from "./helpers/getExpress";
import { error, json, IRequest, Router, withParams, withContent, RouterType, Route, createCors } from 'itty-router';
import { libx } from "libx.js/build/bundles/essentials";
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
	public app: Express;
	private server: HttpServer;

	public constructor(private router: RouterType, public options?: Partial<ModuleOptions>) {
		this.options = { ...new ModuleOptions(), ...options };

		this.app = getExpress().app;
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
}

export class ModuleOptions {
	port = 59898; //8080;
}
