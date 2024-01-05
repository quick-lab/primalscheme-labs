<script>
	import SearchBar from './SearchBar.svelte';
	import ResultsRow from './ResultsRow.svelte';
	import { goto } from '$app/navigation'
    import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import schemes from '$lib/assets/schemes.json';
	import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
	import Fuse from 'fuse.js';
	import "@picocss/pico";
	import Pagination from './Pagination.svelte';

	// Flatten the scheme
	const flatSchemes = flattenedSchemeIndex(schemes);

	const fuseOptions = {
		isCaseSensitive: false,
		keys: ['schemeName', 'ampliconSize']
	};

	export let data;

	let query = data.query;

	let pageNum = data.pageNum; // set a page number
	
	const fuse = new Fuse(flatSchemes, fuseOptions);
	$: flatSearchResult = query.trim().length ? fuse.search(query)  : flatSchemes.map(
        (item, index) => ({
          item,
          refIndex: index,
          matches: [],
          score: 1,
        }),
      );

	// Pages
	const pageSize = 4;
	$: pageIndex = pageNum -1;
	$: pageCount = Math.ceil(flatSearchResult.length / pageSize);

	$: searchResult = flatSearchResult.slice(
		pageIndex * pageSize,
		pageIndex * pageSize + pageSize,
	);


	let timer;
	const debouncedSubmit = async () => {
		clearTimeout(timer);
		timer = setTimeout(onSubmit, 250);
	}

	$: if (pageNum > pageCount){
		pageNum = pageCount;
	  }
	
	let onSubmit = async () => {
      let navSearchQuery = $page.url.searchParams.get('q') || '';
	  let navPageNum = $page.url.searchParams.get('pageNum') || 1;
	  
      if (query.trim() == navSearchQuery.trim() && pageNum == navPageNum.trim()) // don't navigate if the query is the same
        return
	
      await goto(query.trim().length ? `/?q=${encodeURIComponent(query.trim())}&pageNum=${pageNum}` : `/?pageNum=${pageNum}`, {
        keepFocus: true
      })
    }


</script>

<h1>Schemes</h1>

<h4>Search</h4>
<form on:submit|preventDefault={onSubmit}>
	<input type="text" bind:value={query} on:keyup={debouncedSubmit} />	
</form>



{#if searchResult.length > 0}
<table role='grid'>
		<!-- <tr>
			<th>Scheme name</th>
			<th>Amplicon size</th>
			<th>Version</th>
			<th>Status</th>
		</tr> -->
		<hr>
		{#each searchResult as result}
		<ResultsRow scheme={result.item} query={query} />
		{/each}
	</table>
{:else}
	<p>No results</p>
{/if}
<Pagination pageCount={pageCount} pageNum={pageNum} resultCount={flatSearchResult.length} pageSize={searchResult.length} query={query}/>
	



