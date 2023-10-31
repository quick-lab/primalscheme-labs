<script>
	import schemes from '$lib/assets/schemes.json';
	import Fuse from 'fuse.js';

	const flatSchemes = [];

	for (const schemeName in schemes.primerschemes) {
		const schemeKeyedBySize = schemes.primerschemes[schemeName];
		for (const size in schemeKeyedBySize) {
			const schemeKeyedByVersion = schemes.primerschemes[schemeName][size];
			for (const version in schemeKeyedByVersion) {
				const scheme = schemes.primerschemes[schemeName][size][version];
				flatSchemes.push({
					schemeName: schemeName,
					ampliconSize: size,
					versionNumber: version,
					...scheme
				});
			}
		}
	}

	console.log(flatSchemes);

	const fuseOptions = {
		// isCaseSensitive: false,
		// includeScore: false,
		// shouldSort: true,
		// includeMatches: false,
		// findAllMatches: false,
		// minMatchCharLength: 1,
		// location: 0,
		// threshold: 0.6,
		// distance: 100,
		// useExtendedSearch: false,
		// ignoreLocation: false,
		// ignoreFieldNorm: false,
		// fieldNormWeight: 1,
		keys: ['schemeName', 'ampliconSize', 'versionNumber']
	};

	const fuse = new Fuse(flatSchemes, fuseOptions);

	// Change the pattern
	const searchPattern = 'h';

	const results = fuse.search(searchPattern);
</script>

<input type="text" />

<p>{results}</p>
