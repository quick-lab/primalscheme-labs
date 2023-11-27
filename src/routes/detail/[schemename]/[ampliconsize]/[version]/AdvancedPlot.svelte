<script>
    export let bedfileUrl;
    import {onMount} from 'svelte'
    
    async function decompressBlob(blob) {
        let ds = new DecompressionStream("gzip");
        let decompressedStream = blob.stream().pipeThrough(ds);
        return await new Response(decompressedStream).json();
    }

    function generateAdvancedPlot(plotData, div, chromname, Plotly) {

            let fPrimerLayout = []
            let rPrimerLayout = []
            let ampliconLineLayout = []
            let ampliconPointDataX = []
            let ampliconPointDataY = []
            let ampliconPointDataLabel = []
            
            // Keep track of what pools are in this genome
            let pools = [];
            let nrows, length = plotData.dims;

            // Find the uncovered regions
            let uncoveredRegionsData = [];
            for (let [index, uncovered] of Object.entries(plotData.uncovered)) {
                    let uncoveredRegion = {
                        type: 'vrect',
                        x0: parseInt(index),
                        x1: parseInt(uncovered)+ 1,
                        y0: 0,
                        y1: 10000,
                        fillcolor:"#F0605D",
                        line:{width:0},
                        opacity:0.5,
                        row:1,  
                        col:1,  
                    }
                    uncoveredRegionsData.push(uncoveredRegion);
                }
            

            
            // Get the amplicondata 
            let ampliconJsonData = plotData.amplicons;
            for (let [ampliconNumber, amplicon] of Object.entries(ampliconJsonData)) {
                 // Make a not of all the pools
                if (!pools.includes(amplicon.p)) {
                    pools.push(amplicon.p);
                    }

                let fpLayout = {
                    xaxis:"x",
                    type: 'rect',
                    x0: amplicon.s+0,
                    x1: amplicon.cs+0,
                    y0: amplicon.p-0.05,
                    y1: amplicon.p+0.05,
                    fillcolor:"LightSalmon",
                    line: {color:"LightSalmon", width:2
                    }
                }
                fPrimerLayout.push(fpLayout);

                let rpLayout = {
                    xaxis:"x",
                    type: 'rect',
                    x0: amplicon.ce+0,
                    x1: amplicon.e+0,
                    y0: amplicon.p-0.05,
                    y1: amplicon.p+0.05,
                    fillcolor:"LightSalmon",
                    line: {color:"LightSalmon", width:2
                    }
                }
                rPrimerLayout.push(rpLayout);

                let ampliconLine = {
                    xaxis:"x",
                    type: 'line',
                    x0: amplicon.cs,
                    x1: amplicon.ce,
                    y0: amplicon.p,
                    y1: amplicon.p,
                    line: {color:"LightSeaGreen", width:5
                    }
                }
                ampliconLineLayout.push(ampliconLine);
                // Add the points for the primers
                // FPrimer
                ampliconPointDataX.push(amplicon.s);
                ampliconPointDataY.push(amplicon.p);
                ampliconPointDataLabel.push(amplicon.n +  '_LEFT');
                //RPrimer
                ampliconPointDataX.push(amplicon.e);
                ampliconPointDataY.push(amplicon.p);
                ampliconPointDataLabel.push(amplicon.n + '_RIGHT');
            }

            let npools = Math.max(...pools);
            let ampliconLayout = {
                grid: {rows: 5,columns: 1, pattern: 'coupled', subplots:["xy1","xy2","xy3","xy4"]},
                plot_bgcolor:"rgb(229,236,245)",
                width: 1000,
                height: 800,
                title: 'Amplicon Plot: ' + chromname,
                showlegend: false,
                title_font:{size:18, family:"Arial", color:"Black"},
                xaxis: {
                    domain : [0,1],
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"#403F4C",
                    tickformat:",d",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    range: [0,length[1]],
                    zeroline: false,
                },
                yaxis1: {
                    title: 'Pool',
                    range: [0.5, npools+0.5],
                    domain : [0.65,1],
                    tickvals: pools,
                    fixedrange:true,
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"#403F4C",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    zeroline: false

                },
                yaxis2: {
                    title: 'Base Occupancy', 
                    range:[0,1],
                    domain : [0.4,0.6],
                    tickvals: [0,0.2,0.4,0.6,0.8,1],
                    fixedrange:true,
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"black",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    zeroline: false,
                },
                yaxis30: {title: 'GC Content',
                    overlaying: 'y2', 
                    anchor: 'x2',
                    side: 'right',
                    ticks:"outside",
                    range:[0,1],
                    tickvals: [0,0.2,0.4,0.6,0.8,1],
                    fixedrange:true,
                    zeroline: false,},
                yaxis4: {
                    title: 'Entropy', 
                    domain : [0.2,0.35],
                    fixedrange:true,
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"black",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    zeroline: false,
                },
                yaxis5: {
                    title: 'Thermopassing Primers', 
                    domain : [0.0,0.15],
                    fixedrange:true,
                    showline:true,
                    mirror:true,
                    ticks:"outside",
                    linewidth:2,
                    linecolor:"black",
                    title_font:{size:18, family:"Arial", color:"Black"},
                    zeroline: false,
                    tickvals: []

                },


                shapes: [...fPrimerLayout, ...rPrimerLayout, ...ampliconLineLayout, ...uncoveredRegionsData]
            }
            // Create the amplicon plots
            let ampliconData = {
                x: ampliconPointDataX,
                y: ampliconPointDataY,
                type: 'scatter',
                mode: "markers",
                hovertemplate: "%{text}<extra></extra>",
                text: ampliconPointDataLabel,
                opacity:0,
                xaxis:"x",
                yaxis:"y1",
                row:1,
                col:1,
            };

            // Create the gc content plot
            let gc_x = [];
            let gc_y = [];
            for (let [index, gc] of Object.entries(plotData.gc)) {
                gc_x.push(parseInt(index));
                gc_y.push(gc);
            }
            let gcData = {
                x: gc_x,
                y: gc_y,
                xaxis:"x",
                yaxis:"y30",
                type: 'scatter',
                mode: "lines",
                row:2,
                col:1,
                line:{color:"#005c68", width:2}
            };

            // Create the base occupancy plot
            let base_occupancy_x = [];
            let base_occupancy_y = [];
            
            for (let [index, base_oc] of Object.entries(plotData.occupancy)) {
                base_occupancy_x.push(parseInt(index));
                base_occupancy_y.push(base_oc);
            }
            let occupancyData = {
                x: base_occupancy_x,
                y: base_occupancy_y,
                xaxis:"x",
                yaxis:"y2",
                type: 'scatter',
                mode: "lines",
                row:2,
                col:1,
                line:{color:"#F0605D", width:2},
                mode:"lines",
                name:"Base Occupancy",
                fill:"tozeroy",
                opacity:0.5,
            };

            // Create entropy plot
            let entropy_x = [];
            let entropy_y = [];
            for (let [index, entropy] of Object.entries(plotData.entropy)) {
                entropy_x.push(parseInt(index));
                entropy_y.push(entropy);
            }
            let entropyData = {
                x: entropy_x,
                y: entropy_y,
                xaxis:"x",
                yaxis:"y4",
                type: 'scatter',
                mode: "lines",
                row:3,
                col:1,
                line:{color:"#F0605D", width:2},
                mode:"lines",
                name:"Entropy",
            };

            // Create the thermopassing primers plot
            let thermopassing_fprimers_x = [];
            let thermopassing_fprimers_y = [];
        
            for (let [index, number_seqs] of Object.entries(plotData.thermo_pass.F)) {
                thermopassing_fprimers_x.push(parseInt(index));
                thermopassing_fprimers_y.push(1);
            }
            let thermopassing_fprimers = {
                x: thermopassing_fprimers_x,
                y: thermopassing_fprimers_y,
                xaxis:"x",
                yaxis:"y5",
                type: 'scatter',
                mode: "markers",
                color:"#e84855",
                row:4,
                col:1,
                marker: {symbol:"triangle-right", size:10, color:"#e84855"},
                name:"Thermopassing Primers",
            };

            // Create the thermopassing primers plot
            let thermopassing_rprimers_x = [];
            let thermopassing_rprimers_y = [];

            for (let [index, number_seqs] of Object.entries(plotData.thermo_pass.R)) {
                thermopassing_rprimers_x.push(parseInt(index));
                thermopassing_rprimers_y.push(0);
            }
            let thermopassing_rprimers = {
                x: thermopassing_rprimers_x,
                y: thermopassing_rprimers_y,
                xaxis:"x",
                yaxis:"y5",
                type: 'scatter',
                mode: "markers",
                row:4,
                col:1,
                marker: {symbol:"triangle-left", size:10, color:"#2d8a94"},
                name:"Thermopassing Primers",
            };

            let config = {responsive: true}


            Plotly.newPlot( div, [ampliconData,occupancyData, gcData ,entropyData,thermopassing_fprimers,thermopassing_rprimers], ampliconLayout, config);
    }

    let loadingChromNames = true
    let chromNames = [];
    let container;

    onMount(async function () {
        // this will try and load data from the bedfileUrl 
        let Plotly = (await import('plotly.js-dist-min')).default;

        let baseurl = bedfileUrl.split('/').slice(0, -1).join('/');
        let plotDataurl = baseurl + '/work/plotdata.json.gz';

        let response;
        let JsonData;

        try {
            response = await fetch(plotDataurl);
            JsonData = response.blob().then(function (blob) {
                decompressBlob(blob).then(function (json) {

                    // For each chromname
                    for (let [chromname, plotData] of Object.entries(json)) {
                        let PlotdivElement = document.createElement("div");
                        PlotdivElement.id = chromname;
                        PlotdivElement.style.width = "100%";
                        PlotdivElement.style.height = "100%";

                        generateAdvancedPlot(plotData, PlotdivElement,chromname,Plotly)
                        
                        
                        let plotBody = document.getElementById("advancedPlot");
                        plotBody.append(PlotdivElement);
                        
                    }
                    loadingChromNames = false;
                    
                })
            })
            
            
        } catch (error) {
            console.log(error);
        }


    });

</script>

<body id="advancedPlot"></body>