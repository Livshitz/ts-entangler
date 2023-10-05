import { libx } from "libx.js/build/bundles/node.essentials";
import { Client } from "../Client";
import { helper } from "../helpers/helper";
import { Module, IModule } from "./Module";
import { fileReflector } from "../FileReflector";

(async () => {
	let client: Client<IModule>;

	const e: "ease-in" | "ease-out" | "ease-in-out" = "ease-in-out";

	const mode: "from-file" | "from-url" = libx.node.args.mode ?? "from-url";
	if (mode == "from-file") {
		const moduleDescriptorJson = fileReflector.getModuleDescriptor('src/tests/Module.ts')
		libx.log.v('module desc: ', moduleDescriptorJson);
		client = new Client<IModule>(moduleDescriptorJson, {
			urlPrefix: 'http://0.0.0.0:59898',
			customRoot: 'mod',
		});
	} else if (mode == "from-url") {
		client = await Client.fromUrl<IModule>('http://0.0.0.0:59898/mod/definition', {
			// urlPrefix: 'http://0.0.0.0:59898',
			// customRoot: 'mod',
		});
	}


	libx.log.v('Testing GET proxy');
	const resGet = await client.ghost.get('1112');
	libx.log.i('GET result: ', resGet);
	libx.log.v('Testing POST proxy');
	const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
	libx.log.i('POST result: ', resPost);
})();

