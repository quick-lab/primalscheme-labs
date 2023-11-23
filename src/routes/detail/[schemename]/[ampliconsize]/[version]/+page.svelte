<script>
	import { onMount } from 'svelte';
	import AmpliconPlot from './DefaultAmpliconPlot.svelte';
	import AdvancedPlot from './AdvancedPlot.svelte';
	import { page } from '$app/stores';

	export let data;

	const scheme = data.scheme;
	let query = $page.url.searchParams.get('query') || '';

	let loadingData = true;
	let info = undefined;

	let searchUrl = `/?query=${query}`;

	// Log data to see if working
	onMount(async function () {
		const response = await fetch(scheme.info_json_url);
		let infoJson = await response.json();
		info = infoJson;
		loadingData = false;
	});
</script>

<h2>{scheme.schemename} {scheme.ampliconsize} {scheme.schemeversion}</h2>
<nav class="breadcrumb" aria-label="breadcrumb">
	<ul>
		<li><a href={searchUrl}>Search Results</a></li>
		<li>{scheme.schemename} {scheme.ampliconsize} {scheme.schemeversion}</li>
	</ul>
</nav>

{#if loadingData}
	<p>Loading data...</p>
{:else}
	{#if info.description}
		<details open>
			<summary>Description</summary>
			<p>{info.description}</p>
		</details>
	{/if}
	<details open>
		<summary>Scheme Overview</summary>
		<AmpliconPlot bedfileUrl={scheme.primer_bed_url} />
		<AdvancedPlot bedfileUrl={scheme.primer_bed_url} />
	</details>

	<details>
		<summary>Downloads</summary>
		<a href={scheme.primer_bed_url} role="button">primer.bed</a>
		<a href={scheme.reference_fasta_url} role="button">reference.fasta</a>
	</details>

	<details>
		<summary>Scheme Details</summary>
		{#each Object.keys(info) as key}
			<p><b>{key}</b>: {info[key]}</p>
		{/each}
	</details>
	<h2>Bedfile</h2>
{/if}

<style>
	h2 {
		margin-bottom: 0.2em;
	}
	.breadcrumb {
		margin-bottom: 2em;
		border-bottom: 1px solid rgb(115, 130, 140);
	}
</style>
