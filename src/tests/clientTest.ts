import { libx } from "libx.js/build/bundles/node.essentials";
import { Client } from "../Client";
import { helper } from "../helpers/helper";
import { Module, IModule } from "./Module";

const moduleDescriptorJson = helper.getModuleDescriptor('src/tests/Module.ts')
// libx.log.v('module desc: ', moduleDescriptorJson);

const client = new Client<IModule>(moduleDescriptorJson, {
	urlPrefix: 'http://0.0.0.0:59898',
});

(async () => {
	libx.log.v('Testing GET proxy');
	const resGet = await client.ghost.get('1112');
	libx.log.i('GET result: ', resGet);
	libx.log.v('Testing POST proxy');
	const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
	libx.log.i('POST result: ', resPost);
})();

