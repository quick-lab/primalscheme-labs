import { describe, expect, it } from 'vitest';
import { flattenedSchemeIndex } from './flattenedSchemes.js';

describe('flattenedSchemeIndex', () => {
	it('flattens nested scheme index into one array item per scheme version', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'1.0.0': {
							schemename: 'virus-a',
							ampliconsize: 400,
							schemeversion: '1.0.0',
							status: 'validated'
						},
						'2.0.0': {
							schemename: 'virus-a',
							ampliconsize: 400,
							schemeversion: '2.0.0',
							status: 'draft'
						}
					}
				},
				'virus-b': {
					500: {
						'1.0.0': {
							schemename: 'virus-b',
							ampliconsize: 500,
							schemeversion: '1.0.0',
							status: 'deprecated'
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened).toHaveLength(3);
		expect(flattened.map((scheme) => scheme.schemename)).toEqual(['virus-a', 'virus-a', 'virus-b']);
		expect(flattened.map((scheme) => scheme.schemeversion)).toEqual(['1.0.0', '2.0.0', '1.0.0']);
	});

	it('initializes aliases to an empty array per flattened entry', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'1.0.0': {
							schemename: 'virus-a',
							ampliconsize: 400,
							schemeversion: '1.0.0',
							status: 'validated'
						}
					}
				},
				'virus-b': {
					500: {
						'1.0.0': {
							schemename: 'virus-b',
							ampliconsize: 500,
							schemeversion: '1.0.0',
							status: 'deprecated'
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened[0].aliases).toEqual([]);
		expect(flattened[1].aliases).toEqual([]);
		expect(flattened[0].aliases).not.toBe(flattened[1].aliases);
	});

	it('returns an empty array when no schemes are present', () => {
		const flattened = flattenedSchemeIndex({ primerschemes: {} });
		expect(flattened).toEqual([]);
	});
});
