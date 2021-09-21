// https://observablehq.com/@kaltag1925/this-is-probably-like-my-15th-fork-or-something-of-whatever-t@791
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["artifacts.json",new URL("./files/48c97e21b470beb968e651c948a71e563352aa08a64eae3eb9dc4b3e1e76f9c88900fdefc490b07cf52d13695c96487db6cb3bdaec616fd2ea7c11d172cae9e7",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# This is probably like my 15th fork or something of whatever this was original 🤷‍♂️`
)});
  main.variable(observer("viewof replay1")).define("viewof replay1", ["html"], function(html){return(
html`<button>Replay`
)});
  main.variable(observer("replay1")).define("replay1", ["Generators", "viewof replay1"], (G, _) => G.input(_));
  main.variable(observer()).define(["replay1","test"], function*(replay1,test)
{
  replay1;
  for (let i = 0, n = test.flat().length; i < n; ++i) {
    yield i;
  }
}
);
  main.variable(observer("chart")).define("chart", ["replay1","d3","width","height","grid","xAxis","yAxis","objs","x","y","data"], function(replay1,d3,width,height,grid,xAxis,yAxis,objs,x,y,data)
{
  replay1;
  
  const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .call(grid);

  const gx = svg.append("g")
    .call(xAxis);

  const gy = svg.append("g")
    .call(yAxis);
  const chart2 = svg.append("g")
  const chart = chart2.append("g")

  // Clipping path for the map, above the main chart so that the clipping doesn't move with the pan and zoom
  
  chart2.append('defs')
      	.append('clipPath')
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
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "steelblue")
  .selectAll("circle")
    .data(objs)
    .join("circle")
      .attr("cx", d => x(d.location.x))
      .attr("cy", d => y(d.location.y))
      .attr("data", d => (d))
      .attr("r", 10)
      .attr("locations", d => d.location)
  .style("cursor", "pointer")
      .on("click", mapIconClicked)


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
    const zx = 0//transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = 0//transform.rescaleY(y).interpolate(d3.interpolateRound);
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    chart.attr("transform", transform).attr("stroke-width", 5 / transform.k);
    chart.style("stroke-width", 3 / Math.sqrt(transform.k));
    points.attr("r", 3 / Math.sqrt(transform.k));
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
  main.variable(observer("y")).define("y", ["d3","height","margin"], function(d3,height,margin){return(
d3.scalePoint()
    .domain("ABCDEFGHIJKLMNOPQ")
    //.tickValues(["ABCDEFGHIJKLMN"])
    .range([height - margin.bottom, margin.top])
)});
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], function(d3,data,margin,width){return(
d3.scaleLinear()
    .domain(d3.extent(data.map(a => a.location).flat(), d => d.x)).nice()
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width","data"], function(height,margin,d3,x,width,data){return(
g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", width)
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(data.x))
)});
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","data"], function(margin,d3,y,data){return(
g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.y))
)});
  main.variable(observer("grid")).define("grid", ["x","margin","height"], function(x,margin,height){return(
g => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom))
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
  var o = data.map(a => a = {head: a.location[0].x + " " + a.location[0].y, others: a.location})
  var ret = []
  groupBy(o, o => o.head).forEach((v, k) => ret.push({location: {x: k.slice(0,2), y: k.slice(3)}, objects: v})) ////// AAAAAAAAAA
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
  main.variable(observer("locToInts")).define("locToInts", function(){return(
function locToInts(s) {
  var loc = s.split(" ");
  const y = loc[0][0]
  const x = loc[0].slice(1)
  return {x: x, y:y};
}
)});
  main.variable(observer("alphaToInt")).define("alphaToInt", function(){return(
[{a: "A", n: 52}, {a:"B", n:88}, {a:"C",n:124}, {a:"D", n:160}, {a:"E", n:196}, {a:"F", n:232}, {a:"G", n:268}, {a:"H", n:304}, {a:"I", n:340}, {a:"J", n:376}, {a:"K", n:412}, {a:"L", n:448}, {a:"M", n:484}, {a:"N", n:520},{a:"O", n:556}, {a:"P", n:592},{a:"Q", n:628}].map(e => e = {a: e.a , n:e.n-52})
)});
  main.variable(observer("test")).define("test", ["data"], function(data){return(
data.map(a => a.location.map((frag, index, array) => frag = {x: frag.x, y: frag.y, xNext: array[(index + 1) % array.length].x, yNext: array[(index + 1) % array.length].y}))
)});
  return main;
}
