<script>
	import { onMount } from 'svelte';
	import AmpliconPlot from './DefaultAmpliconPlot.svelte';
	import AdvancedPlot from './AdvancedPlot.svelte';

	export let data;

	const scheme = data.scheme;

	let loadingData = true;
	let info = undefined;

	// Log data to see if working
	onMount(async function () {
		// Load plotly
		let Plotly = (await import('plotly.js-dist-min')).default;

		// Load the info.json
		const response = await fetch(scheme.info_json_url);
		let infoJson = await response.json();
		info = infoJson;
		loadingData = false;

		// Load the default plot

		// Load the advanced plot
	});
</script>

<h2>{scheme.schemename} {scheme.ampliconsize} {scheme.schemeversion}</h2>

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
		margin-bottom: 0.4em;
	}
	.breadcrumb {
		margin-bottom: 2em;
		border-bottom: 1px solid rgb(115, 130, 140);
	}
</style>
