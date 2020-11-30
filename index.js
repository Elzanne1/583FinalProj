
// DEFAULT state
let vis = 'life_expectancy';

function start(){
    Promise.all([d3.json('countries.json'), d3.csv('Life Expectancy Data fixed.csv')])
        .then(([jsonData, csvData]) => {

            d3.selectAll('.country').remove();


            //SET UP
            //setDoubleScroll();

            //Combining jsonData and csvData
            let data = getCountryImageInfo(jsonData, csvData);

            let orderedLE = sortingVals(data, 'life_expectancy');
            let orderedBMI = sortingVals(data, 'bmi');
            let orderedGDP = sortingVals(data, 'gdp');
            let orderedIC = sortingVals(data, 'income_resources');
            let orderedS = sortingVals(data, 'schooling');

            let life_expect_arr = [];
            let bmi_arr = [];
            let gdp_arr = [];
            let income_arr = [];
            let schooling_arr = [];

            data.forEach(function(d){
                life_expect_arr.push(parseFloat(d['life_expectancy']));
                bmi_arr.push(parseFloat(d['bmi']));
                gdp_arr.push(parseFloat(d['gdp']));
                income_arr.push(parseFloat(d['income_resources']));
                schooling_arr.push(parseFloat(d['schooling']));
            })

            let life_extent = d3.extent(life_expect_arr);
            let bmi_extent = d3.extent(bmi_arr);
            let gdp_extent = d3.extent(gdp_arr);
            let income_extent = d3.extent(income_arr);
            let schooling_extent = d3.extent(schooling_arr);

            //console.log(life_extent, bmi_extent, gdp_extent, income_extent, schooling_extent);

            //Data setup
            let countryDivs = setUp(data);
            let start = document.querySelector('.countryDivs').clientWidth * 0.03;
            let end = document.querySelector('.countryDivs').clientWidth * 0.97;


            let lifeScale = d3.scaleLinear()
                .domain(life_extent)
                .range([start,end])
            //  .nice();

            let bmiScale = d3.scaleLinear()
                .domain(bmi_extent)
                .range([start,end])
            //  .nice();

            let gdpScale = d3.scaleLinear()
                .domain(gdp_extent)
                .range([start,end])
            // .nice();

            let incomeScale = d3.scaleLinear()
                .domain(income_extent)
                .range([start,end])
            // .nice();

            let schoolScale = d3.scaleLinear()
                .domain(schooling_extent)
                .range([start,end])
            //.nice();

            let lePercentiles = calculatePercentiles(orderedLE);
            let bmiPercentiles = calculatePercentiles(orderedBMI);
            let gdpPercentiles = calculatePercentiles(orderedGDP);
            let incomePercentiles = calculatePercentiles(orderedIC);
            let schoolPercentiles = calculatePercentiles(orderedS);

            let leColor = d3.scaleThreshold()
                .domain([Number(orderedLE[lePercentiles['25']]['life_expectancy']), Number(orderedLE[lePercentiles['50']]['life_expectancy']), Number(orderedLE[lePercentiles['75']]['life_expectancy']), life_extent[1]])
                .range(['#00ceff', '#07a0ce','#06749d', '#004c6d']);

            let bmiColor = d3.scaleThreshold()
                .domain([Number(orderedBMI[bmiPercentiles['25']]['bmi']), Number(orderedBMI[bmiPercentiles['50']]['bmi']), Number(orderedBMI[bmiPercentiles['75']]['bmi']), bmi_extent[1]])
                .range(['#ff7aff', '#cd55c9','#9c3196', '#6d0967']);
            let gdpColor = d3.scaleThreshold()
                .domain([Number(orderedGDP[gdpPercentiles['25']]['gdp']), Number(orderedGDP[gdpPercentiles['50']]['gdp']), Number(orderedGDP[gdpPercentiles['75']]['gdp']), gdp_extent[1]])
                .range(['#5cd135', '#4bae2a','#3b8d1f', '#2b6d15']);

            let incomeColor = d3.scaleThreshold()
                .domain([Number(orderedIC[incomePercentiles['25']]['income_resources']), Number(orderedIC[incomePercentiles['50']]['income_resources']), Number(orderedIC[incomePercentiles['75']]['income_resources']), income_extent[1]])
                .range(['#ff785c', '#cc543e','#9c3223', '#6d0d07']);

            let schoolColor = d3.scaleThreshold()
                .domain([Number(orderedS[schoolPercentiles['25']]['schooling']), Number(orderedS[schoolPercentiles['50']]['schooling']), Number(orderedS[schoolPercentiles['75']]['schooling']), schooling_extent[1]])
                .range(['#c2be00', '#a5a01d','#898427', '#6d682b']);


            let countrySVGs = setSVGs(countryDivs,lifeScale, bmiScale, gdpScale, incomeScale, schoolScale,leColor, bmiColor, gdpColor, incomeColor, schoolColor)

            setButtons(data, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale, countrySVGs ,leColor, bmiColor, gdpColor, incomeColor, schoolColor);



        });
}

start();
window.onresize = start;

/**
 * Set up visualization container and the country names and lines within an svg tag.
 * @param data - combination of jsonData and csvData
 */
function setUp(data){
         //SETUP of document

        let countryName = d3.select("#visual_container").selectAll('div').append('div')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'row country')
            .append('div')
            .attr('class', function(d){
                return `LABEL ${d['name']} col-xs-1`;
            } )
            .text(function(d){
                return d['name'];
            })
            .style('vertical-align', 'middle');

         let countryDivs = d3.select('#visual_container').selectAll('.country')
             .append('div')
             .attr('class', 'countryDivs col-xs-11')

        return countryDivs;
}

function setSVGs(countryDivs, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale,leColor, bmiColor, gdpColor, incomeColor, schoolColor){
    let countrySVGs = countryDivs
        .append('svg')
        .attr('class', 'countrySVGs')
        .attr('xmlns', 'http://www.w3.org/2000/svg')

    let lines = countrySVGs
        .append('line')
        .attr('stroke', 'black')
        .attr('x1', '0')
        .attr('x2', function(d){
            return document.querySelector('.countryDivs').clientWidth;
        })
        .attr('y1', function(d){
            return document.querySelector('.countryDivs').clientHeight/4;
        })
        .attr('y2', function(d){
            return document.querySelector('.countryDivs').clientHeight/4;
        })

    let vertStartLine = countrySVGs
        .append('line')
        .attr('class', 'start_line')
        .attr('stroke', 'black')
        .attr('x1', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.03;
        })
        .attr('x2', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.03;
        })
        .attr('y1', function(d){
            return this.parentElement.clientHeight * 0.1;
        })
        .attr('y2', function(d){

            return this.parentElement.clientHeight * 0.4;

        })

    let vertEndLine = countrySVGs
        .append('line')
        .attr('class', 'end_line')
        .attr('stroke', 'black')
        .attr('x1', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.97;
        })
        .attr('x2', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.97;
        })
        .attr('y1', function(d){
            return this.parentElement.clientHeight * 0.1;
        })
        .attr('y2',  function(d){
            return this.parentElement.clientHeight * 0.4;
        })

    let scale = getScale(lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
    let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);
    showData(countrySVGs, scale );
    showNumbers(countrySVGs, scale, colorScale);

    return countrySVGs;
}

function showNumbers(countrySVGs,scale,  colorScale){
    let values = countrySVGs
        .append('text')
        .attr('fill', function(d){
            return colorScale(d[vis]);
        })
        .attr('y', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.025;
        })
        .attr('font-weight', 'bold')
        .attr('font-size', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.006;
        })
        .attr('x', function(d){
            return scale(d[vis]) - document.querySelector('.countryDivs').clientWidth * 0.025;
        })
        .attr('dy', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.001;
        })
        .text(function(d){
            let num = Number(d[vis]);
            return String(num.toFixed(3));
        });
}

function showData(countrySVGs, scale){
    let info = document.querySelector('#info');
    info.textContent = `Flags Ordered By: ${translateCoding(vis)}`;
    countrySVGs.selectAll('image').remove();
    countrySVGs.selectAll('text').remove();

    let flags = countrySVGs
        .append('image')
        .attr('href', function(d){
            return d['location']
        })
        .attr('width', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.02;
        })
        .attr('height', function(){
            return document.querySelector('.countryDivs').clientHeight * 0.7;
        })
        .attr('x', function(d){
            return scale(d[vis]);
        })

}

function getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale){
    if (vis === 'life_expectancy'){
        return lifeScale;
    }
    else if (vis === 'bmi'){
        return bmiScale;
    }

    else if (vis === 'gdp'){
        return gdpScale;
    }

    else if (vis === 'income_resources'){
        return incomeScale;
    }

    else if (vis === 'schooling'){
        return schoolScale;
    }
}

function getColorScale( leColor, bmiColor, gdpColor, incomeColor, schoolColor){
    if (vis === 'life_expectancy'){
        return leColor;
    }
    else if (vis === 'bmi'){
        return bmiColor;
    }

    else if (vis === 'gdp'){
        return gdpColor;
    }

    else if (vis === 'income_resources'){
        return incomeColor;
    }

    else if (vis === 'schooling'){
        return schoolColor;
    }
}

/**
 * Combines necessary data
 * @param jsonData - country names and official abbreviations
 * @param csvData - Life Expectancy data (i.e which countries to get the flags for)
 * @returns {[]} data - an array of Objects, combining information from jsonData and csvData
 */
function getCountryImageInfo(jsonData, csvData){
    let data = [];
    csvData.forEach(function(d){
        let name = d['Country'].trim();
        for (let key in jsonData){
            if (jsonData[key].trim() === name){
                let abbrev = key;
                let a = abbrev.toLowerCase();
                let temp = {'name': name, 'code': abbrev, 'life_expectancy': d['Life expectancy '], 'bmi': d[' BMI '],
                'gdp': d['GDP'], 'income_resources': d['Income composition of resources'], 'schooling': d['Schooling'], 'location' : `./images/${a}.svg`};
                data.push(temp);
            }
        }
    });
    return data;
}





/**
 * Sets up functionality of buttons used to switch the data being displayed
 * @param data - combination of csvData and jsonData
 */
function setButtons(data, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale, countrySVGs,leColor, bmiColor, gdpColor, incomeColor, schoolColor){
   let scales = [leColor, bmiColor, gdpColor, incomeColor, schoolColor]

    let btnLE = document.getElementById('LE');
    btnLE.onclick = function(){
        vis = 'life_expectancy';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);
        // scales.forEach(function(e){
        //     showNumbers(countrySVGs, scale, e)
        // })
        let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);

        showNumbers(countrySVGs, scale, colorScale);

    }

    let btnBMI = document.getElementById('BMI');
    btnBMI.onclick = function(){
        vis = 'bmi';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);
        showData(countrySVGs, scale);
        showNumbers(countrySVGs, scale, colorScale);

    }

    let btnGDP = document.getElementById('GDP');
    btnGDP.onclick = function(){
        vis = 'gdp';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);
        showData(countrySVGs, scale);
        showNumbers(countrySVGs, scale, colorScale);

    }

    let btnIC = document.getElementById('IC');
    btnIC.onclick = function(){
        vis = 'income_resources';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);
        showData(countrySVGs, scale);
        showNumbers(countrySVGs, scale, colorScale);

    }
    
    let btnS = document.getElementById('S');
    btnS.onclick = function(){
        vis = 'schooling';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        let colorScale = getColorScale(leColor, bmiColor, gdpColor, incomeColor, schoolColor);
        showData(countrySVGs, scale);
        showNumbers(countrySVGs, scale, colorScale);
    }
}

/**
 * Sets up the double horizontal scroll feature at the top and bottom of the visualization
 */
function setDoubleScroll(){
    let upper_wrapper = document.getElementById('wrapper_upper');
    let lower_wrapper = document.getElementById('wrapper_lower');

    upper_wrapper.onscroll = function() {
        lower_wrapper.scrollLeft = upper_wrapper.scrollLeft;
    }

    lower_wrapper.onscroll = function(){
        upper_wrapper.scrollLeft = lower_wrapper.scrollLeft;


    }
}

/**
 * Convert the smaller encoding string into a string used for a header on the html page
 * @param vis - which data to show
 * @returns {string}
 */
function translateCoding(vis){
    if (vis === 'life_expectancy'){
        return 'Life Expectancy (in years)'
    }

    else if (vis === 'gdp'){
        return 'GDP (in USD)'
    }

    else if (vis === 'bmi'){
       return 'BMI'
    }

    else if (vis === 'income_resources'){
        return 'Income composition of resources (from 0 to 1)'
    }

    else if (vis === 'schooling'){
        return 'Schooling (in years)'
    }
}



function calculatePercentiles(list){
    let n = list.length;
    let percentile25index = 0.25 * n;
    let percentile50index = 0.5 * n;
    let percentile75index = 0.75 * n;

    let percentilesIndices = {
        25: Math.round(percentile25index+1),
        50: Math.round(percentile50index+1),
        75: Math.round(percentile75index+1)
    }

    
    return percentilesIndices;

}

/**
 * Sorts the data based on values in the different columns
 * @param data - array to sort
 * @param comparisonAttr - which column is the sorting key
 * @returns {this}
 */
function sortingVals(data, comparisonAttr){
    sorted = [...data].sort(function(a,b) {
        if (Number(a[comparisonAttr]) > Number(b[comparisonAttr])) {
            return 1;
        } else if (Number(a[comparisonAttr]) < Number(b[comparisonAttr])) {
            return -1;
        } else {
            return 0;
        }
    });

    return sorted;
}


