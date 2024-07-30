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
	let advancedPlotLoaded = false;

	// Reference
	let reference = undefined;
	let referenceLoading = false;
	let referenceErrored = false;
	let showReference = false;

	// Info.json
	let info = undefined;
	let infoLoading = true;
	let infoErrored = false;

	// Bedfile
	let rawBedfile = undefined;
	let bedfile = undefined;
	let bedfileErrored = false;
	let bedfileLoading = true;
	let showBedfile = false;

	// Algo
	let primalschemeMajorVersion = undefined;

	function download(content, filename) {
		// Create a file
		let file = new File([content], filename, {
			type: 'text/plain'
		});
		const link = document.createElement('a');
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();

		// Remove links
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
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
			rawBedfile = await response.text();

			bedfile = rawBedfile
				.trim()
				.split('\n')
				.map((bedline) => bedline.split('\t'));
		} catch (err) {
			console.error(err);
			bedfileErrored = true;
		} finally {
			bedfileLoading = false;
		}

		// Load reference
		referenceLoading = true;
		try {
			let response = await fetch(scheme.reference_fasta_url);
			reference = await response.text();
		} catch (err) {
			console.error(err);
			referenceErrored = true;
		} finally {
			referenceLoading = false;
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
		<a
			href="https://github.com/quick-lab/primerschemes/tree/main/primerschemes/{scheme.schemename}/{scheme.ampliconsize}/{scheme.schemeversion}"
			class="contrast">[github-page]</a
		>
	</div>

	{#if infoLoading}
		<p aria-busy="true">Loading data...</p>
	{:else}
		{#if info.description}
			<p>{info.description}</p>
		{/if}

		<article>
			<header class="grid level">
				<div><strong>Scheme Overview</strong></div>
				<div>
					<input
						name="whichPlot"
						type="checkbox"
						role="switch"
						aria-invalid="false"
						bind:checked={showingAdvancedPlot}
						disabled={!advancedPlotLoaded}
					/> Advanced Plot
				</div>
			</header>
			<figure>
				<AmpliconPlot hidden={showingAdvancedPlot} bedfileUrl={scheme.primer_bed_url} />
			</figure>

			{#if primalschemeMajorVersion >= 3}
				<figure>
					<AdvancedPlot
						on:loaded={() => ((showingAdvancedPlot = true), (advancedPlotLoaded = true))}
						bedfileUrl={scheme.primer_bed_url}
						hidden={!showingAdvancedPlot}
					/>
				</figure>
			{/if}
		</article>
	{/if}

	<h2>Scheme Details</h2>

	<article>
		<header>
			<nav>
				<ul class="downloadbutton">
					<li><strong>info.json</strong></li>
				</ul>
				<ul class="downloadbutton">
					<li class="downloadbutton">
						<button
							type="button"
							class="download"
							data-tooltip="Download info.json"
							on:click={() => {
								download(JSON.stringify(info, null, 2), 'info.json');
							}}
						>
							download
						</button>
					</li>
				</ul>
			</nav>
		</header>
		<div class="overflow-auto">
			<figure>
				<table>
					{#each Object.keys(info) as key}
						<tr>
							<th scope="row">{key}:</th>
							{#if info[key] instanceof Array}
								<td>{info[key].join(', ')}</td>
							{:else if info[key] instanceof Object}
								<td>{JSON.stringify(info[key], null, 2)}</td>
							{:else}
								<td>{info[key]}</td>
							{/if}
						</tr>
					{/each}
				</table>
			</figure>
		</div>
	</article>

	<article>
		<header>
			<nav>
				<ul class="downloadbutton">
					<li><strong>primer.bed</strong></li>
					<li>
						<em data-tooltip="Show file">
							<input
								name="showBedfile"
								type="checkbox"
								role="switch"
								aria-invalid="false"
								bind:checked={showBedfile}
							/>
						</em>
					</li>
				</ul>
				<ul class="downloadbutton">
					<li class="downloadbutton">
						<button
							type="button"
							class="download"
							data-tooltip="Download primer.bed"
							on:click={() => {
								download(rawBedfile, 'primer.bed');
							}}
						>
							download
						</button>
					</li>
				</ul>
			</nav>
		</header>
		<div class="overflow-auto">
			{#if showBedfile}
				<figure>
					{#each bedfile as bedline}
						{#if bedline[0].startsWith('#')}
							<pre>{bedline}</pre>
						{/if}
					{/each}
					<table>
						<pre>
						<tbody>
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
						</tbody>
					</pre>
					</table>
				</figure>
			{:else}
				<p>Toggle to show</p>
			{/if}
		</div>
	</article>

	<article>
		<header>
			<nav>
				<ul class="downloadbutton">
					<li><strong>reference.fasta</strong></li>
					<li>
						<em data-tooltip="Show file">
							<input
								name="showBedfile"
								type="checkbox"
								role="switch"
								aria-invalid="false"
								bind:checked={showReference}
							/>
						</em>
					</li>
				</ul>
				<ul class="downloadbutton">
					<li class="downloadbutton">
						<button
							type="button"
							class="download"
							data-tooltip="Download reference.fasta"
							on:click={() => {
								download(reference, 'reference.fasta');
							}}
						>
							download
						</button>
					</li>
				</ul>
			</nav>
		</header>
		<div class="overflow-auto">
			{#if !showReference}
				<p>Toggle to show</p>
			{:else if referenceLoading}
				<p aria-busy="true">Loading reference...</p>
			{:else if referenceErrored}
				<p>ERROR</p>
			{:else}
				<pre>{reference}</pre>
			{/if}
		</div>
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
		background-color: var(--pico-primary);
		color: rgb(255, 254, 247);
	}
	article header {
		background-color: var(--pico-primary);
		color: rgb(255, 254, 247);
	}
	.breadcrumb {
		margin-bottom: 2em;
		border-bottom: 1px solid rgb(115, 130, 140);
	}

	p[aria-busy='true'] {
		margin-bottom: 1em;
	}
	td {
		background-color: transparent;
	}
	button.download {
		color: var(--pico-contrast-inverse);
		background-color: rgb(0, 0, 0, 0);
		margin-bottom: 0em;
		--pico-border-color: var(--pico-contrast-inverse);
	}
	button.download:hover {
		box-shadow: 0px 0px 1px 1px var(--pico-contrast-inverse);
	}
	ul.downloadbutton {
		padding-top: 0;
		padding-bottom: 0;
		color: var(--pico-contrast-inverse);
	}
	li.downloadbutton {
		padding-top: 0;
		padding-bottom: 0;
	}
</style>
