<script>
	import "@picocss/pico";
	import articLogo from '$lib/assets/img/artic-logo.svg';
</script>

<nav data-sveltekit-reload>
	<ul>
	  <li class="logo">
		<a href="/">
			<img
				src={articLogo}
				alt="triangle with all three sides equal"
		
		/>
		<strong>PrimalSchemes</strong>
	</a>
</li>
	</ul>
	<ul>
	  <li><a href="#">Home</a></li>
	  <li><a href="#">About</a></li>
	</ul>
	
  </nav>

<main class="container"><slot></slot></main>


<hr>
<br>

<p xmlns:cc="http://creativecommons.org/ns#" >Unless stated otherwise all work is licensed under <a href="http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-SA 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"></a></p>

<style>
	.logo, li a {
		color: rgb(255, 254, 247);

	}
	li a:hover {
		color: rgb(255, 254, 247);
		text-decoration: underline;
	}
	li.logo a:hover {
		text-decoration: none;
	}
	.logo img {
		height: 50px;
		margin-right: 10px;
	}
	p {
		text-align: center;
	}
	nav {
		background-color: #00444D;
		color: white;
		margin-bottom: 20px;
	}
	nav ul {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0;
		margin: 0 20px;
	}
</style>

<!-- 0, 68, 77 -->
<!-- 00444D -->