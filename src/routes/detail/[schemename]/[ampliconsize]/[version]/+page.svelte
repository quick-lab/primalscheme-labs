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
		let infoJson = await response.text();
		console.log(infoJson);
		info = infoJson;
		loadingData = false;
	});
</script>

<html>
	<body>
		<h1>{scheme.schemeName} {scheme.ampliconSize} {scheme.versionNumber}</h1>
		<br />

		{#if loadingData}
			<p>Loading data...</p>
		{:else}
			<p>Info: {info}</p>
			<AmpliconPlot bedfileUrl={scheme.primer_bed_url} />
		{/if}
		<br />
		<br />
		<h2>Scheme details</h2>

		{#each Object.keys(scheme) as key}
			<p><b>{key}</b>: {scheme[key]}</p>
		{/each}
		<!-- <article><p>{@html showDetails(scheme)}</p></article> -->
	</body>
</html>
