<main>
	<section>
		<hgroup>
			<h1>FAQs</h1>
			<p>Answers to common questions</p>
		</hgroup>

		<article>
			<header>
				<nav>
					<li><strong>How do I request for my scheme to be tracked?</strong></li>
				</nav>
			</header>
			<h6>Upload your own</h6>
			<p>
				Use <a href="https://github.com/ChrisgKent/primal-page">Primal-page</a> to generate metadata
				files and repository structure for your scheme. Then submit a pull request to
				<a href="https://github.com/quick-lab/primerschemes"> quick-lab/primerschemes</a>
			</p>
			<h6>Contact us</h6>
			<p>
				Email us at
				<a href="mailto:c.g.kent@bham.ac.uk">c.g.kent@bham.ac.uk</a>
			</p>
		</article>

		<article>
			<header>
				<nav>
					<li><strong>What does scheme status mean?</strong></li>
				</nav>
			</header>

			<nav>
				<ul>
					<li><span class="pill withdrawn"><b>withdrawn</b></span></li>
					<li>Scheme has been withdrawn.</li>
				</ul>
			</nav>

			<nav>
				<ul>
					<li><span class="pill deprecated"><b>deprecated</b></span></li>
					<li>Scheme has been deprecated as a newer version may be available.</li>
				</ul>
			</nav>

			<nav>
				<ul>
					<li><span class="pill autogenerated"><b>autogenerated</b></span></li>
					<li>Scheme has been generated by a pipeline from public data sources.</li>
				</ul>
			</nav>

			<nav>
				<ul>
					<li><span class="pill draft"><b>draft</b></span></li>
					<li>
						Scheme has been inspected <i>in silico</i>.
					</li>
				</ul>
			</nav>

			<nav>
				<ul>
					<li><span class="pill tested"><b>tested</b></span></li>
					<li>Scheme has been tested in the laboratory.</li>
				</ul>
			</nav>

			<nav>
				<ul>
					<li><span class="pill validated"><b>validated</b></span></li>
					<li>Scheme has been validated and/or published.</li>
				</ul>
			</nav>
		</article>
	</section>
</main>

<article>
	<header>
		<nav>
			<li><strong>What do the plots show?</strong></li>
		</nav>
	</header>
	<h6>Basic Plot: Figure legend (from top to bottom)</h6>
	<ul><li>Coordinates of amplicons per pool.</li></ul>

	<h6>Advanced Plot: Figure legend (from top to bottom)</h6>
	<ul>
		<li>Coordinates of amplicons per pool.</li>

		<li>
			Proportion of sequences with a base at position in alignment (Base Occupancy) and %GC in a
			sliding window.
		</li>
		<li>Sequence variation at position (Entropy) in a sliding window.</li>

		<li>Coordinates of primers passing thermodynamic filtering.</li>
	</ul>
</article>

<style>
	@import '$lib/assets/css/pills.css';
	article header {
		background-color: var(--pico-primary);
		color: rgb(255, 254, 247);
	}
	article header a {
		color: rgb(255, 254, 247);
	}
	article header a:hover {
		color: rgb(255, 254, 247);
		text-decoration: underline;
	}
</style>
