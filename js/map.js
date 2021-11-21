const height = 1000;

const width = 1000;

var k = height / width


function readDataFile() {
  d3.json("artifacts.json").then(f => startMap(f))
}

function startMap(data) {
  setUpMapHelpers(data)
  setUpMap()
  //plotFragments(data)
  //addFragmentLabels(data)
  setUpSidebarData(data)
  // loadState(null)
}

// function loadData(dataFile) {
//   console.log(dataFile)
//   data = dataFile.UluburunShipwreck.artifact.map(a => a = {location: a.location.map((l, index) => assembleFragment(l, a._name, index)), description: a.description, _type: a._type, _name: a._name});
//   var objectsWithALocation = data.map(o => o.location.map(l => ({id: "point" + l.x + "-" + l.y, location: l, object: o}))).flat()

//   objs = Array.from(groupBy(objectsWithALocation, o => o.id))
//   objs = objs.map(o => ({id: o[0], location: ({x: o[1][0].location.x, y: o[1][0].location.y}), objects: o[1].map(v => v.object)}))

//   var alphaIntDic = d3.range(17).map(i => String.fromCharCode(65 + i)) //dont need this but i was tired mkay?
// }

// function assembleFragment(s, objName, index) {
//   var loc = s.split(" ");
//   const y = alphaToInt(loc[0][0])
//   const x = loc[0].slice(1)
  
//   const id = objName + "-" + "(" + x + ", " + y + ")" + "-" + index;
  
//   return {id: id, x: x, y:y};
// }




/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
//export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
// function groupBy(list, keyGetter) {
//     const map = new Map();
//     list.forEach((item) => {
//           const key = keyGetter(item);
//           const collection = map.get(key);
//           if (!collection) {
//               map.set(key, [item]);
//           } else {
//               collection.push(item);
//           }
//     });
//     return map;
// }

// function alphaToInt(a) {
//   return a.charCodeAt(0) - 65;
// }

// function intToAlpha(n) {
//   return String.fromCharCode(n+65);
// }

var y;
var x;

function setUpMapHelpers(data) {
  y = d3.scaleLinear()
    .domain(d3.extent((data.fragmentData.values()), d => d.y)).nice() //hOW TO MAKE EQUAL SIZED TICKS?
    .range([height, 0])
    
  x = d3.scaleLinear()
    .domain(d3.extent((data.fragmentData.values()), d => d.x)).nice() // how to LIMIT SCROLL
    .range([0, width])
}
    
function xAxis(g, x) {
    g.attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
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
      .attr("xlink:href", "https://www.superiortrips.com/ShipwreckImages/AlgomaSiteMap.jpg")
    polygons = chart.append("g")
    
    points = chart.append("g")
    overlap = chart.append("g")
    lines = chart.append("g")
    pointsLabels = chart.append("g")

    const zoom = d3.zoom().scaleExtent([0.5, 32])
      .on("zoom", zoomed)

    function zoomed({transform}) {
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

  // Clipping path for the map, above the main chart so that the clipping doesn't move with the pan and zoom
  
  // chart2.append('defs')
  //         .append('clipPath') // wont plot look at the zoomable scatter plots plotting
  //         .attr('id', 'clip')
  //         .append('rect')
  //             .attr('x', 30)
  //            .attr('y', 0)
  //             .attr('width', width-100)
  //             .attr('height', height-100);
  // chart2.attr("clip-path", "url(#clip)")


  // Basic bg Image

  let transform;

  // Plot the points on the map

  function plotFragments() {
    points
      .selectAll("points")
      .data(objs)
      .join("circle")
        .attr("cx", d => x(d.location.x))
        .attr("cy", d => y(d.location.y))
        .attr("stroke", "green")
        .attr("data", d => (d))
        .attr("r", 10)
        .attr("id", d =>  "point" + d.location.x + "-" + d.location.y + "")
    .style("cursor", "pointer")
          .attr("visibility", "hidden")
        .on("click", mapIconClicked)
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

  // When a dot on the map is clicked, if there are multiple do that functions
  
  function mapIconClicked(event, p) {
    overlap.selectAll("*").remove();
    lines.selectAll("*").remove();
    let objectsOnPoint = findObjects(p.id)
    if (objectsOnPoint.length > 1) {
        console.log("multi clicked")
        multiobjectClicked(event, p, objectsOnPoint)
    } else {
        console.log("object clicked")
        objectClicked(objectsOnPoint[0])
    }
  }

  // When a location with multiple objects is clicked on
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



  // When an object dot is clicked
  function objectClicked(object) {
    selectObject(object)

    overlap.selectAll("*").remove();
  }

  function connectRegion(points, id) {
    // const grahamScan = new GrahamScan();
    // grahamScan.setPoints(object.location.map(l => [parseInt(l.x), l.y]));
    // const hull = grahamScan.getHull();  // [1,0], [2,1], [0,1]

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

  function findObjects(id) {
    return objectsByDots.find(l => l.svgNode.id == id).objects
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
  
  function setUpSidebarData(data) {
    var nodes = Array.from(data.objectData, objectToNode);
    w2ui['navigation'].add(nodes);

  /* Var setting */
    // objectsByDots = objs.map(e => ({svgNode: document.getElementById("point" + e.location.x + "-" + e.location.y),
    //                               textNode: document.getElementById("text" + e.location.x + "-" + e.location.y),
    //                               location:e.location, 
    //                               objects: []}))
  }

  // Divider
  
  /*
  console.log(data)
    data.forEach((object) => {
        var objectName = object._name;
        var locations = object.location;
        w2ui['navigation'].add({ id: objectName, text: objectName });
        locations.forEach((fragment, index) => {
            var fragmentName = "(" + fragment.x + ", " + fragment.y + ")";
            w2ui['navigation'].add(objectName, ({ id: objectName + "-" + fragmentName + "-" + index + "-button", text: fragmentName, onClick: function(event) {
            
            d3.select("#" + "point" + fragment.x + "-" + fragment.y + "").attr("r", 100)
            }}));
            
            // this takes a bit maybe we should pregen it
            
            
        });
    });
    */
    
/*
import define from "./index.js";
import {Runtime, Library, Inspector} from "./runtime.js";
const runtime = new Runtime();
    // Inspector.into(document.body)
const main = runtime.module(define, Inspector.into(document.getElementById("map")));
// const main = runtime.module(define, name => {
// 	console.log(name);
// 	if (name == 'replay1') {
// 		console.log(define);
// 		console.log("Query");
// 		console.log(document.querySelection("#map"));
// 		console.log("ID");
// 		console.log(document.getElementById("map"));
// 		return new Inspector.into(document.body);
// 	}
// });
*/
