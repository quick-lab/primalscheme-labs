<script>
	export let scheme;
	export let query;
</script>

<!-- <tr>
	<td><a href={`/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}?q=${query}`}>{scheme.schemeName}</a></td>
	<td>{scheme.ampliconsize}</td>
	<td>{scheme.schemeversion}</td>
	<td><span class='pill {scheme.status}'><strong>{scheme.status}</strong></span></td>
</tr> -->

<main class="container">
	<nav>
		<ul>
			<a
				class="title"
				href={`/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}/?q=${query}`}
				><strong>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</strong></a
			>
		</ul>
		<ul><span class="pill {scheme.status}"><strong>{scheme.status}</strong></span></ul>
	</nav>
	<aside>
		<nav>
			<ul><b>authors:</b> {scheme.authors}</ul>
		</nav>
	</aside>
	<nav>
		<ul><b>species:</b>{scheme.species}</ul>
		<ul style="color:grey">{scheme.license}</ul>
	</nav>
</main>
<hr />

<style>
	@import '$lib/assets/css/pills.css';
	@import '$lib/assets/css/article.css';
	.ol {
		text-indent: 25px;
	}
	.title {
		font-size: 1.5em;
	}
	.container a {
		color: #00444d;
		background-color: transparent;
	}
	.container a:hover {
		color: #810081;
		background-color: transparent;
		text-decoration: underline;
		transition: 0.2s;
	}
</style>
