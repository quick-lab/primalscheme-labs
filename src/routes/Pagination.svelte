<script>
    export let  pageCount;
    export let pageNum;
    export let resultCount;
    export let pageSize;

</script>

<nav>
    <p>Showing {pageSize} of {resultCount} results</p>
<ul>
    {#each Array(pageCount) as _, i}
        <li>
            <a class:active={i==pageNum-1} href={`?page=${i+1}`}>{i+1}</a>
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
        color: #00444D;
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 5px;
        background-color: #ffffff;
    }
    nav ul li a:hover, nav ul li a.active {
        background-color: #00444D;
        color: #ffffff;
    }
</style>
