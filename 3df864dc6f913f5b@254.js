// https://observablehq.com/@kaltag1925/test@254
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["artifacts.json",new URL("./artifacts.json",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Test`
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","grid","data","x","y"], function(d3,width,height,xAxis,yAxis,grid,data,x,y)
{
  const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  svg.append("g")
    .call(grid);

  svg.append("g")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
  .selectAll("circle")
    .data(data.map(a => a.location).flat())
    .join("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 10);
  
 svg.append("g")
      .attr("stroke", "#9299")
      .attr("stroke-opacity", 0.6)
      .selectAll("links")
      .data(data.map(a => a.location.map((frag, index, array) => frag = {x: frag.x, y: frag.y, xNext: array[(index + 1) % array.length].x, yNext: array[(index + 1) % array.length].y})).flat())
      .join("line")
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext));

 
 
  
  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("text")
    .data(data)
    .join("text")
      .attr("dy", "0.35em")
      .attr("x", d => x(d.x) + 7)
      .attr("y", d => y(d.y))
      .text(d => d.id);
  debugger;
  return svg.node()
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
