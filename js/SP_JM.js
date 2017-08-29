/*
Javascript script to power "market_game"

Created by: Josh Morris
Last Edited: 8/28/2017
*/

/*
Variable Declarations and Default Values
==================================================================================
*/

var initialValue = 10000; 					//value initially available to invest in account
var userCurrentValue = initialValue; 		//current value of user account
var marketCurrentValue = initialValue; 		//current hypothetical value of account if no trades / buy and hold
var years = 10; 							//length of time period in years
var speed = 100;							//time between weeks (in milliseconds)
var inMarketDefault = true;					//boolean indicating whether user begins in market by default
var inMarketCurrent = inMarketDefault;		//boolean indicating whether user is currently in market
var realDate = Date.now();					//the current date of user activity
var ID = realDate.toString();				//user identifier
var userCurrentShares = 0;					//number of shares currently owned by user
var marketCurrentShares = 0;				//number of hypothetical shares if no trades / buy and hold
var currentPrice;							//current price of 1 share
var lastTradeDate;							//last date to have a trade
var lastTradeWeek;							//last week number to have a trade
var lastTradePrice;							//closing price of last trade
var totalTrades = 0;						//total number of trades
var dataFile = 'data/sp_july_2017.csv';		//file to pull investment data from
var datesText;								//text indicating periods displayed at end of investment
var subset;									//subsetted data
var weekResults;							//active weekData object
var outputData;								//output object
var finalData;								//JSON output


/*
Update Variables based on URL Parameters
==================================================================================
*/

//Converts URL Text to array of parameters
function getURLParameters() {
	var parameters = {};	
	var urlText = window.location.search;

	//Decodes parameters if encoded in 'Game' parameter
	if (urlText.indexOf('?Game=') === 0) {
		var encodedURLText = urlText.substring(6);
		urlText = '?' + atob(encodedURLText);
	};

	var queryValuePairs = urlText.substring(1).split("&");
	for (var i = 0; i < queryValuePairs.length; i++) {		
    	if (queryValuePairs[i] === "") {
        	continue;
    	}

    	var queryValueObj = queryValuePairs[i].split("=");
    	parameters[decodeURIComponent(queryValueObj[0])] = decodeURIComponent(queryValueObj[1] || "");
    };

    return parameters;
};


//Updates variables with values from parameters
function changeDefaultValues(parameters) {
	if (parameters["id"] != undefined) {
		ID = parameters["id"];
	};

	if (parameters["amt"] != undefined) {
		initialValue = parameters["amt"];
		userCurrentValue = initialValue;
		marketCurrentValue = initialValue;
	};

	if (parameters["years"] != undefined) {
		years = parameters["years"];
	};

	if (parameters["speed"] != undefined) {
		speed = parameters["speed"];
	};

	if (parameters["inv"] != undefined) {
		inMarketDefault = Boolean(Number(parameters["inv"]));
		inMarketCurrent = inMarketDefault;
	};
};


changeDefaultValues(getURLParameters());


/*
Preparing Output Data
==================================================================================
*/

//Main Output Data
outputData = {
            ID: ID,
            initialValue: initialValue,
            realDate: realDate,
            years: years,
            speed: speed,
            inMarketDefault: inMarketDefault,
            startDate: undefined,
            endDate: undefined,
            startClose: undefined,
            endClose: undefined,
            userFinalValue: undefined,
            marketFinalValue: undefined,
            totalTrades: undefined,
            weeklyData: []
        };


//Constructor to build each weekData object where weekly information will be stored
function weekData(weekNum, date) {
    this.week = weekNum;
    this.date = date;
    this.currentPrice = currentPrice;
    this.inMarketCurrent = inMarketCurrent;
    this.userCurrentValue = userCurrentValue;
    this.marketCurrentValue = marketCurrentValue;
    this.lastTradeDate = lastTradeDate;
    this.lastTradeWeek = lastTradeWeek;
    this.lastTradePrice = lastTradePrice;
    this.totalTrades = totalTrades;
    this.trade = false;
}


/*
Helper Functions 
==================================================================================
*/

//Converts number to string with thousand commas; two decimal places if value is less than 1,000
function cleanNum(num) {
	num = parseFloat(num);
	if (num < 1000) {
		numStr = num.toFixed(2);
	}
	else {
		numStr = num.toFixed();
	}

	return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


//Creates a random continuous subset of inputted data
//Subset length is an inputted parameter equal to the number of years
function createSubset(data, years) {
 	var totalNumWeeks = data.length;
 	var targetNumWeeks = years * 52;
 	var maxIndex = totalNumWeeks - targetNumWeeks;
 	var startIndex = Math.floor(Math.random() * maxIndex);

 	return data.slice(startIndex, startIndex + targetNumWeeks);
}


//Prints output of investment to screen
function showResult() {
  	var text1 = "Your initial investment of $" + cleanNum(initialValue) + " is now worth $" + cleanNum(userCurrentValue) + ".";
  	if (inMarketDefault == true) {
    	var text2 = "If you had made no trades during this time period, your account would now be worth: $" + cleanNum(marketCurrentValue) +".";
  	}
  	else {
    	var text2 = "If you had entered the market at the beginning of the time period and made no subsequent \
    	trades, your account would now be worth: $" + cleanNum(marketCurrentValue) + ".";
  	};
  
  	$('#tradeScreen').addClass('hidden');
  	$("#dateMessage").html(datesText);
  	$("#endMsg1").html(text1);
 	$("#endMsg2").html(text2);
};


//Adds pct change from initial price; sold and bought dummies as properties to data 
function enhanceData(data) {
	var initialPrice = data[0].close;
	var updatedData = data.map(function(data) {
		return {
			date: data.date,
			close: data.close,
			pctClose: (data.close - initialPrice) / initialPrice * 100,
          	sold: 0,
          	bought: 0
    	};
	});
	return updatedData;
};


/*
Add Stuff to Screen
==================================================================================
*/

//Add initial and current values to screen
$('.initialValueText').text(cleanNum(initialValue));
$('.currentValueText').text(cleanNum(userCurrentValue));


//Add svg
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Set date format (if displayed)
var parseTime = d3.timeParse("%m/%d/%y");


//Set x-axis size
var x = d3.scaleTime()
    .rangeRound([0, width]);


//Set y-axis size
var y = d3.scaleLinear()
    .rangeRound([height, 0]);


//Prepare line
var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.pctClose); });


/*
Launching Investment Game
==================================================================================
*/

//Records data endpoints for user
//Adds properties to data
//Sets global variables
function initializeData() {
	//Records data endpoints for user
    var startDate = subset[0].date;
    outputData.startDate = startDate;

    var endDate = subset[subset.length-1].date;
    outputData.endDate = endDate;

    var startClose = subset[0].close;
    outputData.startClose = startClose;

    var endClose = subset[subset.length-1].close;
    outputData.endClose = endClose;

    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
    
    datesText = "Above is the performance of the S&P 500 from the week of " + monthNames[startDate.getMonth()] + " " + 
    startDate.getDate() + ", " + startDate.getFullYear() + " to the week of " + monthNames[endDate.getMonth()] + 
    " " + endDate.getDate() + ", " + endDate.getFullYear() + ".";

    //Adds properties to data
    subset = enhanceData(subset);

    //Sets global variables
    currentPrice = startClose;
    marketCurrentShares = marketCurrentValue / currentPrice;
    if (inMarketDefault) {
    	userCurrentShares = marketCurrentShares;
    	lastTradeDate = startDate;
    	lastTradeWeek = 0;
    	lastTradePrice = startClose;
    	totalTrades++;
    }
}; 


//Records a trade in global variables
function updateTradeVars(weekNum) {
	weekResults.trade = true;
	lastTradeDate = subset[weekNum].date;
	lastTradeWeek = weekNum;
	lastTradePrice = subset[weekNum].close;
	totalTrades++;
}


//Updates global variables to reflect a trade
//Flips trade button on screen
function trade(weekNum) {
	if (inMarketCurrent) {
		$('#trade').removeClass('sell');
		$('#trade').addClass('hidden');
		inMarketCurrent = false;
		userCurrentShares = 0;
		subset[weekNum].sold++;
		updateTradeVars(weekNum);
	}
	else {
		$('#trade').removeClass('buy');
      	$('#trade').addClass('hidden');
      	inMarketCurrent = true;
		userCurrentShares = userCurrentValue / currentPrice;
		subset[weekNum].bought++;
		updateTradeVars(weekNum);
      }
};


//Builds a graph using all presented data so far
function createGraph(weekNum) {
	//Remove all elements of previous graph
	g.selectAll("g").remove();
  	g.selectAll("path").remove();
  	g.selectAll("circle").remove();

  	//Get subset of data for new graph
  	var weekSubset = subset.slice(0,weekNum + 1);
	x.domain(d3.extent(weekSubset, function(d) { return d.date; }));
	y.domain(d3.extent(weekSubset, function(d) { return d.pctClose; }));

	//Set y-Axis
  	var yAxis = d3.axisLeft(y);
  	yAxis.tickFormat(function(d) { return d + "%"; });

  	//Add data to graph
  	g.append("g")
  		.call(yAxis)
	    .append("text")
	    .transition()

	g.append("path")
	  	.datum(weekSubset)
	    .attr("fill", "none")
	    .attr("stroke", "black")
	    .attr("stroke-linejoin", "round")
	    .attr("stroke-linecap", "round")
	    .attr("stroke-width", 1.75)
	    .attr("d", line)

	g.selectAll("dot")
    	.data(weekSubset)
    	.enter().append("circle")
    	.attr("r", 7)
    	.style("fill", function(d) {
    	if (d.sold > d.bought) {return "#F5811F"}
    	if (d.bought > d.sold) {return "#008D97"}
    	if (d.bought > 0 && d.sold > 0 && d.bought === d.sold) {return "black"}
    	;})
    	.style("display", function(d) {
    	if (d.bought === 0 && d.sold === 0) {return "none"}
    	;})
    	.attr("cx", function(d) { return x(d.date); })
    	.attr("cy", function(d) { return y(d.pctClose); });
};


//Updates price and value global variables and their appearance on screen
function updateValue(weekNum) {
	currentPrice = subset[weekNum].close;

	marketCurrentValue = marketCurrentShares * currentPrice;
	if (inMarketCurrent) {
		userCurrentValue = userCurrentShares * currentPrice;
	};

	$('.currentValueText').text(cleanNum(userCurrentValue));

	if (userCurrentValue === initialValue) {
        $('#currentValue').removeClass('up');
        $('#currentValue').removeClass('down');
        $('#currentValue').addClass('same');
    }
    else if (userCurrentValue > initialValue) {
        $('#currentValue').removeClass('down');
        $('#currentValue').removeClass('same');
        $('#currentValue').addClass('up');
    }
    else {
        $('#currentValue').removeClass('up');
        $('#currentValue').removeClass('same');
        $('#currentValue').addClass('down');
    };
};
    

//Updates screen graphics and text
function updateGraphics(weekNum) {	
	updateValue(weekNum);
	createGraph(weekNum);
	if ($('#trade').hasClass('hidden')) {
		if (!inMarketCurrent) {
	        $('#trade').text('Buy / Put Back');
	        $('#trade').addClass('buy');
	        $('#trade').removeClass('hidden');
	    }
	    else {
	        $('#trade').text('Sell / Remove');
	        $('#trade').addClass('sell');
	        $('#trade').removeClass('hidden');
	    };
	};
};


//Presents results on screen and posts results object to server
function end() {
	showResult();
	outputData.userFinalValue = userCurrentValue;
	outputData.marketFinalValue = marketCurrentValue;
	outputData.totalTrades = totalTrades;
	finalData = JSON.stringify(outputData);
	$.ajax({
              type:'post',
              url: 'echo.py',
              data: {json: finalData},
          });
};


//Loops through each week
	//Add graphics to screen
	//Adds prior weekData object to output data
	//Creates new weekData object
	//Allows trading for 'speed' ms
function runInvestment() {
	if (!inMarketDefault) {
		$('#trade').text('Buy / Put Back');
		$('#trade').removeClass('sell');
		$('#trade').addClass('buy');
	}

 	$('#startScreen').addClass('hidden');
	initializeData();
	var week = 0;
 	updateGraphics(week);
 	weekResults = new weekData(week,subset[week].date);

	$('#tradeScreen').removeClass('hidden');
	d3.select("#trade").on("click", function() {
		trade(week);
    });

	var weekInterval = setInterval(function() {
		week++;

		if (week >= subset.length) {
			outputData.weeklyData[week - 1] = weekResults;
			clearInterval(weekInterval);
			end();
		}
		else {
			updateGraphics(week);
			outputData.weeklyData[week - 1] = weekResults;
			weekResults = new weekData(week,subset[week].date);
		};
	}, speed);
};


//Prepares data for launch
function begin() {
	d3.csv(dataFile, function(d) {
		d.date = parseTime(d.date);
    	d.close = parseFloat(d.close);
    	return d;
    }, function(data) {
    	data.reverse();
    	subset = createSubset(data, years);
    	runInvestment();
    });
};