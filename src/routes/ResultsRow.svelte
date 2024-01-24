<script>
	export let scheme;
	export let query;

	import { base } from '$app/paths';
</script>

<tr>
	<td>
		<a
			class="title"
			href={`${base}/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}/?q=${query}`}
			><strong>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</strong></a
		>
		<ul>
			<li><strong>authors:</strong>{scheme.authors}</li>
			<li><strong>species:</strong>{scheme.species}</li>
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
		color: #00444d;
		background-color: transparent;
	}
	td a:hover {
		color: #810081;
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
