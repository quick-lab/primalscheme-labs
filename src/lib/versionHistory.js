import { GITHUB_API_URL, PRIMER_CLASS } from '$lib/config.js';

const CACHE_PREFIX = 'version-history:v1:';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Parse raw GitHub API commit objects into a flat format.
 */
export function parseCommits(json) {
	return json.map((c) => ({
		sha: c.sha,
		date: c.commit.author.date,
		message: c.commit.message.split('\n')[0],
		author: c.commit.author.name
	}));
}

/**
 * Merge two commit lists (scheme files and metadata) into a single
 * sorted list with a `changes` field indicating what was modified,
 * and an `added` flag on the earliest commit.
 */
export function mergeHistory(bedCommits, infoCommits) {
	const infoShas = new Set(infoCommits.map((c) => c.sha));

	const allCommits = new Map();
	for (const c of bedCommits) {
		allCommits.set(c.sha, { ...c, changes: infoShas.has(c.sha) ? 'both' : 'scheme' });
	}
	for (const c of infoCommits) {
		if (!allCommits.has(c.sha)) {
			allCommits.set(c.sha, { ...c, changes: 'metadata' });
		}
	}

	const sorted = [...allCommits.values()].sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	);
	if (sorted.length > 0) {
		sorted[sorted.length - 1].added = true;
	}
	return sorted;
}

/**
 * Read a cached version history entry from storage.
 * Returns null if missing, expired, or corrupt.
 */
export function readHistoryCache(storage, key, nowMs = Date.now()) {
	try {
		const raw = storage.getItem(key);
		if (!raw) return null;
		const entry = JSON.parse(raw);
		if (nowMs - entry.fetchedAt > CACHE_TTL) return null;
		return entry.data;
	} catch {
		return null;
	}
}

/**
 * Write a version history entry to storage.
 */
export function writeHistoryCache(storage, key, data, nowMs = Date.now()) {
	try {
		storage.setItem(key, JSON.stringify({ data, fetchedAt: nowMs }));
	} catch {
		// Ignore quota errors
	}
}

/**
 * Build the cache key for a given scheme file.
 */
export function cacheKey(schemename, ampliconsize, schemeversion, file) {
	return `${CACHE_PREFIX}${schemename}/${ampliconsize}/${schemeversion}/${file}`;
}

/**
 * Fetch commit history for a single file, using cache if available.
 */
export async function fetchFileHistory({
	schemename,
	ampliconsize,
	schemeversion,
	file,
	storage = globalThis.sessionStorage,
	fetchImpl = globalThis.fetch,
	nowMs = Date.now()
}) {
	const key = cacheKey(schemename, ampliconsize, schemeversion, file);
	const cached = readHistoryCache(storage, key, nowMs);
	if (cached) return cached;

	const res = await fetchImpl(
		`${GITHUB_API_URL}/commits?path=${PRIMER_CLASS}/${schemename}/${ampliconsize}/${schemeversion}/${file}&per_page=50`
	);
	if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
	const commits = parseCommits(await res.json());
	writeHistoryCache(storage, key, commits, nowMs);
	return commits;
}

/**
 * Load full version history for a scheme (bed + info), merged and cached.
 */
export async function loadVersionHistory({
	schemename,
	ampliconsize,
	schemeversion,
	storage = globalThis.sessionStorage,
	fetchImpl = globalThis.fetch,
	nowMs = Date.now()
}) {
	const opts = { schemename, ampliconsize, schemeversion, storage, fetchImpl, nowMs };
	const [bedCommits, infoCommits] = await Promise.all([
		fetchFileHistory({ ...opts, file: 'primer.bed' }),
		fetchFileHistory({ ...opts, file: 'info.json' })
	]);
	return mergeHistory(bedCommits, infoCommits);
}

export const HISTORY_CACHE_TTL = CACHE_TTL;
