function show_notrade(){
      $('.val_m').text(Math.round(value_m).toLocaleString('en'));
      $('#notrade').removeClass('hide');
      $('#trade_screen').addClass('hidden');
      $("#date_message").html(dates);
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

var ID = Date.now();
var years = 10;
var speed = 100;
var invested = 1;
var value = 10000;
var value_m = 10000;
var shares_m;
var shares = 0;
var price;

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
            exp_date: [ID],
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
  d3.csv("data/sp500-50yr.csv", function(d) {
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

    // sells = [];
    // buys = [];

    // sells_date = [];
    // buys_date = [];

    // sells_close = [];
    // buys_close = [];

    d3.select("#trade").on("click", function() {
      if(invested === 1){
        $('#trade').text('Buy');
        $('#trade').removeClass('sell');
        $('#trade').addClass('buy');
        invested = 0;
        shares = 0;
        outputData[0].sell_n.push(elapsed-1);
        outputData[0].sell_d.push(sub_p[elapsed-1].date);
        outputData[0].sell_c.push(sub_p[elapsed-1].close);
        sub_p[elapsed-1].sold = 1;
      }
      else{
        $('#trade').text('Sell');
        $('#trade').removeClass('buy');
        $('#trade').addClass('sell');
        shares = value/price;
        invested = 1;
        outputData[0].buy_n.push(elapsed-1);
        outputData[0].buy_d.push(sub_p[elapsed-1].date);
        outputData[0].buy_c.push(sub_p[elapsed-1].close);
        sub_p[elapsed-1].bought = 1;
      }
    });

    function update(num){

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
        if (d.sold === 1) {return "#F5811F"}
        if (d.bought === 1) {return "#008D97"}
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
    };
        
    var elapsed = 1;

    function start(){
      $('#start_screen').addClass('hidden');
      $('#trade_screen').removeClass('hidden');
      $('#trade_val').removeClass('hidden');
      var elapsed_interval = setInterval(function() {
        update(elapsed);
        $('.val').text(Math.round(value).toLocaleString('en'));
        elapsed++;

        if(elapsed > subset.length) {
            clearInterval(elapsed_interval);
            setTimeout(show_notrade());
            outputData[0].value_a.push(value);
            outputData[0].value_nt.push(value_m);
            final_data = JSON.stringify(outputData);
            $.ajax({
              type:'post',
              url: 'echo.py',
              data: {json: final_data},
            });
        };
      }, 100);
    };
    start();
  });
};