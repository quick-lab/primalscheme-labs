import schemes from '$lib/assets/schemes.json';
import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
import { error } from '@sveltejs/kit';

export function load({ url }) {
	const flatSchemes = flattenedSchemeIndex(schemes);

	const scheme = flatSchemes.find((s) => {
		return (
			s.schemename === url.searchParams.get('schemename') &&
			s.ampliconsize === Number.parseInt(url.searchParams.get("ampliconsize")) &&
			s.schemeversion === url.searchParams.get("version")
		);
	});
	if (scheme === undefined) {
		throw error(404, 'Not found');
	}

	return {
		scheme
	};
}
