function clean_num(type){
	if(dec === 1){
	  	var num = (Math.round(type*100)/100).toLocaleString('en');
	  	if(num < 1000 & num >= 100){
	  		while(num.length < 6){
		  		if(num.indexOf('.') === -1){
		  			num = num + '.';
		  		}
	  			num = num + '0';
	  		};
	  	}
	  	else if(num < 100 & num >= 10){
	  		while(num.length < 5){
		  		if(num.indexOf('.') === -1){
		  			num = num + '.';
		  		}
	  			num = num + '0';
	  		};
	  	}
	  	else{
	  		while(num.length < 4){
		  		if(num.indexOf('.') === -1){
		  			num = num + '.';
		  		}
	  			num = num + '0';
	  		};
	  	};
	  }
	else{
		var num = (Math.round(type)).toLocaleString('en');	
	};

	return num.toLocaleString('en');
};

function show_result(){
  var end_val_a = clean_num(value);
  var msg = "Your initial investment of $" + intro_val + " is now worth $" + end_val_a + ".";
  var end_val = clean_num(value_m);
  if(invest_start == 1){
    var msg1 = "If you had made no trades during this time period, your account would now be worth: $" + end_val +".";
  }
  else{
    var msg1 = "If you had entered the market at the beginning of the time period and made no subsequent trades (i.e., buy and hold), your account would now be worth: $" + end_val + ".";
  };
  $('.val_m').text(end_val);   
  $('#trade_screen').addClass('hidden');
  $("#date_message").html(dates);
  //$("#name").html(ID);
  $("#end_msg").html(msg);
  $("#end_msg1").html(msg1);
};

function createSubset(data, years) {
  return data_weeks = data.length,
         target_weeks = years * 52,
         max_index = data_weeks - target_weeks,
         start_index = Math.floor(Math.random() * max_index),
         data.slice(start_index, start_index + target_weeks)
}

function toPctChg(data) {
  return baseline = data[0].close, data.map(function(data) {
      return {
          date: data.date,
          close: data.close,
          pct_close: (data.close - baseline) / baseline * 100,
          sold: 0,
          bought: 0
      }
  })
}

var GET = {};
params = window.location.search;
if(params.indexOf('?Game=') === 0){
	var code = params.substring(6);
	var params = '?' + atob(code);
}

var query = params.substring(1).split("&");
for (var i = 0, max = query.length; i < max; i++)
{
    if (query[i] === "")
        continue;

    var param = query[i].split("=");
    GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
};

if(GET["amt"] === undefined){
	var value = 10000;
	var value_m = 10000;
	var start_amt = 10000;
	var dec = 0;
}
else{
	var value = GET["amt"];
	var value_m = GET["amt"];
	var start_amt = GET["amt"];
	var dec = 1;
	if(value >= 1000){
		var dec = 0;
	}
};

if(GET["years"] === undefined){
	var years = 10;
}
else{
	var years = GET["years"];
};

if(GET["speed"] === undefined){
	var speed = 100;
}
else{
	var speed = GET["speed"];
};

if(GET["inv"] === undefined){
	var invest_start = "1";
}
else{
	var invest_start = GET["inv"];
};

var ID = GET["id"];
var exp_date = Date.now();
var invested = parseInt(invest_start);
var shares_m;
var shares = 0;
var price;

var intro_val = clean_num(value);
$('.val').text(intro_val);
$('.initial').text(intro_val);

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%m/%d/%y");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.pct_close); });

var outputData = [  
        {
            ID: [ID],
            amt: [start_amt],
            exp_date: [exp_date],
            years: [years],
            speed: [speed],
            invest_start: [invest_start],
            date_b: [],
            date_e: [],
            close_b: [],
            close_e: [],
            sell_n: [],
            sell_d: [],
            sell_c: [],
            buy_n: [],
            buy_d: [],
            buy_c: [],
            value_a: [],
            value_nt: [],
        },
    ];



function begin(){
  d3.csv("data/sp_july_2017.csv", function(d) {
    d.date = parseTime(d.date);
    d.close = parseFloat(d.close);
    return d;
  }, function(error, data) {
    if (error) throw error;

    data.reverse();

    var subset = createSubset(data, years);

    var sub_p = toPctChg(subset);

    date_begin = sub_p[0].date;
    outputData[0].date_b.push(date_begin);

    date_end = sub_p[sub_p.length-1].date;
    outputData[0].date_e.push(date_end);

    close_begin = sub_p[0].close;
    outputData[0].close_b.push(close_begin);

    close_end = sub_p[sub_p.length-1].close;
    outputData[0].close_e.push(close_end);

    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];

    dates = "Above is the performance of the S&P 500 from the week of " + monthNames[date_begin.getMonth()] + " " + date_begin.getDate() + ", " + date_begin.getFullYear() + " to the week of " + monthNames[date_end.getMonth()] + " " + date_end.getDate() + ", " + date_end.getFullYear() + ".";

    

    function update(num){

      if(invested === 0){
        $('#trade').text('Buy / Put Back');
        $('#trade').addClass('buy');
      }
      else{
        $('#trade').text('Sell / Remove');
        $('#trade').addClass('sell');
      };

      d3.select("#trade").on("click", function() {
        if(invested === 1){
          $('#trade').removeClass('sell');
          $('#trade').addClass('hidden');
          invested = 0;
          shares = 0;
          outputData[0].sell_n.push(elapsed-1);
          outputData[0].sell_d.push(sub_p[elapsed-1].date);
          outputData[0].sell_c.push(sub_p[elapsed-1].close);
          sub_p[elapsed-1].sold++;
        }
        else{
          $('#trade').removeClass('buy');
          $('#trade').addClass('hidden');
          shares = value/price;
          invested = 1;
          outputData[0].buy_n.push(elapsed-1);
          outputData[0].buy_d.push(sub_p[elapsed-1].date);
          outputData[0].buy_c.push(sub_p[elapsed-1].close);
          sub_p[elapsed-1].bought++;
        }
      });

      g.selectAll("g").remove();
      g.selectAll("path").remove();
      g.selectAll("circle").remove();

      var trial = sub_p.slice(0,num);

      x.domain(d3.extent(trial, function(d) { return d.date; }));
      y.domain(d3.extent(trial, function(d) { return d.pct_close; }));


      var yAxis = d3.axisLeft(y);

      yAxis.tickFormat(function(d) { return d + "%"; });

      g.append("g")
        .call(yAxis)
        .append("text")
        .transition()

      g.append("path")
        .datum(trial)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.75)
        .attr("d", line)

      g.selectAll("dot")
        .data(trial)
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
        .attr("cy", function(d) { return y(d.pct_close); });

      price = sub_p[num-1].close;

      if(num === 1){
        shares_m = value_m/price;
      };

      value_m = shares_m*price;

      if(num === 1 && invested === 1){
        shares = value/price;
      };

      if(invested === 1){
        value = shares*price;

      };

    if(value === parseFloat(start_amt)){
        $('#trade_val_2').removeClass('up');
        $('#trade_val_2').removeClass('down');
        $('#trade_val_2').addClass('same');
      }
      else if(value > parseFloat(start_amt)){
        $('#trade_val_2').removeClass('down');
        $('#trade_val_2').removeClass('same');
        $('#trade_val_2').addClass('up');
      }
      else{
        $('#trade_val_2').removeClass('up');
        $('#trade_val_2').removeClass('same');
        $('#trade_val_2').addClass('down');
      };
    };
        
    var elapsed = 1;

    function start(){
      if(invested === 0){
  		  $('#trade').text('Buy / Put Back');
      	$('#trade').removeClass('sell');
      	$('#trade').addClass('buy');
      };
      $('#start_screen').addClass('hidden');
      $('#trade_screen').removeClass('hidden');
      
      update(elapsed);
      var elapsed_interval = setInterval(function() {
        elapsed++;
        if(elapsed > subset.length) {
            clearInterval(elapsed_interval);
            setTimeout(show_result());
            outputData[0].value_a.push(value);
            outputData[0].value_nt.push(value_m);
            final_data = JSON.stringify(outputData);
            $.ajax({
              type:'post',
              url: 'echo.py',
              data: {json: final_data},
            });
        }
        else{
          update(elapsed);
          var curr_val = clean_num(value);
          $('.val').text(curr_val);
        };        
      }, speed);
    };
    start();
  });
};