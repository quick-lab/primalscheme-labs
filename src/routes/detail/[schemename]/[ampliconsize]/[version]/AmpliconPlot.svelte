<script>
    export let bedfileUrl;
    import {onMount} from 'svelte'

    let loadingData = true;

	// Log data to see if working
	onMount(async function () {
        // Load the bedfile
        let Plotly = (await import('plotly.js-dist-min')).default;
		const response = await fetch(bedfileUrl);
		let bedfileText  = await response.text();
        console.log(bedfileText);

        // Parse the 7 col bedfile data
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
                sequence: fields[6]
            };
            primerData.push(primer);
        }

        // Plot the data
        // Plotly.newPlot('tester', ampliconData)

        let ampliconx = [];
        let amplicony = [];
        for (let i = 0; i < primerData.length; i++) {
            ampliconx.push(primerData[i].start);
            amplicony.push(primerData[i].pool);
        }
        let ampliconData = {
            x: ampliconx,
            y: amplicony,
            type: 'scatter',
        };
        let ampliconLayout = {
            title: 'Amplicon Plot',
            xaxis: {
                title: 'Position'
            },
            yaxis: {
                title: 'Pool'
            }
        };

        let TESTER = document.getElementById('tester');
        Plotly.newPlot( TESTER, [ampliconData], ampliconLayout );

        // All loaded 
		loadingData = false;
	});

</script>

<div id="tester" style="width:90%;height:500px;"></div>