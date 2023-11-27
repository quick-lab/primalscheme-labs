<script>
    export let bedfileUrl;
    import {onMount} from 'svelte'

    let loadingData = true;
    let bedfileText = false;

	// Log data to see if working
	onMount(async function () {
        // Load the bedfile
        let Plotly = (await import('plotly.js-dist-min')).default;
        let response;
        
        try {
            response = await fetch(bedfileUrl);
            console.log(response);
        } catch (error) {
            console.log(response);
        }
        
        bedfileText  = await response.text();

        let TESTER = document.getElementById('tester');

        // Determine the number of pools
        let pools = [];
        let length = 0;

        // Parse the 7 col bedfile data into primers
        let primerData = [];
        let lines = bedfileText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let fields = line.split('\t');
            let primer = {
                chromname: fields[0],
                start: parseInt(fields[1]),
                stop: parseInt(fields[2]),
                primername: fields[3],
                pool: parseInt(fields[4]),
                strand: fields[5],
                sequence: fields[6],
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
        let msaPrimers = Object.groupBy(primerData, ({chromname}) => chromname);
        for (let chromname in msaPrimers) {
            let msaData = msaPrimers[chromname];
            // Create amplicons by combining primers by primernumber
            let ampliconPrimers = Object.groupBy(msaData, ({amplicon_number}) => amplicon_number);
            // Generate amplicon data
            let msaAmplicons = [];
            for (let ampliconNumber in ampliconPrimers) {
                // Group primers by strand
                let primerFR = Object.groupBy(ampliconPrimers[ampliconNumber], ({strand}) => strand);

                let amplicon = {
                    ampliconNumber: ampliconNumber,
                    pool: primerFR['+'][0].pool,
                    forwardPrimers: primerFR['+'],
                    reversePrimers: primerFR['-'],
                    start: Math.min(...primerFR['+'].map(({start}) => start)),
                    stop: Math.max(...primerFR['-'].map(({stop}) => stop)),
                    coverageStart: Math.min(...primerFR['+'].map(({stop}) => stop)),
                    coverageStop: Math.max(...primerFR['-'].map(({start}) => start)),
                    amplicionUUID: primerFR['+'][0].primername.split('_')[0]
                }
                msaAmplicons.push(amplicon);
            }
            chromnameToAmplicons[chromname] = msaAmplicons;
        }

        let npools = Math.max(...pools);


        // For each msa create the plotly data
        for (let chromname in chromnameToAmplicons) {
            let amplicons = chromnameToAmplicons[chromname];

            // Work out the number of pools
            let fPrimerLayout = []
            let rPrimerLayout = []
            let ampliconLineLayout = []
            // Add the points for the primers
            let ampliconPointDataX = []
            let ampliconPointDataY = []
            let ampliconPointDataLabel = []
            
            
            for (var i = 0; i < amplicons.length; i++) {
                let amplicon = amplicons[i];
                let fpLayout = {
                    type: 'rect',
                    x0: amplicon.start,
                    x1: amplicon.coverageStart,
                    y0: amplicon.pool-0.05,
                    y1: amplicon.pool+0.05,
                    fillcolor:"LightSalmon",
                    line: {color:"LightSalmon", width:2
                    }
                }
                fPrimerLayout.push(fpLayout);

                let rpLayout = {
                    type: 'rect',
                    x0: amplicon.coverageStop,
                    x1: amplicon.stop,
                    y0: amplicon.pool-0.05,
                    y1: amplicon.pool+0.05,
                    fillcolor:"LightSalmon",
                    line: {color:"LightSalmon", width:2
                    }
                }
                rPrimerLayout.push(rpLayout);

                let ampliconLine = {
                    type: 'line',
                    x0: amplicon.coverageStart,
                    x1: amplicon.coverageStop,
                    y0: amplicon.pool,
                    y1: amplicon.pool,
                    line: {color:"LightSeaGreen", width:5
                    }
                }
                ampliconLineLayout.push(ampliconLine);

                // Add the points for the primers
                // FPrimer
                ampliconPointDataX.push(amplicon.start);
                ampliconPointDataY.push(amplicon.pool);
                ampliconPointDataLabel.push(amplicon.amplicionUUID + "_"+  amplicon.ampliconNumber + '_LEFT');
                //RPrimer
                ampliconPointDataX.push(amplicon.stop);
                ampliconPointDataY.push(amplicon.pool);
                ampliconPointDataLabel.push(amplicon.amplicionUUID+ "_"+ amplicon.ampliconNumber+ '_RIGHT');
            }
    

            // Find the uncovered regions
            // TODO

            // Plot the data
            // Plotly.newPlot('tester', ampliconData)
            let ampliconData = {
                x: ampliconPointDataX,
                y: ampliconPointDataY,
                type: 'scatter',
                mode: "markers",
                hovertemplate: "%{text}<extra></extra>",
                text: ampliconPointDataLabel,
                opacity:0,
            };
            let ampliconLayout = {
                title: 'Amplicon Plot: ' + chromname,
                showline:true,
                mirror:true,
                ticks:"outside",
                linewidth:2,
                linecolor:"black",
                tickformat:",d",
                tickmode:"array",
                title_font:{size:18, family:"Arial", color:"Black"},
                xaxis: {
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"black",
                    tickformat:",d",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    range:[0,length],
                    title:"Position",
                },
                yaxis: {
                    title: 'Pool',
                    range: [0.5, npools+0.5],
                    tickvals: pools,
                    fixedrange:true,
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"black",
                    fixedrange:true,
                    title_font:{size:18, family:"Arial", color:"Black"},

                },
                shapes: [...fPrimerLayout, ...rPrimerLayout, ...ampliconLineLayout]
            }

            Plotly.newPlot( TESTER, [ampliconData], ampliconLayout );
    }

        // All loaded 
		loadingData = false;
	});

</script>


<div id="tester" style="width:90%;height:500px;"></div>
<!-- <br>
<h2>Bedfile</h2>
{#if loadingData}
    <p>Loading data...</p>
{:else}
    <figure>
        <a href={bedfileUrl} download role='button'>Download</a>
    <div class="code">
        <pre>{bedfileText}</pre>
    </div>
    </figure>
{/if} -->