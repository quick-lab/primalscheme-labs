<script>
	import { onMount } from 'svelte';
	import AmpliconPlot from '$lib/components/DefaultAmpliconPlot.svelte';
	import AdvancedPlot from '$lib/components/AdvancedPlot.svelte';
	import { GITHUB_URL, PRIMER_CLASS, GISCUS_REPO, GISCUS_REPO_ID, GISCUS_CATEGORY, GISCUS_CATEGORY_ID } from '$lib/config.js';
	import { loadVersionHistory as _loadVersionHistory } from '$lib/versionHistory.js';
	import 'giscus';

	// Props
	export let schemename;
	export let ampliconsize;
	export let schemeversion;
	export let status = null;
	export let infoJsonUrl;
	export let primerBedUrl;
	export let referenceFastaUrl;
	export let commitSha = null;

	// Advanced Plot
	let showingAdvancedPlot = false;
	let advancedPlotLoaded = false;

	// Reference
	let reference = undefined;
	let referenceLoading = false;
	let referenceErrored = false;
	let showReference = false;

	// Version History
	let showVersionHistory = false;
	let combinedHistory = undefined;
	let versionHistoryLoading = false;
	let versionHistoryErrored = false;

	async function loadVersionHistory() {
		if (combinedHistory || versionHistoryLoading) return;
		versionHistoryLoading = true;
		try {
			combinedHistory = await _loadVersionHistory({ schemename, ampliconsize, schemeversion });
		} catch (err) {
			console.error(err);
			versionHistoryErrored = true;
		} finally {
			versionHistoryLoading = false;
		}
	}

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

	// Derived
	let displayStatus;
	$: displayStatus = status || (info && info.status) || null;

	let githubTreeUrl;
	$: githubTreeUrl = commitSha
		? `${GITHUB_URL}/tree/${commitSha}/${PRIMER_CLASS}/${schemename}/${ampliconsize}/${schemeversion}`
		: `${GITHUB_URL}/tree/main/${PRIMER_CLASS}/${schemename}/${ampliconsize}/${schemeversion}`;

	function download(content, filename) {
		let file = new File([content], filename, {
			type: 'text/plain'
		});
		const link = document.createElement('a');
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}

	onMount(async function () {
		// Load info.json
		try {
			const response = await fetch(infoJsonUrl);
			info = await response.json();
		} catch (err) {
			console.error(err);
			infoErrored = true;
		} finally {
			infoLoading = false;
		}

		// Primalscheme major version
		const algoStr = info?.algorithmversion;
		const algoMatchResult = typeof algoStr === 'string' ? algoStr.match(/primalscheme(\d+):/) : null;
		primalschemeMajorVersion = algoMatchResult ? Number.parseInt(algoMatchResult[1]) : null;

		// Load bedfile
		try {
			let response = await fetch(primerBedUrl);
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
			let response = await fetch(referenceFastaUrl);
			reference = await response.text();
		} catch (err) {
			console.error(err);
			referenceErrored = true;
		} finally {
			referenceLoading = false;
		}
	});
</script>

{#if infoLoading || bedfileLoading}
	<p aria-busy="true">Loading data...</p>
{:else if infoErrored || bedfileErrored || referenceErrored}
	<dialog open>
		<article>
			<header>Error</header>
			<p>Unable to load scheme data.</p>
		</article>
	</dialog>
{:else}
	{#if commitSha}
		<p class="pin-notice">Pinned to commit <a href="{GITHUB_URL}/commit/{commitSha}" target="_blank" rel="noopener"><code>{commitSha.slice(0, 7)}</code></a> &mdash; <a href="/detail/{schemename}/{ampliconsize}/{schemeversion}/">view latest</a></p>
	{/if}

	<div class="grid level">
		<h2>{schemename} / {ampliconsize} / {schemeversion}</h2>
		{#if displayStatus}
			<span class="pill {displayStatus}"><strong>{displayStatus}</strong></span>
		{/if}
		<a
			href={githubTreeUrl}
			class="contrast">[github-page]</a
		>
	</div>

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
			<AmpliconPlot hidden={showingAdvancedPlot} bedfileUrl={primerBedUrl} />
		</figure>

		{#if primalschemeMajorVersion >= 3}
			<figure>
				<AdvancedPlot
					on:loaded={() => ((showingAdvancedPlot = true), (advancedPlotLoaded = true))}
					bedfileUrl={primerBedUrl}
					hidden={!showingAdvancedPlot}
				/>
			</figure>
		{/if}
	</article>

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

	<article>
		<header>
			<nav>
				<ul class="downloadbutton">
					<li><strong>Version History</strong></li>
					<li>
						<em data-tooltip="Show version history">
							<input
								name="showVersionHistory"
								type="checkbox"
								role="switch"
								aria-invalid="false"
								bind:checked={showVersionHistory}
								on:change={() => { if (showVersionHistory) loadVersionHistory(); }}
							/>
						</em>
					</li>
				</ul>
			</nav>
		</header>
		<div class="overflow-auto">
			{#if !showVersionHistory}
				<p>Toggle to show</p>
			{:else if versionHistoryLoading}
				<p aria-busy="true">Loading version history...</p>
			{:else if versionHistoryErrored}
				<p>Unable to load version history. GitHub API rate limit may have been exceeded.</p>
			{:else if combinedHistory && combinedHistory.length > 0}
				<figure>
					<table class="version-history-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Author</th>
								<th>Message</th>
								<th>Changes</th>
								<th>Commit</th>
								<th>Pinned View</th>
							</tr>
						</thead>
						<tbody>
							{#each combinedHistory as entry}
								<tr>
									<td>{new Date(entry.date).toLocaleDateString()}</td>
									<td>{entry.author}</td>
									<td>{entry.message}</td>
									<td>
										<span class="changes-pill {entry.changes}">{entry.changes}</span>
										{#if entry.added}<span class="changes-pill added">added</span>{/if}
									</td>
									<td>
										<a
											href="{GITHUB_URL}/commit/{entry.sha}"
											target="_blank"
											rel="noopener"
										>{entry.sha.slice(0, 7)}</a>
									</td>
									<td>
										<a href="/pin/{entry.sha}/{schemename}/{ampliconsize}/{schemeversion}/">view</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</figure>
			{:else}
				<p>No history found.</p>
			{/if}
		</div>
	</article>

	{#if !commitSha}
		<giscus-widget
			id="comments"
			repo={GISCUS_REPO}
			repoid={GISCUS_REPO_ID}
			category={GISCUS_CATEGORY}
			categoryid={GISCUS_CATEGORY_ID}
			reactionsenabled="1"
			emitmetadata="0"
			inputposition="top"
			theme="light"
			lang="en"
			loading="lazy"
			term="{schemename}/{ampliconsize}/{schemeversion}"
			mapping="specific"
		/>
	{:else}
		<p class="pin-notice">Comments are disabled for pinned views. <a href="/detail/{schemename}/{ampliconsize}/{schemeversion}/">View latest</a> to join the discussion.</p>
	{/if}
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

	.version-history-table td,
	.version-history-table th {
		line-height: 1.4em;
		white-space: normal;
	}
	.changes-pill {
		display: inline-block;
		padding: 0.15em 0.5em;
		border-radius: 4px;
		font-size: 0.85em;
		font-weight: 600;
		white-space: nowrap;
	}
	.changes-pill.scheme {
		background: #e1f5e1;
		color: #2a6e2a;
	}
	.changes-pill.metadata {
		background: #e1edff;
		color: #1a3a5c;
	}
	.changes-pill.both {
		background: #fff3e0;
		color: #8a5a00;
	}
	.changes-pill.added {
		background: #e8def8;
		color: #4a1a8a;
		margin-left: 0.3em;
	}

	.pin-notice {
		margin-bottom: 1rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid #4b8bd9;
		border-radius: 4px;
		background: #e1edff;
		color: #1a3a5c;
	}
</style>
