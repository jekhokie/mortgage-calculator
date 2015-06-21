$(document).ready(function() {
  var height     = 300,                         // height of graph
      width      = 300,                         // width of graph
      radius     = Math.min(width, height) / 2, // radius of graph
      transition = 800;                         // speed of transitions (ms)

  // initialize svg
  var svg = d3.select("#chart").append("svg").append("g");
      svg.append("g").attr("class", "slices");
      svg.append("g").attr("class", "labels");
      svg.append("g").attr("class", "lines");

  // create the pie values
  var pie = d3.layout.pie().sort(null).value(function(d) { return d.value; });

  // create the arc calculations
  var arc      = d3.svg.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);
  var outerArc = d3.svg.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var key   = function(d){ return d.data.label; };
  var color = d3.scale.category20c();

  // initialize based on form default data
  calculateAndDraw();

  // handle when the user wants to re-calculate
  $("#calculate-cost").on("click", function(e) {
    e.preventDefault();
    calculateAndDraw();
  });

  // wrapper function to calculate payments, update charts, dollar amounts, etc.
  function calculateAndDraw() {
    var pAndI     = calculatePI();
    var taxes     = $("#taxes").val() / 12;
    var insurance = $("#insurance").val() / 12;

    var breakdown = [
                      { label: "P&I",       value: pAndI },
                      { label: "Taxes",     value: taxes },
                      { label: "Insurance", value: insurance }
                    ];

    // draw the charts and labels
    drawChart(breakdown, (pAndI + taxes + insurance));

    // update the breakdowns
    $("#principalInterestBreakdown").html(numeral(pAndI).format("$0,0.00"));
    $("#taxesBreakdown").html(numeral(taxes).format("$0,0.00"));
    $("#insuranceBreakdown").html(numeral(insurance).format("$0,0.00"));

    // clear and update the amortization schedule
    $("#amortization-table tbody").html("");

    var currentInterest  = 0;
    var currentPrincipal = 0;
    var totalInterest    = 0;
    var totalPrincipal   = 0;
    var totalMoney       = 0;
    var rate             = $("#rate").val() / 100 / 12;
    var balance          = $("#amount").val();

    for (var i = 0; i < ($("#years").val() * 12); i++) {
      currentInterest  = rate * balance;
      currentPrincipal = pAndI - currentInterest;
      balance          = balance - currentPrincipal;
      totalInterest    = totalInterest + currentInterest;
      totalPrincipal   = totalPrincipal + currentPrincipal;

      $("<tr>" +
        "  <td class='amortization-first-column'>" + (i + 1)                                     + "</td>" +
        "  <td>" + numeral(currentInterest).format("$0,0.00")  + "</td>" +
        "  <td>" + numeral(currentPrincipal).format("$0,0.00") + "</td>" +
        "  <td>" + numeral(balance).format("$0,0.00")          + "</td>" +
        "</tr>").appendTo("#amortization-table tbody");
    }

    $("<tr id='amortization-totals'>" +
      "  <td class='amortization-first-column'>TOTAL:</td>" +
      "  <td>" + numeral(totalInterest).format("$0,0.00")                  + "</td>" +
      "  <td>" + numeral(totalPrincipal).format("$0,0.00")                 + "</td>" +
      "  <td>" + numeral(totalInterest + totalPrincipal).format("$0,0.00") + "</td>" +
      "</tr>").appendTo("#amortization-table tbody");

    // update the total cost section based on calculated actuals
    $("#principalTotal").html(numeral(totalPrincipal).format("$0,0.00"));
    $("#interestTotal").html(numeral(totalInterest).format("$0,0.00"));
    $("#mortgageTotal").html(numeral(totalPrincipal + totalInterest).format("$0,0.00"));
  }

  // calculate the combined principal and interest payment
  function calculatePI() {
    // calculate costs for each value - currently assumes 12 payments (12 months per year)
    // M = P [ i (1 + i)^n ] / [ (1 + i)^n - 1 ]
    var principal = $("#amount").val();
    var months    = $("#years").val() * 12;
    var rate      = $("#rate").val() / 100 / 12;  // assumes payment per month
    return principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  };

  // re-draw the graph with the calculated costs
  function drawChart(data, payment) {
    // calculate and assign slices
    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key);
    slice.enter()
      .insert("path")
      .style("fill", function(d) { return color(d.data.label); })
      .attr("class", "slice");
    slice
      .transition().duration(transition)
      .attrTween("d", function(d) {
        this._current   = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current   = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      })
    slice.exit().remove();

    // calculate and assign labels
    var text = svg.select(".labels").selectAll("text").data(pie(data), key);
    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data.label;
      });

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(transition)
      .attrTween("transform", function(d) {
        this._current   = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current   = interpolate(0);

        return function(t) {
          var d2  = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0]  = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d) {
        this._current   = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current   = interpolate(0);

        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });
    text.exit().remove();

    // calculate and assign label lines to slices
    var polyLine = svg.select(".lines").selectAll("polyline").data(pie(data), key);
    polyLine.enter().append("polyline");
    polyLine.transition().duration(transition)
      .attrTween("points", function(d) {
        this._current   = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current   = interpolate(0);

        return function(t) {
          var d2  = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0]  = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [ arc.centroid(d2), outerArc.centroid(d2), pos ];
        };
      });
    polyLine.exit().remove();

    // apply the label wth the total payment to the graph
    d3.select("#chart svg text[text-anchor='middle']").remove();
    d3.select("#chart svg")
      .append("text")
      .attr("x", 150)
      .attr("y", 158)
      .attr("text-anchor", "middle")
      .text("$" + payment.toFixed(2));
  };
});
