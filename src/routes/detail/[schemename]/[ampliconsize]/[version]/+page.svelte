<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getCachedFlatSchemes } from '$lib/catalogCache.js';
	import SchemeDetail from '$lib/components/SchemeDetail.svelte';

	let flatSchemes = undefined;
	let scheme = undefined;
	let schemeLoading = true;
	let schemeNotFound = false;
	let schemesErrored = false;
	let staleCatalogNotice = false;

	// Reactive key derived from route params to force remount on navigation
	$: schemeKey = `${$page.params.schemename}/${$page.params.ampliconsize}/${$page.params.version}`;

	// Re-find the scheme whenever params change
	$: if (flatSchemes) {
		scheme = flatSchemes.find((s) => {
			return (
				s.schemename === $page.params.schemename &&
				s.ampliconsize === Number.parseInt($page.params.ampliconsize) &&
				s.schemeversion === $page.params.version
			);
		});
		schemeNotFound = scheme === undefined;
	}

	onMount(async function () {
		try {
			const schemesResult = await getCachedFlatSchemes();
			flatSchemes = schemesResult.data;
			staleCatalogNotice = schemesResult.meta.isStale;
		} catch (err) {
			console.log(err);
			schemesErrored = true;
		} finally {
			schemeLoading = false;
		}
	});
</script>

{#if schemeLoading}
	<p aria-busy="true">Loading data...</p>
{:else if schemeNotFound}
	<dialog open>
		<article>
			<header>Not found</header>
			<p>Scheme was not found in the index.</p>
		</article>
	</dialog>
{:else if schemesErrored}
	<dialog open>
		<article>
			<header>Error</header>
			<p>Unable to load scheme data.</p>
		</article>
	</dialog>
{:else if scheme}
	{#if staleCatalogNotice}
		<p class="cache-warning">Using cached catalog data; upstream refresh failed. Data may be up to 2+ minutes old.</p>
	{/if}

	{#key schemeKey}
		<SchemeDetail
			schemename={scheme.schemename}
			ampliconsize={scheme.ampliconsize}
			schemeversion={scheme.schemeversion}
			status={scheme.status}
			infoJsonUrl={scheme.info_json_url}
			primerBedUrl={scheme.primer_bed_url}
			referenceFastaUrl={scheme.reference_fasta_url}
		/>
	{/key}
{/if}

<style>
	.cache-warning {
		margin-bottom: 1rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid #d9b34b;
		border-radius: 4px;
		background: #fff8e1;
		color: #5f4a12;
	}
</style>
