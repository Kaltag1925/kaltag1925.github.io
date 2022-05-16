const height = 1000;

const width = 1000;

var k = height / width


function readDataFile() {
  d3.json("artifacts.json").then(f => startMap(f))
}

function startMap(data) {
  setUpMapHelpers(data)
  setUpMap()
  setUpSidebarData(data)
}

var y;
var x;

function setUpMapHelpers(data) {
  x = d3.scaleLinear()
    .domain(d3.extent((data.fragmentData.values()), d => d.x)).nice() //hOW TO MAKE EQUAL SIZED TICKS?
    .range([0, width])
    
  y = d3.scaleLinear()
    .domain(d3.extent((data.fragmentData.values()), d => d.y)).nice() // how to LIMIT SCROLL
    .range([height, 0])
}
    
function xAxis(g, x) {
    g.attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12).tickFormat(d => String.fromCharCode(d)))
    .call(g => g.select(".domain").attr("display", "none"))
    }
    
function yAxis(g, y) {
    g.call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))
    }
    
function grid(g, x, y) {
  g.attr("stroke", "currentColor")
  .attr("stroke-opacity", 0.1)
  .call(g => g
    .selectAll(".x")
    .data(x.ticks(12))
    .join(
      enter => enter.append("line").attr("class", "x").attr("y2", height),
      update => update,
      exit => exit.remove()
    )
      .attr("x1", d => 0.5 + x(d))
      .attr("x2", d => 0.5 + x(d)))
  .call(g => g
    .selectAll(".y")
    .data(y.ticks(12 * k))
    .join(
      enter => enter.append("line").attr("class", "y").attr("x2", width),
      update => update,
      exit => exit.remove()
    )
    .attr("y1", d => 0.5 + y(d))
    .attr("y2", d => 0.5 + y(d)));
  }
        
  var margin = ({top: 25, right: 20, bottom: 35, left: 40})
  var svg;
  var gGrid;
  var gx;
  var gy;
  var chart2;
  var chart;
  var polygons;
  var points;
  var pointsLabels;
  var lines;
  var overlap;

  function setUpMap() {
    svg = d3.select("#map").append("svg")
    .attr("viewBox", [0, 0, width, height]);
    
    gGrid = svg.append("g")

    gx = svg.append("g")

    gy = svg.append("g")
    
    chart2 = svg.append("g")
    chart = chart2.append("g")
    var image = chart.append("image")
      .attr("xlink:href", "./imgs/reallysmallsitemap.png")
    polygons = chart.append("g")
    
    points = chart.append("g")
    overlap = chart.append("g")
    lines = chart.append("g")
    pointsLabels = chart.append("g")

    const zoom = d3.zoom().scaleExtent([0.5, 32])
      .on("zoom", zoomed)

    function zoomed({transform}) {
      console.log(transform)
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
      chart.attr("transform", transform).attr("stroke-width", 5 / transform.k);
      chart.style("stroke-width", 3 / Math.sqrt(transform.k));
      points.attr("r", 10 / Math.sqrt(transform.k));
    gGrid.call(grid, zx, zy)
    };
            
    svg.call(zoom)
      .call(zoom.transform, d3.zoomIdentity)
  
    Object.assign(svg.node(), {
      reset() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
      }
    });
  }


  let transform;


  function plotObject(objectID) {
    points
      .selectAll(objectID)
      .data(sourceData.objectData.get(objectID).fragments.map(id => sourceData.fragmentData.get(id)))
      .join("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("stroke", "green")
        .attr("data", d => (d))
        .attr("r", 10)
        .attr("id", d =>  "point" + d.x + "-" + d.y + "")
    .style("cursor", "pointer")
        .on("click", mapIconClicked)
  }

  function plotPithos(pithosID) {
    points
      .selectAll("pithos")
      .data([[14, 13], [15,12], [16, 20], [17, 12]])
      .join("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("stroke", "pink")
        //.attr("data", d => (d))
        .attr("r", 20)
        .attr("id", d =>  "point" + d.x + "-" + d.y + "")
    // .style("cursor", "pointer")
    //     .on("click", mapIconClicked)
  }

  function addFragmentLabels() {
      pointsLabels.selectAll("pointLabelText")
      .data(objs)
      .join("text")
        .attr("x", d => x(d.location.x))
        .attr("y", d => y(d.location.y))
        .attr("id", d =>  "text" + d.location.x + "-" + d.location.y + "")
        .attr("visibility", "hidden")
        .attr("transform", d => `rotate(-45,${x(d.location.x)},${y(d.location.y)})`)
  }
  
  function mapIconClicked(event, p) {
    console.log(p)
    overlap.selectAll("*").remove();
    lines.selectAll("*").remove();
    // let objectsOnPoint = findObjects(p.id)
    // if (objectsOnPoint.length > 1) {
    //     console.log("multi clicked")
    //     multiobjectClicked(event, p, objectsOnPoint)
    // } else {
        console.log("object clicked")
        objectClicked(p.object)
    // }
  }

  function multiobjectClicked(event, p, objectsOnPoint) {
    overlap
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("fill", "red")
      .selectAll("overlap")
    .data(objectsOnPoint)
      .join("circle")
      .attr("cx", d => x(p.location.x))
        .attr("cy", (d, i) => y(p.location.y) - i * 10)
        .attr("r", 10)
        .on("click", objectClicked)
      .style("cursor", "pointer")
  }



  function objectClicked(objectID) {
    // selectObject(object)

    // overlap.selectAll("*").remove();
    connectRegion(sourceData.objectData.get(objectID).fragments.map(id => sourceData.fragmentData.get(id)).map(frag => [frag.x, frag.y]), objectID)
    model.globalState.selectedObject = objectID
  }

  function connectRegion(points, id) {

    var hull = convexHull(points).map(i => points[i])

    lines.append("g")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0.6)
      .selectAll(id)
      .data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat()) //.data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat())
      .join("line")
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext));

  }

  function shadeObjectRegion(object) {
    var points = object.location.map(l => [parseInt(l.x), l.y])
    var hull = convexHull(points).map(i => points[i]).map(p => x(p[0]) + "," + y(p[1])).join(" ")

    chart.selectAll("polygon")
      .data([hull])
    .enter().append("polygon")
      .attr("points", d => d)
      .attr("fill", "beige"); 
  }
  
  // ID // What does this do?
  // chart.append("g")
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", 10)
  //   .selectAll("text")
  //   .data(data)
  //   .join("text")
  //     .attr("dy", "0.35em")
  //     .attr("x", d => x(d.x) + 7)
  //     .attr("y", d => y(d.y))
  //     .text(d => d.id);

  function setUpSidebarData(data) {
    var nodes = Array.from(data.objectData, objectToNode);
    w2ui['navigation'].add(nodes);
  }

  function objectToNode(pair) {
    var objectID = pair[0]
    var object = pair[1]

    var mainNode = {id: objectID, text: object.name, count: object.fragments.length, nodes: object.fragments.map(fragmentToNode)};
    return mainNode;
  }
  
  function fragmentToNode(fragmentID) {
    console.log(fragmentID)
        return { id: fragmentID, text: sourceData.fragmentData.get(fragmentID).name, onClick: function(event) {
            // find svg node based on position ID
            // make it beeeg
        // d3.select("#" + "point" + fragment.x + "-" + fragment.y + "").attr("r", 100)
        }}
  }