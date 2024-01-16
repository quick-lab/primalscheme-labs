import schemes from '$lib/assets/schemes.json';
import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const flatSchemes = flattenedSchemeIndex(schemes);

	const scheme = flatSchemes.find((s) => {
		return (
			s.schemeName === params.schemename &&
			s.ampliconSize === params.ampliconsize &&
			s.versionNumber === params.version
		);
	});
	if (scheme === undefined) {
		throw error(404, 'Not found');
	}

	return {
		scheme
	};
}
