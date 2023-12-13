<script>
	import { onMount } from 'svelte';
	import AmpliconPlot from './DefaultAmpliconPlot.svelte';
	import AdvancedPlot from './AdvancedPlot.svelte';

	export let data;

	const scheme = data.scheme;

	let loadingData = true;
	let info = undefined;

	let advancedPlotIsLoaded = false;

	function handleAdvLoaded() {
		advancedPlotIsLoaded = true;
	}

	let errorOnFetch = false;
	// Log data to see if working
	onMount(async function () {
		// Load plotly
		let Plotly = (await import('plotly.js-dist-min')).default;

		// Load the info.json
		try {
			const response = await fetch(scheme.info_json_url);
			let infoJson = await response.json();
			info = infoJson;
			loadingData = false;
		} catch (e) {
			console.error(e);
			errorOnFetch = true;
		}
	});
</script>

<h2>{scheme.schemename} {scheme.ampliconsize} {scheme.schemeversion}</h2>

{#if errorOnFetch}
	<dialog open>
		<article>
			<h2>Error</h2>
			<p>There was an error loading the data. Please go back.</p>
		</article>
	</dialog>
{:else if loadingData}
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
		<AmpliconPlot hidden={advancedPlotIsLoaded} bedfileUrl={scheme.primer_bed_url} />

		<AdvancedPlot on:loaded={handleAdvLoaded} bedfileUrl={scheme.primer_bed_url} />
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
		margin-bottom: 0.4em;
	}
	.breadcrumb {
		margin-bottom: 2em;
		border-bottom: 1px solid rgb(115, 130, 140);
	}
</style>
