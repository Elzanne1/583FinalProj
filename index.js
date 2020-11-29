
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

            //console.log(data);

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

            console.log(life_extent, bmi_extent, gdp_extent, income_extent, schooling_extent);

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

            let countrySVGs = setSVGs(countryDivs,lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);

            // updateDataState(data);


            setButtons(data, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale, countrySVGs);



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

function setSVGs(countryDivs, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale){
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

    showData(countrySVGs, scale );
    return countrySVGs;
}

function showData(countrySVGs, scale){
    let info = document.querySelector('#info');
    info.textContent = `Currently Showing: ${translateCoding(vis)}`;
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

    let values = countrySVGs
        .append('text')
        .attr('y', '5')
        .attr('font-weight', 'bold')
        .attr('font-size', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.004;
        })
        .attr('x', function(d){
            return scale(d[vis]) - 25;
        })
        .attr('dy', function(){
            return document.querySelector('.countryDivs').clientWidth * 0.001;
        })
        .text(function(d){
            let num = Number(d[vis]);
            return String(num.toFixed(3));
        });
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
function setButtons(data, lifeScale, bmiScale, gdpScale, incomeScale, schoolScale, countrySVGs){
    let btnLE = document.getElementById('LE');

    btnLE.onclick = function(){
        vis = 'life_expectancy';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);

    }

    let btnBMI = document.getElementById('BMI');
    btnBMI.onclick = function(){
        vis = 'bmi';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);

    }

    let btnGDP = document.getElementById('GDP');
    btnGDP.onclick = function(){
        vis = 'gdp';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);

    }

    let btnIC = document.getElementById('IC');
    btnIC.onclick = function(){
        vis = 'income_resources';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);

    }
    
    let btnS = document.getElementById('S');
    btnS.onclick = function(){
        vis = 'schooling';
        let scale = getScale( lifeScale, bmiScale, gdpScale, incomeScale, schoolScale);
        showData(countrySVGs, scale);
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
    let percentile25index = 0.25 * n-1;
    let percentile75index = 0.75 * n-1;

    let percentilesIndices = {
        25: percentile25index,
        75: percentile75index
    }
    
    return percentilesIndices;

}


