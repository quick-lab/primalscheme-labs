<script>
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import { flattenedSchemeIndex } from '$lib/flattenedSchemes.js';

	import 'giscus';

	import AmpliconPlot from './DefaultAmpliconPlot.svelte';
	import AdvancedPlot from './AdvancedPlot.svelte';

	/*
	// Initial state
	*/
	// Schemes
	let flatSchemes = undefined;
	let schemesErrored = false;

	// Scheme
	let scheme = undefined;
	let schemeLoading = true;

	// Advanced Plot
	let showingAdvancedPlot = false;

	// Reference
	let reference = undefined;
	let referenceLoading = false;
	let referenceErrored = false;
	let showingReference = false;

	// Info.json
	let info = undefined;
	let infoLoading = true;
	let infoErrored = false;

	// Bedfile
	let bedfile = undefined;
	let bedfileErrored = false;
	let bedfileLoading = true;

	// Algo
	let primalschemeMajorVersion = undefined;

	async function loadReference() {
		referenceLoading = true;
		try {
			let response = await fetch(scheme.reference_fasta_url);
			reference = await response.text();
			showingReference = true;
		} catch (err) {
			console.error(err);
			referenceErrored = true;
		} finally {
			referenceLoading = false;
		}
	}

	onMount(async function () {
		// Load schemes
		try {
			const response = await fetch(
				'https://raw.githubusercontent.com/quick-lab/primerschemes/main/index.json?token=GHSAT0AAAAAACNCOBUYYT5TX3KGXDHSVOQYZNKMMFA'
			);
			const schemes = await response.json();
			flatSchemes = flattenedSchemeIndex(schemes);
		} catch (err) {
			console.log(err);
			schemesErrored = true;
			return;
		}

		// Find this scheme
		scheme = flatSchemes.find((s) => {
			return (
				s.schemename === $page.params.schemename &&
				s.ampliconsize === Number.parseInt($page.params.ampliconsize) &&
				s.schemeversion === $page.params.version
			);
		});

		if (scheme === undefined) {
			error(404, 'Not found');
		} else {
			schemeLoading = false;
		}

		// Load info.json
		try {
			const response = await fetch(scheme.info_json_url);
			info = await response.json();
		} catch (err) {
			console.error(err);
			infoErrored = true;
		} finally {
			infoLoading = false;
		}

		// Primalscheme major version
		const algoStr = info.algorithmversion;
		const algoMatchResult = algoStr.match(/primalscheme(\d+):/);
		primalschemeMajorVersion = algoMatchResult ? algoMatchResult[1] : null;

		// Load bedfile
		try {
			let response = await fetch(scheme.primer_bed_url);
			bedfile = await response.text();

			bedfile = bedfile
				.trim()
				.split('\n')
				.map((bedline) => bedline.split('\t'));
		} catch (err) {
			console.error(err);
			bedfileErrored = true;
		} finally {
			bedfileLoading = false;
		}
	});
</script>

{#if schemeLoading || infoLoading || bedfileLoading}
	<p aria-busy="true">Loading data...</p>
{:else if schemesErrored || infoErrored || bedfileErrored || referenceErrored}
	<dialog open>
		<article>
			<header>Error</header>

			<p>Unable to load scheme data.</p>
		</article>
	</dialog>
{:else}
	<div class="grid level">
		<h2>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</h2>
		<span class="pill {scheme.status}"><strong>{scheme.status}</strong></span>
	</div>

	{#if infoLoading}
		<p aria-busy="true">Loading data...</p>
	{:else}
		{#if info.description}
			<p>{info.description}</p>
		{/if}

		<article>
			<header>Scheme Overview</header>
			<figure>
				<AmpliconPlot hidden={showingAdvancedPlot} bedfileUrl={scheme.primer_bed_url} />
			</figure>

			{#if primalschemeMajorVersion >= 3}
				<figure>
					<AdvancedPlot
						on:loaded={() => (showingAdvancedPlot = true)}
						bedfileUrl={scheme.primer_bed_url}
					/>
				</figure>
			{/if}
		</article>
	{/if}

	<h2>Scheme Details</h2>
	<article>
		<header class="grid level">
			<div><strong>info.json</strong></div>
			<div><a href={scheme.info_json_url} download>download</a></div>
		</header>
		<figure>
			<table>
				{#each Object.keys(info) as key}
					<tr>
						<th scope="row">{key}:</th>
						<td>{info[key]}</td>
					</tr>
				{/each}
			</table>
		</figure>
	</article>

	<article>
		<header class="grid level">
			<div><strong>primer.bed</strong></div>
			<div><a href={scheme.primer_bed_url} download>download</a></div>
		</header>

		{#each bedfile as bedline}
			{#if bedline[0].startsWith('#')}
				<pre>{bedline}</pre>
			{/if}
		{/each}

		<figure>
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
		</figure>
	</article>

	<article>
		<header class="grid level">
			<div><strong>reference.fasta</strong></div>
			<div><a href={scheme.reference_fasta_url} download>download</a></div>
		</header>

		{#if !showingReference}
			<a href="#" on:click={loadReference}>Show reference</a>
		{:else if referenceLoading}
			<p aria-busy="true">Loading reference...</p>
		{:else}
			<pre>{reference}</pre>
		{/if}
	</article>

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
	.level {
		grid-template-columns: 1fr auto;
		margin-bottom: 2em;
	}
	td,
	th {
		border: none;
		margin-bottom: 0em;
		line-height: 0.5em;
	}

	figure td,
	figure th {
		white-space: nowrap;
	}

	th {
		font-weight: bold;
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
