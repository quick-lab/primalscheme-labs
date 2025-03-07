<script>
	import ResultsRow from './ResultsRow.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
	import { base } from '$app/paths';

	import Fuse from 'fuse.js';

	import Pagination from './Pagination.svelte';

	// Initial state
	let flatSchemes = undefined;
	let aliases = undefined;

	let schemesLoading = true;
	let schemesErrored = false;
	let query = '';
	let fuse = undefined;

	const fuseOptions = {
		isCaseSensitive: false,
		keys: ['schemename', 'authors', 'description', 'aliases'],
		ignoreLocation: true,
		threshold: 0.3
	};

	// Disable enter key, as the refresh wipes the URL query
	window.addEventListener(
		'keydown',
		function (e) {
			if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
				if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
					e.preventDefault();

					return false;
				}
			}
		},
		true
	);

	// Set the filter checkbox values
	let defaultShowStatus = {
		withdrawn: false,
		deprecated: false,
		draft: true,
		autogenerated: true,
		tested: true,
		validated: true
	};

	// Handle the URL
	$: uriSearchParams = $page.url.searchParams;

	// filter function
	const filterFunction = (scheme, statusObj, collectionObj) => {
		// Filter by status
		if (!statusObj[scheme.status]) return false;

		// Filter by collection
		if (
			Object.entries(collectionObj).some(
				([collection, value]) => value && !scheme.collections.includes(collection)
			)
		)
			return false;
		return true;
	};

	onMount(async function () {
		query = $page.url.searchParams.get('q') || '';
		pageNum = $page.url.searchParams.get('pageNum') || 1;

		// Load schemes
		try {
			// get the index
			const response = await fetch(
				'https://raw.githubusercontent.com/quick-lab/primerschemes/main/index.json'
			);
			const schemes = await response.json();
			flatSchemes = flattenedSchemeIndex(schemes);
			// get the aliases
			const aliasesResponse = await fetch(
				'https://raw.githubusercontent.com/quick-lab/primerschemes/main/aliases.json'
			);
			aliases = await aliasesResponse.json();

			// Parse the aliases
			for (const [alias, schemename] of Object.entries(aliases)) {
				flatSchemes.filter((s) => s.schemename === schemename).map((s) => s.aliases.push(alias));
			}
			schemesLoading = false;
		} catch (err) {
			console.log(err);
			schemesErrored = true;
		}

		fuse = new Fuse(flatSchemes, fuseOptions);

		// Get the collection names
		{
			let _a = [
				...new Set(
					flatSchemes?.reduce((acc, scheme) => {
						acc.push(...scheme?.collections);
						return acc;
					}, [])
				)
			].sort();
			_a.forEach((collection) => {
				if (collections[collection] === undefined) {
					collections[collection] = false;
				}
			});
		}

		// Parse the URL
		for (let [key, value] of $page.url.searchParams.entries()) {
			// Set the filter checkbox values
			if (defaultShowStatus.hasOwnProperty(key)) {
				showStatus[key] = value === 'true';
			}
			// Set the collection checkbox values
			if (collections.hasOwnProperty(key)) {
				collections[key] = value === 'true';
			}
		}
	});

	$: flatSearchResult = query.trim().length
		? fuse?.search(query)
		: flatSchemes?.map((item, index) => ({
				item,
				refIndex: index,
				matches: [],
				score: 1
		  }));

	// Get the collection names
	let collections = {};

	// Pages
	const pageSize = 25;
	$: pageIndex = pageNum - 1;
	$: pageCount = Math.ceil(filteredFlatSearchResult?.length / pageSize);
	$: pageNum = uriSearchParams.get('pageNum') || 1;

	// Filter the search results
	$: filteredFlatSearchResult = flatSearchResult?.filter((item) => {
		return filterFunction(item.item, showStatus, collections);
	});

	$: searchResult = filteredFlatSearchResult?.slice(
		pageIndex * pageSize,
		pageIndex * pageSize + pageSize
	);

	let timer;
	const debouncedSubmit = async () => {
		clearTimeout(timer);
		timer = setTimeout(updateURLQuery, 250);
	};

	$: if (pageNum > pageCount) {
		pageNum = Math.max(pageCount, 1);
	}

	// Only encode changes into the URL
	let showStatus = { ...defaultShowStatus };

	let updateURLStatus = async () => {
		let uriSearchParams = new URLSearchParams($page.url.searchParams.toString());
		for (let [key, value] of Object.entries(showStatus)) {
			if (defaultShowStatus[key] != value) {
				uriSearchParams.set(encodeURIComponent(key), encodeURIComponent(value));
			} else {
				uriSearchParams.delete(encodeURIComponent(key));
			}
		}
		await goto(`${base}/?${uriSearchParams.toString()}`, {
			keepFocus: true
		});
	};

	let updateURLCollections = async () => {
		let uriSearchParams = new URLSearchParams($page.url.searchParams.toString());
		for (let [key, value] of Object.entries(collections)) {
			if (value) {
				uriSearchParams.set(encodeURIComponent(key), encodeURIComponent(value));
			} else {
				uriSearchParams.delete(encodeURIComponent(key));
			}
		}
		await goto(`${base}/?${uriSearchParams.toString()}`, {
			keepFocus: true
		});
	};

	let updateURLQuery = async () => {
		let uriSearchParams = new URLSearchParams($page.url.searchParams.toString());
		uriSearchParams.set('q', encodeURIComponent(query.trim()));
		await goto(`${base}/?${uriSearchParams.toString()}`, {
			keepFocus: true
		});
	};
</script>

{#if schemesLoading}
	<p aria-busy="true">Loading data...</p>
{:else if schemesErrored}
	<p>Unable to load schemes data...</p>
{:else}
	<form id="search form" on:submit={updateURLQuery}>
		<input type="text" placeholder="Search..." bind:value={query} on:keyup={debouncedSubmit} />

		<details open>
			<summary><h5>Advanced Search</h5></summary>
			<fieldset>
				<div class="grid">
					<!-- Status filter -->
					<div>
						<legend><h6>Status</h6></legend>
						{#each Object.entries(showStatus) as [status, value]}
							<label>
								<input
									type="checkbox"
									role="switch"
									bind:checked={showStatus[status]}
									on:change={updateURLStatus}
									aria-invalid="false"
								/>
								Show {status}
							</label>
						{/each}
					</div>
					<!-- Collection filter -->
					<div>
						<legend><h6>Collection</h6></legend>
						<div>
							{#each Object.entries(collections) as [collection, value]}
								{#if value}
									<button
										class="collectionbutton"
										type="button"
										on:click={() => {
											collections[collection] = !collections[collection];
											updateURLCollections();
										}}>{collection}</button
									>
								{:else}
									<button
										class="collectionbutton outline"
										type="button"
										on:click={() => {
											collections[collection] = !collections[collection];
											updateURLCollections();
										}}>{collection}</button
									>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			</fieldset>
		</details>
	</form>

	<hr />

	{#if searchResult.length > 0}
		<table>
			<tbody>
				{#each searchResult as result}
					<ResultsRow scheme={result.item} {query} />
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No results</p>
	{/if}
	<Pagination
		{pageCount}
		{pageNum}
		resultCount={filteredFlatSearchResult.length}
		pageSize={searchResult.length}
	/>
{/if}

<style>
	form {
		margin-bottom: 2rem;
	}
	button.collectionbutton {
		margin: 0.2em;
	}
	button.collectionbutton.outline:hover {
		box-shadow: 0px 0px 1px 1px var(--pico-primary);
	}
	button.collectionbutton:hover {
		box-shadow: 0px 0px 1px 1px var(--pico-secondary-hover-background);
	}

	details {
		color: var(--pico-primary);
	}
	label:hover {
		color: var(--pico-secondary);
	}
</style>
