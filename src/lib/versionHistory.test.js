import { describe, expect, it } from 'vitest';
import {
	parseCommits,
	mergeHistory,
	readHistoryCache,
	writeHistoryCache,
	cacheKey,
	fetchFileHistory,
	loadVersionHistory,
	HISTORY_CACHE_TTL
} from './versionHistory.js';

// --- Helpers ---

function makeApiCommit(sha, date, message, author = 'Test Author') {
	return {
		sha,
		commit: {
			author: { date, name: author },
			message
		}
	};
}

function makeParsedCommit(sha, date, message, author = 'Test Author') {
	return { sha, date, message, author };
}

const createStorage = () => {
	const data = new Map();
	return {
		getItem: (key) => (data.has(key) ? data.get(key) : null),
		setItem: (key, value) => data.set(key, value),
		removeItem: (key) => data.delete(key)
	};
};

const createJsonResponse = (payload, ok = true, status = 200) => ({
	ok,
	status,
	json: async () => structuredClone(payload)
});

// --- parseCommits ---

describe('parseCommits', () => {
	it('extracts sha, date, author and first line of message', () => {
		const raw = [
			makeApiCommit('abc123', '2025-01-15T10:00:00Z', 'First line\nSecond line', 'Alice')
		];
		expect(parseCommits(raw)).toEqual([
			{ sha: 'abc123', date: '2025-01-15T10:00:00Z', message: 'First line', author: 'Alice' }
		]);
	});

	it('handles single-line messages', () => {
		const raw = [makeApiCommit('def456', '2025-02-01T12:00:00Z', 'Simple message')];
		expect(parseCommits(raw)).toEqual([
			{
				sha: 'def456',
				date: '2025-02-01T12:00:00Z',
				message: 'Simple message',
				author: 'Test Author'
			}
		]);
	});

	it('returns empty array for empty input', () => {
		expect(parseCommits([])).toEqual([]);
	});
});

// --- mergeHistory ---

describe('mergeHistory', () => {
	const bedOnly = makeParsedCommit('aaa', '2025-03-01T00:00:00Z', 'update bed');
	const infoOnly = makeParsedCommit('bbb', '2025-02-01T00:00:00Z', 'update info');
	const shared = makeParsedCommit('ccc', '2025-01-01T00:00:00Z', 'initial commit');

	it('labels bed-only commits as scheme', () => {
		const result = mergeHistory([bedOnly], []);
		expect(result[0].changes).toBe('scheme');
	});

	it('labels info-only commits as metadata', () => {
		const result = mergeHistory([], [infoOnly]);
		expect(result[0].changes).toBe('metadata');
	});

	it('labels commits in both lists as both', () => {
		const result = mergeHistory([shared], [shared]);
		expect(result[0].changes).toBe('both');
	});

	it('sorts commits newest first', () => {
		const result = mergeHistory([bedOnly, shared], [infoOnly]);
		expect(result.map((c) => c.sha)).toEqual(['aaa', 'bbb', 'ccc']);
	});

	it('marks the oldest commit as added', () => {
		const result = mergeHistory([bedOnly, shared], [infoOnly]);
		expect(result[0].added).toBeUndefined();
		expect(result[1].added).toBeUndefined();
		expect(result[2].added).toBe(true);
	});

	it('marks single commit as added', () => {
		const result = mergeHistory([bedOnly], []);
		expect(result[0].added).toBe(true);
	});

	it('returns empty array for empty inputs', () => {
		expect(mergeHistory([], [])).toEqual([]);
	});

	it('deduplicates commits by sha', () => {
		const result = mergeHistory([shared], [shared]);
		expect(result).toHaveLength(1);
	});
});

// --- Cache ---

describe('readHistoryCache / writeHistoryCache', () => {
	it('round-trips data through storage', () => {
		const storage = createStorage();
		const now = 1700000000000;
		const data = [makeParsedCommit('abc', '2025-01-01T00:00:00Z', 'test')];

		writeHistoryCache(storage, 'test-key', data, now);
		const result = readHistoryCache(storage, 'test-key', now);
		expect(result).toEqual(data);
	});

	it('returns null for missing key', () => {
		const storage = createStorage();
		expect(readHistoryCache(storage, 'missing', Date.now())).toBeNull();
	});

	it('returns null for expired entry', () => {
		const storage = createStorage();
		const now = 1700000000000;
		writeHistoryCache(storage, 'test-key', [{ sha: 'old' }], now);
		expect(readHistoryCache(storage, 'test-key', now + HISTORY_CACHE_TTL + 1)).toBeNull();
	});

	it('returns data within TTL', () => {
		const storage = createStorage();
		const now = 1700000000000;
		writeHistoryCache(storage, 'test-key', [{ sha: 'fresh' }], now);
		const result = readHistoryCache(storage, 'test-key', now + HISTORY_CACHE_TTL - 1);
		expect(result).toEqual([{ sha: 'fresh' }]);
	});

	it('returns null for corrupt storage data', () => {
		const storage = createStorage();
		storage.setItem('test-key', '{bad-json');
		expect(readHistoryCache(storage, 'test-key', Date.now())).toBeNull();
	});

	it('silently handles storage write failure', () => {
		const storage = {
			getItem: () => null,
			setItem: () => {
				throw new Error('quota exceeded');
			}
		};
		expect(() => writeHistoryCache(storage, 'key', [], Date.now())).not.toThrow();
	});
});

describe('cacheKey', () => {
	it('builds a consistent key from scheme identifiers', () => {
		const key = cacheKey('virus-a', 400, 'v1.0.0', 'primer.bed');
		expect(key).toBe('version-history:v1:virus-a/400/v1.0.0/primer.bed');
	});
});

// --- fetchFileHistory ---

describe('fetchFileHistory', () => {
	const apiResponse = [
		makeApiCommit('sha1', '2025-03-01T00:00:00Z', 'commit 1'),
		makeApiCommit('sha2', '2025-02-01T00:00:00Z', 'commit 2')
	];

	it('fetches and parses commits from the API', async () => {
		const storage = createStorage();
		let fetchedUrl = null;

		const result = await fetchFileHistory({
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			file: 'primer.bed',
			storage,
			nowMs: Date.now(),
			fetchImpl: async (url) => {
				fetchedUrl = url;
				return createJsonResponse(apiResponse);
			}
		});

		expect(result).toHaveLength(2);
		expect(result[0].sha).toBe('sha1');
		expect(result[1].sha).toBe('sha2');
		expect(fetchedUrl).toContain('virus-a/400/v1.0.0/primer.bed');
	});

	it('caches the result after fetching', async () => {
		const storage = createStorage();
		const now = 1700000000000;
		let fetchCount = 0;

		const opts = {
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			file: 'primer.bed',
			storage,
			nowMs: now,
			fetchImpl: async () => {
				fetchCount++;
				return createJsonResponse(apiResponse);
			}
		};

		await fetchFileHistory(opts);
		await fetchFileHistory(opts);

		expect(fetchCount).toBe(1);
	});

	it('throws on non-ok response', async () => {
		const storage = createStorage();
		await expect(
			fetchFileHistory({
				schemename: 'virus-a',
				ampliconsize: 400,
				schemeversion: 'v1.0.0',
				file: 'primer.bed',
				storage,
				nowMs: Date.now(),
				fetchImpl: async () => createJsonResponse([], false, 403)
			})
		).rejects.toThrow('GitHub API returned 403');
	});
});

// --- loadVersionHistory ---

describe('loadVersionHistory', () => {
	const bedApiResponse = [
		makeApiCommit('shared', '2025-03-01T00:00:00Z', 'initial add'),
		makeApiCommit('bed-only', '2025-04-01T00:00:00Z', 'update primers')
	];
	const infoApiResponse = [
		makeApiCommit('shared', '2025-03-01T00:00:00Z', 'initial add'),
		makeApiCommit('info-only', '2025-03-15T00:00:00Z', 'update metadata')
	];

	it('merges bed and info histories with correct labels', async () => {
		const storage = createStorage();

		const result = await loadVersionHistory({
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			storage,
			nowMs: Date.now(),
			fetchImpl: async (url) => {
				if (url.includes('primer.bed')) return createJsonResponse(bedApiResponse);
				if (url.includes('info.json')) return createJsonResponse(infoApiResponse);
				throw new Error(`unexpected url: ${url}`);
			}
		});

		expect(result).toHaveLength(3);

		const byChanges = Object.fromEntries(result.map((c) => [c.sha, c.changes]));
		expect(byChanges['bed-only']).toBe('scheme');
		expect(byChanges['info-only']).toBe('metadata');
		expect(byChanges['shared']).toBe('both');
	});

	it('marks the oldest commit as added', async () => {
		const storage = createStorage();

		const result = await loadVersionHistory({
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			storage,
			nowMs: Date.now(),
			fetchImpl: async (url) => {
				if (url.includes('primer.bed')) return createJsonResponse(bedApiResponse);
				if (url.includes('info.json')) return createJsonResponse(infoApiResponse);
				throw new Error(`unexpected url: ${url}`);
			}
		});

		const oldest = result[result.length - 1];
		expect(oldest.sha).toBe('shared');
		expect(oldest.added).toBe(true);
		expect(result[0].added).toBeUndefined();
	});

	it('makes exactly 2 API calls', async () => {
		const storage = createStorage();
		let fetchCount = 0;

		await loadVersionHistory({
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			storage,
			nowMs: Date.now(),
			fetchImpl: async () => {
				fetchCount++;
				return createJsonResponse([]);
			}
		});

		expect(fetchCount).toBe(2);
	});

	it('uses cached data on second call (0 API calls)', async () => {
		const storage = createStorage();
		const now = 1700000000000;
		let fetchCount = 0;

		const opts = {
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: 'v1.0.0',
			storage,
			nowMs: now,
			fetchImpl: async (url) => {
				fetchCount++;
				if (url.includes('primer.bed')) return createJsonResponse(bedApiResponse);
				return createJsonResponse(infoApiResponse);
			}
		};

		await loadVersionHistory(opts);
		expect(fetchCount).toBe(2);

		await loadVersionHistory(opts);
		expect(fetchCount).toBe(2); // No additional calls
	});
});
