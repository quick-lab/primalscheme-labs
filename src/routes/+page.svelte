<script>
	import SearchBar from './SearchBar.svelte';
	import ResultsRow from './ResultsRow.svelte';
	import schemes from '$lib/assets/schemes.json';
	import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
	import Fuse from 'fuse.js';
	import "@picocss/pico";

	// Flatten the scheme
	const flatSchemes = flattenedSchemeIndex(schemes);
	console.log(flatSchemes);

	const fuseOptions = {
		isCaseSensitive: false,
		keys: ['schemeName', 'ampliconSize']
	};

	const fuse = new Fuse(flatSchemes, fuseOptions);

	let query = '';
	$: searchResult = fuse.search(query);
</script>

<h1>Schemes</h1>

<h4>Search</h4>
<SearchBar bind:query />

{#if searchResult.length > 0}
	<table role='grid'>
		<tr>
			<th>Scheme name</th>
			<th>Amplicon size</th>
			<th>Version</th>
			<th>Status</th>
		</tr>
		{#each searchResult as result}
		<ResultsRow scheme={result.item} />
		{/each}
	</table>
{:else}
	<p>No results</p>
{/if}




