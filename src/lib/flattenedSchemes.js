export const flattenedSchemeIndex = (schemeIndex) => {
	const flatSchemes = [];

	for (const schemeName in schemeIndex.primerschemes) {
		const schemeKeyedBySize = schemeIndex.primerschemes[schemeName];
		for (const size in schemeKeyedBySize) {
			const schemeKeyedByVersion = schemeIndex.primerschemes[schemeName][size];
			for (const version in schemeKeyedByVersion) {
				const scheme = schemeIndex.primerschemes[schemeName][size][version];
				scheme.aliases = [];
				flatSchemes.push({
					...scheme
				});
			}
		}
	}
	return flatSchemes;
};
