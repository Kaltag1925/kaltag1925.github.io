// https://observablehq.com/@kaltag1925/this-is-probably-like-my-15th-fork-or-something-of-whatever-t@935
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["artifacts.json",new URL("./artifacts.json",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# This is probably like my 15th fork or something of whatever this was original 🤷‍♂️`
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","objs","x","y","data","xAxis","yAxis","grid"], function(d3,width,height,objs,x,y,data,xAxis,yAxis,grid)
{
  
  const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height]);

  const gGrid = svg.append("g")

  const gx = svg.append("g")

  const gy = svg.append("g")
  
  const chart2 = svg.append("g")
  const chart = chart2.append("g")

  // Clipping path for the map, above the main chart so that the clipping doesn't move with the pan and zoom
  
  chart2.append('defs')
      	.append('clipPath') // wont plot look at the zoomable scatter plots plotting
      	.attr('id', 'clip')
      	.append('rect')
      		.attr('x', 30)
         	.attr('y', 0)
      		.attr('width', width-100)
      		.attr('height', height-100);
  chart2.attr("clip-path", "url(#clip)")


  // Basic bg Image
  chart.append("image")
  .attr("xlink:href", "http://www.superiortrips.com/ShipwreckImages/AlgomaSiteMap.jpg")


  let transform;

  // Plot the points on the map
  const points = chart.append("g")
    .selectAll("points")
    .data(objs)
    .join("circle")
      .attr("cx", d => x(d.location.x))
     .attr("cy", d => y(d.location.y))
      .attr("stroke", "green")
      .attr("data", d => (d))
      .attr("r", 10)
      .attr("locations", d => d.location)
  .style("cursor", "pointer")
  .style("cursor", "pointer")
      .on("click", mapIconClicked)

  const pointsLabels = chart.append("g")
    .selectAll("pointLabelText")
    .data(objs)
    .join("text")
      .attr("x", d => x(d.location.x))
      .attr("y", d => y(d.location.y))
      .attr("transform", d => `rotate(-45,${x(d.location.x)},${y(d.location.y)})`)
      .text(d => getText(d))

  function getText(d) {
    var text = d.objects[0]._name //HOW DO WE KNOW WHICH ONE IS THE TOP ONE???
    if (d.objects.length > 1) {
      text += " +" + (d.objects.length - 1)
    }
    return text
  }
            
  const lines = chart.append("g");
  const overlap = chart.append("g");

  // When an object dot is clicked
  function objectClicked(event, p) {
    overlap.selectAll("*").remove();
    lines.append("g")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0.6)
      .selectAll("links")
      .data(p.others.map((frag, index, array) => frag = {x: frag.x, y: frag.y, xNext: array[(index + 1) % array.length].x, yNext: array[(index + 1) % array.length].y}).flat())
      .join("line")
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext));
  }

  // When a dot on the map is clicked, if there are multiple do that functions
  
  function mapIconClicked(event, p) {
    overlap.selectAll("*").remove();
    lines.selectAll("*").remove();
    if (p.objects.length > 1) {
        multiobjectClicked(event, p)
    } else {
        objectClicked(event, p.objects[0])
    }
  }

  // When a location with multiple objects is clicked on
  function multiobjectClicked(event, p) {
   overlap.append("g")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("fill", "red")
      .selectAll("overlap")
    .data(p.objects)
      .join("circle")
      .attr("cx", d => x(p.location.x))
        .attr("cy", (d, i) => y(p.location.y) - i * 10)
        .attr("r", 10)
        .on("click", objectClicked)
      .style("cursor", "pointer")
  }
  
  // ID
  chart.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("text")
    .data(data)
    .join("text")
      .attr("dy", "0.35em")
      .attr("x", d => x(d.x) + 7)
      .attr("y", d => y(d.y))
      .text(d => d.id);

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
    points.attr("r", 3 / Math.sqrt(transform.k));
  gGrid.call(grid, zx, zy)
  };
          
  svg.call(zoom)
    .call(zoom.transform, d3.zoomIdentity)

  return Object.assign(svg.node(), {
    reset() {
      svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
    }
  });
}
);
  main.variable(observer("y")).define("y", ["d3","objs","height"], function(d3,objs,height){return(
d3.scaleLinear()
    .domain(d3.extent(objs.map(a => a.location), d => d.y)).nice() //hOW TO MAKE EQUAL SIZED TICKS?
    .range([height, 0])
)});
  main.variable(observer("x")).define("x", ["d3","objs","width"], function(d3,objs,width){return(
d3.scaleLinear()
    .domain(d3.extent(objs.map(a => a.location), d => d.x)).nice() // how to LIMIT SCROLL
    .range([0, width])
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","d3"], function(height,d3){return(
(g, x) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable(observer("yAxis")).define("yAxis", ["d3","k"], function(d3,k){return(
(g, y) => g
    .call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))
)});
  main.variable(observer("grid")).define("grid", ["height","k","width"], function(height,k,width){return(
(g, x, y) => g
    .attr("stroke", "currentColor")
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
        .attr("y2", d => 0.5 + y(d)))
)});
  main.variable(observer("k")).define("k", ["height","width"], function(height,width){return(
height / width
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 25, right: 20, bottom: 35, left: 40}
)});
  main.variable(observer("height")).define("height", function(){return(
1000
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  main.variable(observer("artiJson")).define("artiJson", ["FileAttachment"], async function(FileAttachment){return(
(await FileAttachment("artifacts.json")).json()
)});
  main.variable(observer("data")).define("data", ["artiJson","locToInts"], function(artiJson,locToInts){return(
artiJson.UluburunShipwreck.artifact.map(a => a = {location: a.location.map(l => locToInts(l)), description: a.description, _type: a._type, _name: a._name})
)});
  main.variable(observer("objs")).define("objs", ["data","groupBy"], function(data,groupBy)
{
  var o = data.map(a => a = {head: a.location[0].x + " " + a.location[0].y, others: a})
  var ret = []
  var mid = groupBy(o, o => o.head)
    mid.forEach((v, k) => ret.push({location: {x: k.slice(0,2), y: k.slice(3)}, objects: v.map(x => x.others)})) ////// AAAAAAAAAA
  return ret
}
);
  main.variable(observer("groupBy")).define("groupBy", function(){return(
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}
)});
  main.variable(observer("locToInts")).define("locToInts", ["alphaToInt"], function(alphaToInt){return(
function locToInts(s) {
  var loc = s.split(" ");
  console.log(loc[0][0])
  const y = alphaToInt(loc[0][0])
  console.log(y)
  const x = loc[0].slice(1)
  return {x: x, y:y};
}
)});
  main.variable(observer("alphaIntDicOLD")).define("alphaIntDicOLD", function(){return(
[{a: "A", n: 0}, {a:"B", n:1}, {a:"C",n:2}, {a:"D", n:3}, {a:"E", n:4}, {a:"F", n:5}, {a:"G", n:6}, {a:"H", n:7}, {a:"I", n:8}, {a:"J", n:9}, {a:"K", n:10}, {a:"L", n:11}, {a:"M", n:12}, {a:"N", n:13},{a:"O", n:14}, {a:"P", n:15},{a:"Q", n:16}]
)});
  main.variable(observer("alphaIntDic")).define("alphaIntDic", ["d3"], function(d3){return(
d3.range(17).map(i => String.fromCharCode(65 + i))
)});
  main.variable(observer("alphaToInt")).define("alphaToInt", ["alphaIntDic"], function(alphaIntDic){return(
function alphaToInt(a) {
  return alphaIntDic.indexOf(a);
}
)});
  main.variable(observer("intToAlpha")).define("intToAlpha", ["alphaIntDic"], function(alphaIntDic){return(
function intToAlpha(n) {
  return alphaIntDic[n]
}
)});
  return main;
}
