<script>
    export let scheme;
	export let query;

	function parseArrayToString(array) {
		return array.join(', ').trim();
	}
</script>


<!-- <tr>
	<td><a href={`/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}?q=${query}`}>{scheme.schemeName}</a></td>
	<td>{scheme.ampliconsize}</td>
	<td>{scheme.schemeversion}</td>
	<td><span class='pill {scheme.status}'><strong>{scheme.status}</strong></span></td>
</tr> -->

<main class="container">
	<nav>
		<ul><a href={`/detail/${scheme.schemename}/${scheme.ampliconsize}/${scheme.schemeversion}?q=${query}`}><strong>{scheme.schemename} / {scheme.ampliconsize} / {scheme.schemeversion}</strong></a></ul>
		<ul><span class='pill {scheme.status}'><strong>{scheme.status}</strong></span></ul>
	</nav>
	<aside>
	<nav>
		<ul><b>authors:</b>&nbsp{parseArrayToString(scheme.authors)} </ul>

	</nav>
	</aside>
	<nav>
		<ul><b>species:</b>&nbsp{parseArrayToString(scheme.species)} </ul>
		<ul style="color:grey">{scheme.license} </ul>

	</nav>





</main>
<hr>



<style>
	@import 'src/lib/assets/css/pills.css';
	.ol {
		text-indent: 25px;
	}

	.container strong {
		font-size: 1.5em;
	}
	.container a{
		color:#00444D;
		background-color: transparent;
	}
	.container a:hover{
		color:#810081;
		background-color: transparent;
		text-decoration: underline;
		transition: 0.2s;
	}
	.pill strong {
    font-size: 20px;
}
</style>