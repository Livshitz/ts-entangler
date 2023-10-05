import { libx } from "libx.js/build/bundles/node.essentials";
import { Reflector } from "ts-reflector";
import fs from 'fs';

class FileReflector {
	public fromSource(moduleFilePath: string) {
		const reflector = new Reflector(moduleFilePath);
		const moduleDescriptorJson = reflector.generate();
		return moduleDescriptorJson;
	}

	public getModuleDescriptor(filePath: string) {
		let moduleDescriptorJson;
		const tmpFilePath = 'module-reflector.json';
		if (libx.node.args.refresh || !fs.existsSync(`.tmp/${tmpFilePath}`)) {
			libx.log.v('refresh!')
			const reflector = new Reflector(filePath);
			moduleDescriptorJson = reflector.generate();
			libx.node.mkdirRecursiveSync('.tmp');
			libx.node.dump(tmpFilePath, moduleDescriptorJson);
		} else {
			moduleDescriptorJson = libx.node.readJson(`.tmp/${tmpFilePath}`);
		}

		return moduleDescriptorJson;
	}
}

export const fileReflector = new FileReflector();