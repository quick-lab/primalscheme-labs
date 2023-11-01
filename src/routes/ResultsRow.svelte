<script>
    export let scheme;
</script>

<tr>
    <td><a href={scheme.info_json_url}>{scheme.schemeName}</a></td>
    <td>{scheme.ampliconSize}</td>
    <td><span class='pill {scheme.status}'>{scheme.status}</span></td>
</tr>


<style>
	/* .pill {
		display: block;
		border-radius: 0.5em;
		padding: 0.5em;
		text-align: center;

	}
	.pill.draft {
		background-color: #f0ad4e;
		color: #000;
	} */
</style>