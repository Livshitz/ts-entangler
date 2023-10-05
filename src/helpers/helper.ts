class Helper {
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