<script>
	export let scheme;
	export let query;

	import { base } from '$app/paths';

	let author_num = 3;
</script>

<tr>
	<td>
		<a
			class="title"
			href={`${base}/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}/?q=${query}`}
			><strong>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</strong></a
		>
		<ul>
			{#if scheme.authors.length > author_num}
				<li>
					<strong>authors: </strong>{scheme.authors.slice(0, author_num).join(', ')},
					<em data-tooltip={scheme.authors.join(', ')}><i>et al.</i></em>
				</li>
			{:else}
				<li><strong>authors: </strong>{scheme.authors.join(', ')}</li>
			{/if}

			<li><strong>species: </strong>{scheme.species.join(', ')}</li>
			<li style="color:grey">{scheme.license}</li>
		</ul>
	</td>
	<td>
		<span class="pill {scheme.status}"><strong>{scheme.status}</strong></span>
	</td>
</tr>

<style>
	@import '$lib/assets/css/pills.css';
	.title {
		font-size: 1.5em;
	}
	td a {
		color: var(--pico-primary);
		background-color: transparent;
		text-decoration: none;
	}
	td a:hover {
		color: var(--pico-secondary);
		background-color: transparent;
		text-decoration: underline;
		transition: 0.2s;
	}

	ul li {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	ul {
		padding-left: 0;
	}

	tr td {
		padding-left: 0;
		padding-right: 0;
		vertical-align: top;
	}

	td:last-child > .pill {
		margin: auto 0 auto auto;
	}
</style>
