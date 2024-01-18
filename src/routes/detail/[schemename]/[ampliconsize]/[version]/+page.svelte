<script>
	import 'giscus';
	import { onMount } from 'svelte';
	import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';
	import { error } from '@sveltejs/kit';
	import { page } from '$app/stores';

	import AmpliconPlot from './DefaultAmpliconPlot.svelte';
	import AdvancedPlot from './AdvancedPlot.svelte';
	import schemes from '$lib/assets/schemes.json';

	let scheme = undefined;
	let schemeIsLoading = true;

	let advancedPlotIsLoaded = false;

	function handleAdvLoaded() {
		advancedPlotIsLoaded = true;
	}

	async function handleReferenceClick() {
		referenceNotClicked = false;
		referenceLoading = true;

		// Load the reference
		try {
			let referenceResponce = await fetch(scheme.reference_fasta_url);
			referenceData = await referenceResponce.text();
			referenceLoading = false;
			referenceError = false;
		} catch (e) {
			console.error(e);
			referenceLoading = false;
			referenceError = true;
		}
	}

	// Info.json state
	let loadingInfoJson = true;
	let infoJsonError = false;
	let info = undefined;

	// Bedfile state
	let bedFileError = false;
	let loadingBedfile = true;
	let bedfile = undefined;

	// Reference state
	let referenceNotClicked = true;
	let referenceLoading = false;
	let referenceError = false;
	let referenceData;

	onMount(async function () {
		console.log($page.params);
		const flatSchemes = flattenedSchemeIndex(schemes);
		scheme = flatSchemes.find((s) => {
			return (
				s.schemename === $page.params.schemename &&
				s.ampliconsize === Number.parseInt($page.params.ampliconsize) &&
				s.schemeversion === $page.params.version
			);
		});
		if (scheme === undefined) {
			error(404, 'Not found');
		}
		// Load plotly
		let Plotly = (await import('plotly.js-dist-min')).default;

		// Load the info.json
		try {
			const response = await fetch(scheme.info_json_url);
			let infoJson = await response.json();
			info = infoJson;
			loadingInfoJson = false;
		} catch (e) {
			console.error(e);
			infoJsonError = true;
		}

		// Load the primer.bed
		try {
			let bedfileResponce = await fetch(scheme.primer_bed_url);
			bedfile = await bedfileResponce.text().then((text) =>
				text
					.trim()
					.split('\n')
					.map((bedline) => bedline.split('\t'))
			);

			loadingBedfile = false;
		} catch (e) {
			console.error(e);
			bedFileError = true;
		}
		schemeIsLoading = false;
	});
</script>

{#if schemeIsLoading}
	<p aria-busy="true">Loading data...</p>
{:else}
	<nav>
		<ul><h2>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</h2></ul>
		<ul><span class="pill {scheme.status}"><strong>{scheme.status}</strong></span></ul>
	</nav>

	{#if infoJsonError}
		<dialog open>
			<article>
				<h2>Error</h2>
				<p>There was an error loading the data. Please go back.</p>
			</article>
		</dialog>
	{:else if loadingInfoJson}
		<p aria-busy="true">Loading data...</p>
	{:else}
		{#if info.description}
			<p>{info.description}</p>
		{/if}

		<article>
			<header>Scheme Overview</header>
			<AmpliconPlot hidden={advancedPlotIsLoaded} bedfileUrl={scheme.primer_bed_url} />
			<AdvancedPlot on:loaded={handleAdvLoaded} bedfileUrl={scheme.primer_bed_url} />
		</article>
	{/if}

	<h2>Scheme Details</h2>
	{#if loadingInfoJson}
		<p aria-busy="true">Loading data...</p>
	{:else if infoJsonError}
		<p>Error loading data</p>
	{:else}
		<article>
			<header>
				<nav>
					<li><strong>info?.json</strong></li>
					<li><a href={scheme.info_json_url}>download</a></li>
				</nav>
			</header>
			<table>
				{#each Object.keys(info) as key}
					<tr>
						<td><b>{key}:</b></td>
						<td> {info[key]}</td>
					</tr>
				{/each}
			</table>
		</article>
	{/if}

	<h2>Bedfile</h2>
	{#if bedFileError}
		<p>Error loading bedfile</p>
	{:else if loadingBedfile}
		<p aria-busy="true">Loading bedfile...</p>
	{:else}
		<article>
			<header>
				<nav>
					<li><strong>primer.bed</strong></li>
					<li><a href={scheme.primer_bed_url}>download</a></li>
				</nav>
			</header>
			<!-- Write the bed file Header -->
			{#each bedfile as bedline}
				{#if bedline[0].startsWith('#')}
					<pre>{bedline}</pre>
				{/if}
			{/each}

			<table>
				<!-- Write the bed file -->
				{#each bedfile as bedline}
					{#if !bedline[0].startsWith('#')}
						<tr>
							{#each bedline as column}
								<td>{column}</td>
							{/each}
						</tr>
					{/if}
				{/each}
			</table>
		</article>
	{/if}

	<h2>Reference</h2>
	{#if loadingInfoJson}
		<p aria-busy="true">Loading data...</p>
	{:else if infoJsonError}
		<p>Error loading data</p>
	{:else}
		<article>
			<header>
				<nav>
					<li><strong>reference.fasta</strong></li>
					<li><a href={scheme.reference_fasta_url}>download</a></li>
				</nav>
			</header>
			{#if referenceNotClicked}
				<p>Click the button below to load the reference.</p>
				<a on:click={handleReferenceClick}>Load reference</a>
			{:else if referenceLoading}
				<p aria-busy="true">Loading reference...</p>
			{:else if referenceError}
				<p>Error loading reference</p>
			{:else}
				<pre>{referenceData}</pre>
			{/if}
		</article>
	{/if}

	<giscus-widget
		id="comments"
		repo="quick-lab/primerschemes"
		repoid="R_kgDOKTGGTw"
		category="Announcements"
		categoryid="DIC_kwDOKTGGT84CcWWD"
		reactionsenabled="1"
		emitmetadata="0"
		inputposition="top"
		theme="light"
		lang="en"
		loading="lazy"
		term="{scheme.schemename}/{scheme.ampliconsize}/{scheme.schemeversion}"
		mapping="specific"
	/>
{/if}

<style>
	@import '$lib/assets/css/pills.css';
	h2 {
		margin-bottom: 0.4em;
	}
	td {
		border: none;
		margin-bottom: 0em;
		line-height: 0.5em;
	}
	.dropdown {
		background-color: #00444d;
		color: rgb(255, 254, 247);
	}

	article header {
		background-color: #00444d;
		color: rgb(255, 254, 247);
	}
	article header a {
		color: rgb(255, 254, 247);
	}
	article header a:hover {
		color: rgb(255, 254, 247);
		text-decoration: underline;
	}
	.breadcrumb {
		margin-bottom: 2em;
		border-bottom: 1px solid rgb(115, 130, 140);
	}
</style>
