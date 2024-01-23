<script>
	export let pageCount;
	export let pageNum;
	export let resultCount;
	export let pageSize;
	export let query;

	import { base } from '$app/paths';

	$: queryStr = query.trim().length ? `/?q=${encodeURIComponent(query.trim())}&` : '/?';
</script>

<nav data-sveltekit-reload>
	<p>Showing {pageSize} of {resultCount} results</p>
	<ul>
		{#each Array(pageCount) as _, i}
			<li>
				<a class:active={i + 1 == pageNum} href="{base}/{queryStr}pageNum={i + 1}">{i + 1}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	nav ul {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		margin: 0 20px;
	}
	nav ul li {
		list-style: none;
		margin: 0 5px;
	}
	nav ul li a {
		text-decoration: none;
		color: #00444d;
		font-weight: bold;
		padding: 5px 10px;
		border-radius: 5px;
		background-color: #ffffff;
	}
	nav ul li a:hover,
	nav ul li a.active {
		background-color: #00444d;
		color: #ffffff;
	}
</style>
