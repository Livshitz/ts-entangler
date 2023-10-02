import { libx } from "libx.js/build/bundles/node.essentials";
// import { Reflector } from "./reflector";
import { Reflector } from "ts-reflector";
import fs from 'fs';

class Helper {
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

	public isPrimitive(value: any) {
		return typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean' ||
			typeof value === 'undefined' ||
			value === null ||
			typeof value === 'symbol';
	}

	public isPrimitiveByTypeName(typeName: string) {
		if (typeName == null) return true;
		return ['string', 'number', 'boolean', 'undefined', 'symbol'].indexOf(typeName) > -1;
	}
}

export const helper = new Helper;