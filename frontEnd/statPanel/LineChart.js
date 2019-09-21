const moment = require('moment');


module.exports = class LineChart{
  constructor(){
    this.margin = { top: 10, right: 14, bottom: 20, left: 40 };
    this.dataset = [];
    this.className = '';
  }

  render(className, dataset, maxY = undefined){

    this.dataset = dataset;
    this.className = className;
    this.maxY = maxY;

    this._renderGraph();

    //Resize event to make chart responsive.
    $(window).resize(() => {this._resizeGraph();});
  }

  refresh(dataSet){

    // Update reference so other methods can use most recent data.
    this.dataset = dataSet;
    this.maxY = undefined;

    // Partially re-renders graph
    this._refresh(this.dataset);


    // Redo scale
    // select graph
    // change line / area?
    // change axis y

  }

  _renderGraph(){

    const className = this.className,
          dataset = this.dataset,
          maxY = this.maxY;


    // Get wrapper atts
    const wrapper = this._getWrapperAtts(className);

    // Set graph dimensions
    const width = wrapper.width - this.margin.left - this.margin.right;
    const height = wrapper.height - this.margin.top - this.margin.bottom;


    // Data parsing
    const bisectDate = d3.bisector((d) => { return d[0]; }).left;
    const dateFormatter = d3.time.format("%m/%d");


    // Set scale ranges
    const x = d3.time.scale().range([0, width]);
    const y = d3.scale.linear().range([height, 0]);

    // Set domain
    x.domain([dataset[0][0].startOf('day'), dataset[dataset.length - 1][0]]);
    y.domain([0, (maxY!=undefined) ? maxY : d3.max(dataset, (d)=> d[1])]);

    // Set axises
    this.xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(this._getXAxisTickCount(wrapper.width))
      .tickFormat(dateFormatter);

    this.yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .innerTickSize(-(width + this.margin.right))
      .ticks(this._getYAxisTickCount(wrapper.height))
      .tickPadding(10);


    // Set line
    this.line = d3.svg.line()
      .x((d) => { return x(d[0]); })
      .y((d) => { return y(d[1]); });


   // Set area
   this.area = d3.svg.area()
     .x((d) => { return x(d[0]); })
     .y0(y(0))
     .y1((d) => { return y(d[1]); });


    // Set svg
    this.svg = d3.select("." + className).append("svg")
              .attr("width", width + this.margin.left + this.margin.right)
              .attr("height", height + this.margin.top + this.margin.bottom)
              .append("g")
              .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    //Tool tip
    const tooltip = d3.select("." + className).append("div")
      .attr("class", "tooltip")
      .style("display", "none");


    // Add axises
    this.svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + (height + 2) + ")")
       .call(this.xAxis);

    let yAxis = this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis);


    // Gradient fill
    const gradient = this.svg.append("defs")
      .append("linearGradient")
      .attr("id","areaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1551b5")
      .attr("stop-opacity", 0.25);
    gradient.append("stop")
      .attr("offset", "90%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0);


    // Add area
    let grad = this.svg.append("path")
      .datum(dataset)
      .style("fill", "url(#areaGradient)")
      .attr("d", this.area);


    // Add line
    let line = this.svg.append("path")
      .datum(dataset)
      .attr("class", "line")
      .attr("d", this.line);

    let dots = this.svg.selectAll(".dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", function(d, i) { return x(d[0]); })
      .attr("cy", function(d) { return y(d[1]); })
      .attr("r", 2);


    // Hover effect
    const focus = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle")
      .attr("r", 5);

    const tooltipDate = tooltip.append("div")
      .attr("class", "tooltip-date");

    const tooltipPoints = tooltip.append("div");
    tooltipPoints.append("span")
      .attr("class", "tooltip-title")
      .text("Points: ");

    const tooltipPointValue = tooltipPoints.append("span")
      .attr("class", "tooltip-points");

    let rect = this.svg.append("rect");
    rect.attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); tooltip.style("display", null);  })
        .on("mouseout", function() { focus.style("display", "none"); tooltip.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {   ///x, dataset, this, wrapper, focus, tooltip

      let x0 = x.invert(d3.mouse(rect[0][0])[0]); //rect[0][0] is the outerHtml element of the rect object. 
      let i = bisectDate(dataset, x0, 1);
      let d0 = dataset[i - 1];
      let d1 = dataset[i];
      if(d0==undefined || d1==undefined) return; //to prevent error when cursor reaches border.
      let d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
      let xOffset = 60;
      let ttWidth = 94;
      let xPos = x(d[0]) + xOffset;
      let yPos = y(d[1]);
      xPos = ((xPos + ttWidth) > wrapper.width) ? xPos - xOffset - ttWidth : xPos;
      focus.attr("transform", "translate(" + x(d[0]) + "," + y(d[1]) + ")");
      tooltip.attr("style", "left:" + (xPos) + "px; top:" + yPos + "px;");
      tooltip.select(".tooltip-date").text(d[0].format("D MMM, YY"));
      tooltip.select(".tooltip-points").text(d[1]);
    }

    // Method for refrashing the graph with new data.
    this._refresh = (dataset) => {

      // Recalculate Y domain
      y.domain([0, d3.max(dataset, (d)=> d[1])]);

      // Recalculate elements
      line.transition().duration(750).attr("d", this.line(dataset));
      grad.transition().duration(750).attr("d", this.area(dataset));
      yAxis.transition().duration(750).call(this.yAxis);
      dots.data(dataset).transition().duration(750).attr("cy", function(d) { return y(d[1]); });

    };


  }

  _resizeGraph(){

    const container = $('.' + this.className);

    if(container.length == 0){
      $(window).off('resize');
      return;
    }

    container.empty();
    this._renderGraph();

  }


  //---------------- Utilitie ------------------//

  _getWrapperAtts(className){
    const elem = $('.' + className);
    return {
      width: elem.width(),
      height: elem.height()
    };
  }

  _getXAxisTickCount(width){
    const spacePerTick = 80; //px
    return Math.ceil(width/spacePerTick);
  }

  _getYAxisTickCount(height){
    const spacePerTick = 30; //px
    return Math.ceil(height/spacePerTick);
  }
};
