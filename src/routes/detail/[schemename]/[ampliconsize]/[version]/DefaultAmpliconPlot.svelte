<script>
	export let bedfileUrl;
	export let hidden = false;

	import { onMount } from 'svelte';

	let bedfileText = false;
	let loading = true;

	function generateDefaultPlot(amplicons, div, chromname, Plotly, pools, length) {
		let npools = Math.max(...pools);
		let uniquePools = new Set(pools);
		pools = Array.from(uniquePools);

		// Work out the number of pools
		let fPrimerLayout = [];
		let rPrimerLayout = [];
		let ampliconLineLayout = [];
		// Add the points for the primers
		let ampliconPointDataX = [];
		let ampliconPointDataY = [];
		let ampliconPointDataLabel = [];

		// Handle regular amplicons
		for (var i = 0; i < amplicons.length; i++) {
			let amplicon = amplicons[i];
			let fpLayout = {
				type: 'rect',
				x0: amplicon.start,
				x1: amplicon.coverageStart,
				y0: amplicon.pool - 0.05,
				y1: amplicon.pool + 0.05,
				fillcolor: 'LightSalmon',
				line: { color: 'LightSalmon', width: 2 }
			};
			fPrimerLayout.push(fpLayout);

			let rpLayout = {
				type: 'rect',
				x0: amplicon.coverageStop,
				x1: amplicon.stop,
				y0: amplicon.pool - 0.05,
				y1: amplicon.pool + 0.05,
				fillcolor: 'LightSalmon',
				line: { color: 'LightSalmon', width: 2 }
			};
			rPrimerLayout.push(rpLayout);

			if (amplicon.coverageStart > amplicon.coverageStop) {
				// Circular amplicon
				let ampliconLineLeft = {
					type: 'line',
					x0: amplicon.coverageStart,
					x1: length,
					y0: amplicon.pool,
					y1: amplicon.pool,
					line: { color: 'LightSeaGreen', width: 5 }
				};
				ampliconLineLayout.push(ampliconLineLeft);
				let ampliconLineRight = {
					type: 'line',
					x0: 0,
					x1: amplicon.coverageStop,
					y0: amplicon.pool,
					y1: amplicon.pool,
					line: { color: 'LightSeaGreen', width: 5 }
				};
				ampliconLineLayout.push(ampliconLineRight);
			} else {
				// Linear amplicon
				let ampliconLine = {
					type: 'line',
					x0: amplicon.coverageStart,
					x1: amplicon.coverageStop,
					y0: amplicon.pool,
					y1: amplicon.pool,
					line: { color: 'LightSeaGreen', width: 5 }
				};
				ampliconLineLayout.push(ampliconLine);
			}

			// Add the points for the primers
			// FPrimer
			ampliconPointDataX.push(amplicon.start);
			ampliconPointDataY.push(amplicon.pool);
			ampliconPointDataLabel.push(amplicon.amplicionUUID + '_' + amplicon.ampliconNumber + '_LEFT');
			//RPrimer
			ampliconPointDataX.push(amplicon.stop);
			ampliconPointDataY.push(amplicon.pool);
			ampliconPointDataLabel.push(
				amplicon.amplicionUUID + '_' + amplicon.ampliconNumber + '_RIGHT'
			);
		}

		// Find the uncovered regions
		// TODO
		// Plot the data
		// Plotly.newPlot('tester', ampliconData)
		let ampliconData = {
			x: ampliconPointDataX,
			y: ampliconPointDataY,
			type: 'scattergl',
			mode: 'markers',
			hovertemplate: '%{text}<extra></extra>',
			text: ampliconPointDataLabel,
			opacity: 0
		};
		let ampliconLayout = {
			title: 'Amplicon Plot: ' + chromname,
			showline: true,
			mirror: true,
			ticks: 'outside',
			linewidth: 2,
			linecolor: 'black',
			tickformat: ',d',
			tickmode: 'array',
			title_font: { size: 18, family: 'Arial', color: 'Black' },
			xaxis: {
				showline: true,
				mirror: true,
				ticks: 'outside',
				title: 'Reference index',
				linewidth: 2,
				linecolor: 'black',
				tickformat: ',d',
				title_font: { size: 18, family: 'Arial', color: 'Black' },
				range: [0, length]
			},
			yaxis: {
				title: 'Pool',
				range: [Math.min(...uniquePools) - 0.5, Math.max(...uniquePools) + 0.5],
				tickvals: pools,
				fixedrange: true,
				showline: true,
				mirror: true,
				ticks: 'outside',
				linewidth: 2,
				linecolor: 'black',
				fixedrange: true,
				title_font: { size: 18, family: 'Arial', color: 'Black' },
				zeroline: false
			},
			shapes: [...fPrimerLayout, ...rPrimerLayout, ...ampliconLineLayout]
		};
		let config = {
			responsive: true,
			modeBarButtonsToRemove: ['autoScale2d', 'select', 'select2d', 'lasso2d', 'zoom']
		};
		Plotly.newPlot(div, [ampliconData], ampliconLayout, config);
	}
	// Log data to see if working
	onMount(async function () {
		// Load the bedfile
		let Plotly = (await import('plotly.js-dist-min')).default;
		let response;

		try {
			response = await fetch(bedfileUrl);
		} catch (error) {
			console.log(response);
		}

		bedfileText = await response.text();

		// Determine the number of pools
		let pools = [];
		let length = 0;

		// Parse the 7 col bedfile data into primers
		let primerData = [];
		let headerData = [];
		let lines = bedfileText.split('\n');
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			// Skip Header lines
			if (line.startsWith('#')) {
				headerData.push(line);
				continue;
			}

			let fields = line.split('\t');
			// Skip empty lines
			if (fields.length < 6) {
				continue;
			}
			let primer = {
				chromname: fields[0],
				start: parseInt(fields[1]),
				stop: parseInt(fields[2]),
				primername: fields[3],
				pool: parseInt(fields[4]),
				strand: fields[5],
				amplicon_number: parseInt(fields[3].split('_')[1]) // Parse amplicon number from uuid_amp_dir_primernumber
			};
			primerData.push(primer);

			// Make a not of all the pools
			if (!pools.includes(primer.pool)) {
				pools.push(primer.pool);
			}
			// Make a note of the length
			if (primer.stop > length) {
				length = primer.stop;
			}
		}

		let chromnameToAmplicons = {};
		// Create each msa by grouping primers by chromname
		let msaPrimers = primerData.reduce((acc, primer) => {
			if (!acc[primer.chromname]) {
				acc[primer.chromname] = [];
			}
			acc[primer.chromname].push(primer);
			return acc;
		}, {});

		for (let chromname in msaPrimers) {
			let msaData = msaPrimers[chromname];
			// Create amplicons by combining primers by primernumber
			let ampliconPrimers = msaData.reduce((acc, primer) => {
				if (!acc[primer.amplicon_number]) {
					acc[primer.amplicon_number] = [];
				}
				acc[primer.amplicon_number].push(primer);
				return acc;
			}, {});
			// Generate amplicon data
			let msaAmplicons = [];
			for (let ampliconNumber in ampliconPrimers) {
				// Group primers by strand
				let primerFR = ampliconPrimers[ampliconNumber].reduce((acc, primer) => {
					if (!acc[primer.strand]) {
						acc[primer.strand] = [];
					}
					acc[primer.strand].push(primer);
					return acc;
				}, {});

				let amplicon = {
					ampliconNumber: ampliconNumber,
					pool: primerFR['+'][0].pool,
					forwardPrimers: primerFR['+'],
					reversePrimers: primerFR['-'],
					start: Math.min(...primerFR['+'].map(({ start }) => start)),
					stop: Math.max(...primerFR['-'].map(({ stop }) => stop)),
					coverageStart: Math.min(...primerFR['+'].map(({ stop }) => stop)),
					coverageStop: Math.max(...primerFR['-'].map(({ start }) => start)),
					amplicionUUID: primerFR['+'][0].primername.split('_')[0]
				};
				msaAmplicons.push(amplicon);
			}
			chromnameToAmplicons[chromname] = msaAmplicons;
		}

		// For each msa create the plotly data
		for (let chromname in chromnameToAmplicons) {
			let amplicons = chromnameToAmplicons[chromname];

			// Create a new div for the plots
			let PlotdivElement = document.createElement('div');
			PlotdivElement.id = chromname;
			PlotdivElement.style.width = '100%';
			PlotdivElement.style.height = '100%';

			let plotBody = document.getElementById('defaultPlot');
			plotBody.append(PlotdivElement);

			// Get the length of each msa
			let chromLength = Math.max(...amplicons.map((a) => a.stop));
			generateDefaultPlot(amplicons, PlotdivElement, chromname, Plotly, pools, chromLength * 1.005 );
		}
		loading = false;
	});
</script>

{#if loading}
	<button aria-busy="true">Loading basic plot…</button>
{/if}
<div id="defaultPlot" {hidden} />
