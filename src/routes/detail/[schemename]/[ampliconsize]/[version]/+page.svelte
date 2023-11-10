<script>
	import { onMount } from 'svelte';
	import AmpliconPlot from './AmpliconPlot.svelte';
	export let data;
	const scheme = data.scheme;

	let loadingData = true;
	let info = undefined;

	// Log data to see if working
	onMount(async function () {
		const response = await fetch(scheme.info_json_url);
		let infoJson = await response.json();
		console.log(infoJson);
		info = infoJson;
		loadingData = false;
	});
</script>

<html>
	<body>
		<h1>{scheme.schemename} {scheme.ampliconsize} {scheme.schemeversion}</h1>
		<br />
		{#if loadingData}
			<p>Loading data...</p>
		{:else}
			{#if info.description}
				<details open>
					<summary>Description</summary>
					<p>{info.description}</p>
				</details>
			{/if}
			<h2>Scheme Overview</h2>
			<AmpliconPlot bedfileUrl={scheme.primer_bed_url} />

			<br />

			<details>
				<summary>Downloads</summary>
				<a href={scheme.primer_bed_url} role="button">primer.bed</a>
				<a href={scheme.reference_fasta_url} role="button">reference.fasta</a>
			</details>
			<br />

			<details>
				<summary>Scheme Details</summary>
				{#each Object.keys(info) as key}
					<p><b>{key}</b>: {info[key]}</p>
				{/each}
			</details>
			<h2>Bedfile</h2>
		{/if}
	</body>
</html>
