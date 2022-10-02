var width
var height
var k

//reizable https://bl.ocks.org/anqi-lu/5c793fb952dd9f9204abe6ebbd657461

function readDataFile() {
  d3.json("artifacts.json").then(f => startMap(f))
}

function startMap() {
  width = document.getElementById("map").clientWidth
  height = document.getElementById("map").clientHeight

  k = height / width
  regionsOnMap = new Map()

  model.globalState.mapStarting = true;
  setUpMapHelpers();
  setUpCoordinateBox();
  setUpMap();

  // d3.selectAll(".tick")
  //   .attr("transform", "translate(0,0)")

//    d3.select('.tick').node().transform


  model.globalState.mapStarting = false;
  readModel();
}

//#region Set Up Map

// anything that plots things on the map uses these
var y;
var x;

// anything that deals with the grid (the coordinate box, the specific grid, the actual grid lines) uses these
var gridX;
var gridY;

//Something when reizing is causing the scale of the distances between the dots to grow or shrink
var dimension
function setUpMapHelpers() {

  // if (height > width) {
  //   dimension = height
  // } else {
  //   dimension = width
  // }

  dimension = 4000
  

  x = d3.scaleLinear()
    .domain(["E".charCodeAt(0), "E".charCodeAt(0) + (27-9)]).nice()
    .range([0, dimension])

  gridX = x.copy()
    
  y = d3.scaleLinear()
    .domain([9, 27]).nice()
    .range([0, dimension])

  gridY = y.copy()
}
    
function xAxis(g, x) {
    g.attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x)
        .ticks(dimension/(x("F".charCodeAt(0)) - x("E".charCodeAt(0))))
        .tickFormat(d => String.fromCharCode(d))
    )
    .call(g => g.select(".domain").attr("display", "none"))
    .style("font-size","30px")
    .selectAll("text")
    .attr("transform", `translate(${(x("F".charCodeAt(0)) - x("E".charCodeAt(0))) / 2}, 0)`)
    }
    
function yAxis(g, y) {
    g.call(d3.axisRight(y).ticks(dimension/(y(10)-y(9))))
    .call(g => g.select(".domain").attr("display", "none"))
    .style("font-size","30px")
    .selectAll("text")
    .attr("transform", `translate(0, ${(y(10) - y(9)) / 2})`)
    }
    
function grid(g, x, y) {
  g.attr("stroke", "currentColor")
  .attr("stroke-opacity", 0.3)
  .call(g => g
    .selectAll(".x")
    .data(x.ticks(dimension/(x("F".charCodeAt(0)) - x("E".charCodeAt(0)))))
    .join(
      enter => enter.append("line").attr("class", "x").attr("y2", height),
      update => update,
      exit => exit.remove()
    )
      .attr("x1", d => 0.5 + x(d))
      .attr("x2", d => 0.5 + x(d)))
  .call(g => g
    .selectAll(".y")
    .data(y.ticks(dimension/(y(10)-y(9))))
    .join(
      enter => enter.append("line").attr("class", "y").attr("x2", width),
      update => update,
      exit => exit.remove()
    )
    .attr("y1", d => 0.5 + y(d))
    .attr("y2", d => 0.5 + y(d)));
}

function drawSpecificGrid(event) { // maybe add an if statement that detects if it needs to redraw ie in a new cell, if this causes performance issues
  var mouse = d3.pointer(event)
  var mouseGridX = Math.floor(gridX.invert(mouse[0]))
  var mouseGridY = Math.floor(gridY.invert(mouse[1]))
  var leftGridX = gridX(mouseGridX)
  var upGridY = gridY(mouseGridY)
  var xCellSize = (gridX("F".charCodeAt(0)) - gridX("E".charCodeAt(0)))
  var yCellSize = (gridY(10)-gridY(9))

  // up right down left

  d3.select('#specificGrid').remove()
  var specificGrid = gGrid.append('g')
    .attr('id', 'specificGrid')
    .attr("stroke-opacity", .3)
  
  // up down line
  specificGrid.append("line")
    .attr("x1", leftGridX + xCellSize/2)
    .attr("y1", upGridY)
    .attr("x2", leftGridX + xCellSize/2)
    .attr("y2", upGridY + yCellSize)

  // left right line
  specificGrid.append("line")
    .attr("x1", leftGridX)
    .attr("y1", upGridY + yCellSize/2)
    .attr("x2", leftGridX + xCellSize)
    .attr("y2", upGridY + yCellSize/2)

  var numberGridX
  if (mouse[0] < leftGridX + xCellSize/2) {
    numberGridX = leftGridX
  } else {
    numberGridX = leftGridX + xCellSize/2
  }

  var numberGridY
  if (mouse[1] < upGridY + yCellSize/2) {
    numberGridY = upGridY
  } else {
    numberGridY = upGridY + yCellSize/2
  }

  // up down line
  specificGrid.append("line")
    .attr("x1", numberGridX + xCellSize/4)
    .attr("y1", numberGridY)
    .attr("x2", numberGridX + xCellSize/4)
    .attr("y2", numberGridY + yCellSize/2)

  // left right line
  specificGrid.append("line")
    .attr("x1", numberGridX)
    .attr("y1", numberGridY + yCellSize/4)
    .attr("x2", numberGridX + xCellSize/2)
    .attr("y2", numberGridY + yCellSize/4)

    // Add text labels?


  // tooltip
}

  function setUpCoordinateBox() {
    d3.select('#map').append("div").attr('id', 'coordinates')
      .style("height", "0px")
      .style("position", "relative")
      .style("font-weight", "bold")
      .text("") //TODO: Hide when off map


    // var svg = d3.select('#map').append('svg')
    //   .on('mousemove', coordinateBoxMouseMove)
    
    // var g = svg.append('g').attr('id', 'coordinateBox').attr('transform', 'tranlateX(10) translate(100)')

    // g.append('rect')
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("width", coordinateBoxWidth)
    //   .attr("height", coordinateBoxHeight);

    // g.append('text')
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("id", 'coordinateText')
  }

  function coordinateBoxMouseMove(event) {//doesnt work with zoom
    var mouse = d3.pointer(event)
    var cellSize = (gridX("F".charCodeAt(0)) - gridX("E".charCodeAt(0)))

    var xChar = Math.floor(gridX.invert(mouse[0]))
    var yNumber = Math.floor(gridY.invert(mouse[1]))

    var xCoord = gridX(xChar)
    var yCoord = gridY(yNumber)

    // sometimes these are negative not sure why, probably doesnt matter???
    var relativeMouseX = mouse[0] - xCoord
    var relativeMouseY = mouse[1] - yCoord
    
    var numberCellX = 0
    var numberCellY = 0
    
    var directionCoord = ""
    if (relativeMouseX > cellSize / 2) {
      //right
      if (relativeMouseY > cellSize / 2) {
        // bottom right
        directionCoord = "LR"
        numberCellX = xCoord + cellSize / 2
        numberCellY = yCoord + cellSize / 2
      } else {
        // upper right
        directionCoord = "UR"
        numberCellX = xCoord + cellSize / 2
        numberCellY = yCoord
      }
    } else {
      //left
      if (relativeMouseY > cellSize / 2) {
        // bottom left
        directionCoord = "LL"
        numberCellX = xCoord
        numberCellY = yCoord + cellSize / 2
      } else {
        // upper left
        directionCoord = "UL"
        numberCellX = xCoord
        numberCellY = yCoord
      }
    }

    var numberCoord = ""

    var numberRelativeMouseX = mouse[0] - numberCellX
    var numberRelativeMouseY = mouse[1] - numberCellY

    if (numberRelativeMouseX > cellSize / 4) {
      // right
      if (numberRelativeMouseY > cellSize / 4) {
        // bottom right
        numberCoord = "4"
      } else {
        // top right
        numberCoord = "2"
      }
    } else {
      // left
      if (numberRelativeMouseY > cellSize / 4) {
        // bottom left
        numberCoord = "3"
      } else {
        // top left
        numberCoord = "1"
      }
    }

    d3.select('#coordinates').style("top", (mouse[1]-20)+"px").style("left",(mouse[0]+20)+"px")
      .text(`${String.fromCharCode(xChar)}${yNumber} ${directionCoord}${numberCoord}`)

    
    // var mouse = d3.pointer(event)
    // console.log(transform)
    // d3.select('#coordinateBox')
    //   .attr("transform", 'tranlate(' + mouse[0] + ',' + mouse[1] + ')') //'tranlateX(' + mouse[0] + ') translateY(' + mouse[1] + ')')
  }
        
  var margin = ({top: 25, right: 20, bottom: 35, left: 40})
  var svg;
  var gGridLines;
  var gGrid;
  var gx;
  var gy;
  var chart2;
  var chart;
  var polygons;
  var points;
  var pointsLabels;
  var lines;
  var shaded;
  var overlap;
  var image;
  var mapIconSelection;
  var selectedObject;
  var multiSelectionHighlight;
  var zoom;

  // has to be this way because for some reason  d3.select("#chart").attr('transform')  gives an error >:[ ??? DO I NEED THIS ?? TODO
  // var transformX = 0;
  // var transformY = 0;

  // Upper left corner of the map that is E9, used as a reference point to make the map in the correct position
  // need a different method, maybe the distance inbetween the ticks on the map and then add the size of the tick

  function setUpBackgroundImage() {
    if (model.globalState.averageCellSize) {
      var imageE = 399
      var imageY1 = 227
      var imageY2 = 9555
      var y1 = 9
      var y2 = 38
      var yr = y2 - y1
      var imageCellSize = (imageY2 - imageY1) / yr
      var imageWidth = 5018
      var imageHeight = 9892
      
      var mapE = x('E'.charCodeAt(0))
      var mapY1 = y(y1)
      var mapY2 = y(y2)
      var mapCellSize = (mapY2 - mapY1) / yr
      var ratio = mapCellSize/imageCellSize
      var realImageE = imageE * ratio
      var realImageY1 = imageY1 * ratio
      var realImageWidth = imageWidth * ratio

      image = chart.append("image")
      .attr("xlink:href", "./imgs/1992mainsitepiecedfromjpg.png")
      .style('visibility', 'visible')
      .attr('id', 'backgroundImage')
      .attr('width', realImageWidth + 'px')
      .attr('x', mapE - realImageE)
      .attr('y', mapY1 - realImageY1)
    } else {
      var imageE = 399
      var imageY1 = 227
      var imageY2 = 546 //38 = 9555
      var y1 = 9
      var y2 = 10
      var yr = y2 - y1
      var imageCellSize = (imageY2 - imageY1) / yr
      var imageWidth = 5018
      var imageHeight = 9892
      
      var mapE = x('E'.charCodeAt(0))
      var mapY1 = y(y1)
      var mapY2 = y(y2)
      var mapCellSize = (mapY2 - mapY1) / yr
      var ratio = mapCellSize/imageCellSize
      var realImageE = imageE * ratio
      var realImageY1 = imageY1 * ratio
      var realImageWidth = imageWidth * ratio

      image = chart.append("image")
      .attr("xlink:href", "./imgs/1992mainsitepiecedfromjpg.png")
      .style('visibility', 'visible')
      .attr('id', 'backgroundImage')
      .attr('width', realImageWidth + 'px')
      .attr('x', mapE - realImageE)
      .attr('y', mapY1 - realImageY1)
    }
  }

  function setUpMap() {
    svg = d3.select('#map').append("svg").on("mousemove", event => {
      drawSpecificGrid(event)
      coordinateBoxMouseMove(event)
    }).attr("viewBox", [0, 0, width, height])
      .on("mouseenter", () => {
        model.globalState.mouseInsideMap = true
        if (model.globalState.showMouseCoordinates) {
          toggleMouseCoordinates(true)
        }
      })
      .on("mouseleave", () => {
        model.globalState.mouseInsideMap = false
        toggleMouseCoordinates(false)
      })
    
    
    chart2 = svg.append("g")
    chart = chart2.append("g").attr('id', '#chart').attr('width', width).attr('height', height)
    setUpBackgroundImage()
    polygons = chart.append("g")

    gGridLines = svg.append("g")
      .style("pointer-events", "none")

    gGrid = gGridLines.append("g")

    gx = gGridLines.append("g")

    gy = gGridLines.append("g")

    shaded = chart.append("g")
    lines = chart.append("g")
    selectedObject = chart.append("g")
    multiSelectionHighlight = chart.append("g")

    points = chart.append("g")
    pointsLabels = chart.append("g")
    mapIconSelection = chart.append("g")
    overlap = chart.append("g").attr("id", "overlap")

    zoom = d3.zoom().scaleExtent([0.1, 32])
      .on("zoom", zoomed)

    //https://stackoverflow.com/questions/51741861/d3-v5-zoom-limit-pan
    const graphBox = svg.node().getBBox();
    const margin = 200;
    const worldTopLeft = [graphBox.x - margin, graphBox.y - margin];
    const worldBottomRight = [
      graphBox.x + graphBox.width + margin,
      graphBox.y + graphBox.height + margin
    ];
    zoom.translateExtent([worldTopLeft, worldBottomRight]);
            
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

  function zoomed({transform}) {
    gridX = transform.rescaleX(x).interpolate(d3.interpolateRound);
    gridY = transform.rescaleY(y).interpolate(d3.interpolateRound);
    gx.call(xAxis, gridX);
    gy.call(yAxis, gridY);
    
    chart.attr("transform", transform).attr("stroke-width", 5 / transform.k);

    chart.style("stroke-width", 3 / Math.sqrt(transform.k));
    points.attr("r", 10 / Math.sqrt(transform.k));
    gGrid.call(grid, gridX, gridY)

    if (!model.globalState.mapStarting) {
      updateModel(function() {model.globalState.transform = transform})
    }
    // TODO add draw specific grid here somehow, need an event or mouse location
    // maybe need to store mouse coordinates or something
  };



  function readModel() {

    if (model.globalState.transform != null) {
      zoom.scaleBy(svg, model.globalState.transform.k)
      zoom.translateBy(svg, model.globalState.transform.x, model.globalState.transform.y)
    } // TODO FIX

    model.objectStates.forEach((obj, id) => {
      if (obj.visible) {
        processObject(id, true)
      }
    })

    
    if (model.globalState.selectedObject != null) {
      processObjectSelected(model.globalState.selectedObject)
    }

    // var mrs = model.globalState.multiRegionSelected
    // if (mrs != null && mrs.region != null) {
    //   multiRegionClicked(x(mrs.mx), y(mrs.my), mrs.region)
    // }

    toggleMap(model.globalState.showMap)
    togglePithoi(model.globalState.showPithoi)
    toggleRocks(model.globalState.showRocks)
  }

  //#endregion

  function processObject(objectID, visible) {
    if (visible) {
      getObjectData(objectID).fragments.forEach(f => processFragment(f))
      addObjectLabels(objectID)
    } else {
      getObjectData(objectID).fragments.forEach(f => processRemoveFragment(f))
      getObjectData(objectID).fragments.forEach(f => unhighlightFragment(f))
      removeObjectLabels(objectID)
    }
  }


  // (regionID, {polygon, [fragments]})
  var regionsOnMap = new Map();
  // (objectID, [elementIDs])
  var objectLabels = new Map();

  function processFragment(fragID) { // multiple fragments of the same object, should be fine // called again when resizing
    if (regionsOnMap == null) {
      regionsOnMap = new Map();
    }

    //plotFragment(fragID)

    var boundingBox = fragmentBoundingBox(fragID)

    if (boundingBox != null) { //fragment loc is still tbd
      var hull = {regions: [fragmentBoundingBox(fragID)], inverted: false}
      //TODO: this is gonna get really slow
      var overlapingRegions = Array.from(regionsOnMap).filter(([id, region]) => {

        //TODO: Does this work when one contains the other?
        var intersection = PolyBool.intersect(region.polygon, hull)
        return (intersection.regions.length != 0)


      })

      if (overlapingRegions.length == 0) {
        var region = {polygon: hull, fragments: [fragID]}
        regionsOnMap.set(regionID(region), region)
        plotRegion(region)
        //addFragmentLabel(region)
      } else {
        overlapingRegions.forEach(([id, r]) => {
          regionsOnMap.delete(regionID(r))
          removeRegion(r)
          //removeFragmentLabel(r)
        })

        var polygonsToUnion = overlapingRegions.map(([id, r]) => r.polygon)
        polygonsToUnion.push(hull)
        var fragArray = overlapingRegions.map(([id, r]) => r.fragments).flat()
        fragArray.push(fragID)

        var newPolygon = polygonsToUnion.reduce((previousPoly, currentPoly) => PolyBool.union(previousPoly, currentPoly), polygonsToUnion[0])
        var newRegion = {polygon: newPolygon, fragments: fragArray}
        plotRegion(newRegion)
        //addFragmentLabel(newRegion)
        regionsOnMap.set(regionID(newRegion), newRegion)
      }
    }
  }

  function processRemoveFragment(fragID) { // TODO: make this re call process fragments
    if (fragmentBoundingBox(fragID) != null) {
      var region = Array.from(regionsOnMap).find(([id, r]) => r.fragments.includes(fragID))[1]
      removeRegion(region)
      //removeFragmentLabel(region)
      regionsOnMap.delete(regionID(region))

      region.fragments.splice(region.fragments.indexOf(fragID), 1)
      region.fragments.forEach(f => processFragment(f))
      
      // if (newFragments.length > 0) {
      //   var newPolygon = newFragments.reduce((previousPoly, currentPoly) => PolyBool.union(previousPoly, currentPoly), [newFragments[0]])
      //   var newRegion = {polygon: newPolygon, fragments: newFragments}
      //   plotRegion(newRegion)
      // }
    }
  }

  function regionID(region) {
    return "region" + (region.fragments.join().split('').filter(char => /[a-zA-Z0-9]/.test(char)).join(''))
  }

  function highlightRegion(region) {
    var poly = d3.select(`#${regionID(region)}shading`)
    var lines = d3.select(`#${regionID(region)}lines`)
    var labels = region.fragments.map(fradID => d3.select(`#${fradID}text`))

    lines.attr("stroke", "green")
    poly.attr("fill", "greenyellow")
    labels.forEach(l => l.style("fill", "dodgerblue"))
  }

  function unhighlightRegion(region) {
    var poly = d3.select(`#${regionID(region)}shading`)
    var lines = d3.select(`#${regionID(region)}lines`)
    var labels = region.fragments.map(fradID => d3.select(`#${fradID}text`))

    lines.attr("stroke", "red")
    poly.attr("fill", "blue")
    labels.forEach(l => l.style("fill", "black"))
  }

  function highlightFragment(fragID) {
    unhighlightFragment(fragID)
    var hull = fragmentBoundingBox(fragID)
    if (hull != null) {

      console.log(hull)
      selectedObject.append("g")
        .attr("id", fragID + "shading")
        .attr("stroke", "darkgreen")
        .attr("fill", "greenyellow")
        .attr("fill-opacity", 1)
        .append('polygon')
          .attr("points", hull.map(d => {
                return [x(d[0]), y(d[1])].join(',')
            }).join(' '))
    }

    //d3.select(`#${fragID}text`).style("color", "dodgerblue")
  }

  colorCombos = new Map()
  colorCombos.set("red", {fill: "red", border: "darkred"})
  colorCombos.set("blue", {fill: "blue", border: "darkblue"})
  colorCombos.set("green", {fill: "green", border: "darkgreen"})
  colorCombos.set("gold", {fill: "gold", border: "goldenrod"})
  colorCombos.set("purple", {fill: "purple", border: "rebeccapurple"})
  colorCombos.set("orange", {fill: "orange", border: "darkorange"})
  colorCombos.set("grey", {fill: "grey", border: "darkslategrey"})

  function changeFragmentColor(fragID, color) {
    var colors = colorCombos.get(color)
    d3.select(`#${fragID}lines`)
      .attr("stroke", colors.border)

    d3.select(`#${fragID}shading`)
      .attr("fill", colors.fill)
  }

  function unhighlightFragment(fragID) {
    d3.selectAll(`#${fragID}lines`).remove()
    d3.selectAll(`#${fragID}shading`).remove()
    //d3.select(`#${fragID}text`).style("color", "black")
  }

  function plotRegion(region) {
    var coords = region.polygon.regions[0]

    lines.append("g")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0.6)
      .attr("id", regionID(region) + "lines")
      .selectAll("lines")
      .data(coords.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat()) //.data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat())
      .join("line")
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext))
    
    shaded.append("g")
      .attr("id", regionID(region) + "shading")
      .attr("fill", "blue")
      .attr("fill-opacity", 0.4)
      .append('polygon')
        .attr("points", coords.map(d => {
              return [x(d[0]), y(d[1])].join(',')
          }).join(' '))

    //selection
    
    mapIconSelection.append("g")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0)
      .attr("id", regionID(region) + "selectionlines")
      .selectAll("lines")
      .data(coords.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat()) //.data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat())
      .join("line")
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext))
        .on('mouseover', (d, i) => {
          highlightRegion(region)
        })
        .on('mouseout', (d, i) => {
          unhighlightRegion(region)
        })
        .style("cursor", "pointer")
        .on("click", (e) => {
          regionClicked(e, region)
        })
    
    mapIconSelection.append("g")
      .attr("id", regionID(region) + "selectionshading")
      .attr("fill", "blue")
      .attr("fill-opacity", 0)
      .append('polygon')
        .attr("points", coords.map(d => {
              return [x(d[0]), y(d[1])].join(',')
          }).join(' '))
        .on('mouseover', (d, i) => {
          highlightRegion(region)
        })
        .on('mouseout', (d, i) => {
          unhighlightRegion(region)
        })
        .style("cursor", "pointer")
        .on("click", (e) => {
          regionClicked(e, region)
        }) 
  }

  function regionClicked(event, region) {
    event.stopPropagation()
    removeOverlap()
    var regionObjects = []
    region.fragments.forEach(f => {
      var objectID = getFragmentData(f).object
      if (!regionObjects.includes(objectID)) {
        regionObjects.push(objectID)
      }
    })
    if (regionObjects.length > 1) {
      var mouse = d3.pointer(event)
      multiRegionClicked(mouse[0], mouse[1], region)
    } else {
      objectSelected(getFragmentData(region.fragments[0]).object)
    }
  }

  function multiRegionClicked(mx, my, region) {
    updateModel(function(){ model.globalState.multiRegionSelected = true})
    var arr = JSON.parse(JSON.stringify(region.polygon.regions))
    var c = polylabel(arr, 1.0)
    
    var objectsInRegion = []
    region.fragments.forEach(f => {
      var o = getFragmentData(f).object
      if (!objectsInRegion.includes(o)) {
        objectsInRegion.push(o)
      }
    })

    overlap.append("g")
      .selectAll("rect")
      .data(objectsInRegion)
      .join("rect")
        .attr("id", objectID => `${objectID}select`)
        .attr("fill", objectID => {
          if (getObjectState(objectID).selected) {
            return "greenyellow"
          } else {
            return "white"
          }
        })
        .attr("fill-opacity", 0.7)
        .attr('stroke', 'black')
        .attr("stroke-width", 3)
        .attr("width", 200)
        .attr("height", 50)
        .attr("x", mx + 10)
        .attr("y", (d, i) => my - 50*i)
        .on('mouseover', (e, objectID) => {
          highlightSelection(objectID)
        })
        .on('mouseout', (e, objectID) => {
          unhighlightSelection()
        })
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          e.stopPropagation()
          removeOverlap()
          objectSelected(d)
        }) 

    overlap.append("g")
      .selectAll("text")
      .data(objectsInRegion)
      .join("text")
        .attr("x", mx + 15)
        .style("font-size", "40px")
        .attr("y", (d, i) => my - 50*(i-1)-5)
        .text(objectID => getObjectData(objectID).name)
        .on('mouseover', (e, objectID) => {
          highlightSelection(objectID)
        })
        .on('mouseout', (e, objectID) => {
          unhighlightSelection()
        })
        .style("cursor", "pointer")
        .on("click", (e, objectID) => {
          e.stopPropagation()
          removeOverlap()
          objectSelected(objectID)
        }) 

    overlap.on('mouseout', (e) =>{
      unhighlightSelection()
    })
    
  }

  function highlightSelection(objectID) {
    multiSelectionHighlight.selectAll("*").remove();
    var frags = getObjectData(objectID).fragments
    //var colors = colorCombos.get(getFragmentState(fragID).color)

    var fragPolygons = frags.map(f => {
      var hull = fragmentBoundingBox(f)
      return hull.map(d => {
        return [x(d[0]), y(d[1])].join(',')
      }).join(' ')
    })


    multiSelectionHighlight.append("g")
      .attr("fill", "blue")
      .attr("stroke", "red")
      .selectAll("polygon")
      .data(fragPolygons)
      .join('polygon')
        .attr("points", points => points)

  }

  function unhighlightSelection() {
    multiSelectionHighlight.selectAll("*").remove();
  }

  function removeOverlap() {
    overlap.selectAll("*").remove();
    multiSelectionHighlight.selectAll("*").remove();
    updateModel(function(){ model.globalState.multiRegionSelected = false});
  }

  function objectSelected(objectID) {
    removeOverlap()

    if (model.globalState.selectedObject != objectID) {
      if (model.globalState.selectedObject != null) {
        processObjectDeselected(model.globalState.selectedObject)
      }
      processObjectSelected(objectID)
      updateModel(function() {model.globalState.selectedObject = objectID})
    }
  }

  function processObjectSelected(objectID) {
    highlightObject(objectID)
    loadObjectInfoPanel(objectID)
  }

  function highlightObject(objectID) {
    var object = getObjectData(objectID)
    object.fragments.forEach(f => highlightFragment(f))
  }

  function unhighlightObject(objectID) {
    var object = sourceData.objectData.get(objectID)
    object.fragments.forEach(f => unhighlightFragment(f))
  }

  function processObjectDeselected(objectID) {
    unhighlightObject(objectID)
    removeObjectInfoPanel(objectID)
  }


  function removeRegion(region) {
    d3.select("#" + regionID(region) + "lines").remove()
    d3.select("#" + regionID(region) + "shading").remove()
    d3.select("#" + regionID(region) + "selectionlines").remove()
    d3.select("#" + regionID(region) + "selectionshading").remove()
  }

  
  function labelID(c) {
    return (`l${c[0]},${c[1]}`).split('').filter(char => /[a-zA-Z0-9]/.test(char)).join('')
  }

  function addObjectLabels(objectID) {
    console.log("adding labels")
    var mappedFrags = getObjectData(objectID).fragments.filter(f => fragmentBoundingBox(f) != null)
    var fragmentPolys = mappedFrags.map(f => {
      var hull = fragmentBoundingBox(f)
      return {regions: [hull], inverted: false}
    })

    var unionedPolys = fragmentPolys.reduce((previousPoly, currentPoly) => PolyBool.union(previousPoly, currentPoly), fragmentPolys[0])
    
    var labelsHead = pointsLabels.append("g")
      .attr("id", `${objectID}Labels`)
      .data(unionedPolys.regions.map(p => polylabel([p], 1.0)))
      //.enter()
    
    labelsHead
        .append("text")
        .attr("x", p => x(p[0])+10)
        .attr("y", p => y(p[1])+5)
        .style("font-size", "40px")
        .text(getObjectData(objectID).name)
        // .style("cursor", "pointer")
        // .on("click", e => regionClicked(e, region))

    labelsHead
        .append("circle")
        .attr("cx", p => x(p[0]))
        .attr("cy", p => y(p[1]))
        .attr("stroke", "black")
        .attr("r", 1)
        // .style("cursor", "pointer")
        // .on("click", e => regionClicked(e, region))

  }

  function removeObjectLabels(objectID) {
    d3.select(`#${objectID}Labels`).remove()
  }

  function addFragmentLabel(region) {
    var map = new Map()
    region.fragments.forEach(f => {
      var hull = fragmentBoundingBox(f)
      if (hull != null) {
        hull.push(hull[0])
        var c = polylabel([hull], 1.0)
        var id = labelID(c)
        if (map.has(id)) {
          map.get(id).fragments.push(f)
        } else {
          map.set(id, {c: c, fragments: [f]})
        }
     }
    })

    map.forEach(lr => {
      var extraFrags = ""
      if ((lr.fragments.length - 1) > 0) {
        extraFrags = ` + ${(lr.fragments.length - 1)}`
      }

      pointsLabels.append("text")
        .attr("x", x(lr.c[0])+10)
        .attr("y", y(lr.c[1])+5)
        .attr("id", labelID(lr.c) + "text")
        .style("font-size", "40px")
        //.attr("transform", d => `rotate(-45,${x(locs[0].x) + 10},${y(locs[0].y) - 10})`)
        .text(getFragmentData(lr.fragments[0]).name + extraFrags)

      points.append("circle")
        .attr("cx", x(lr.c[0]))
        .attr("cy", y(lr.c[1]))
        .attr("stroke", "black")
        .attr("r", 1)
        .attr("id", labelID(lr.c) + "svg")
        .style("cursor", "pointer")
        .on("click", e => regionClicked(e, region))
    })
  }

  function removeFragmentLabel(region) {
    var map = new Map()
    region.fragments.forEach(f => {
      var hull = fragmentBoundingBox(f)
      if (hull != null) {
        hull.push(hull[0])
        var c = polylabel([hull], 1.0)
        var id = labelID(c)
        if (map.has(id)) {
          map.get(id).fragments.push(f)
        } else {
          map.set(id, {c: c, fragments: [f]})
        }
      }
    })

    map.forEach(lr => {
      d3.select("#" + labelID(lr.c) + "text").remove()
      d3.select("#" + labelID(lr.c) + "svg").remove()
    })
  }

  function fragmentBoundingBox(fragID) {
    var frag = getFragmentData(fragID)
    if (frag.locs.length == 0) {
      return null
    } else {
      var coords = frag.locs.map(l => fragmentLocBoundingBox(l)).flat(1)
      

      var hull = convexHull(coords).map(i => coords[i])
      return hull
    }
  }

  function fragmentLocBoundingBox(loc) {
    var x = loc.x
    var y = loc.y
    var width = 1
    var height = 1

    var sl = loc.specLetter
    if (sl != null) {
      width = 0.5
      height = 0.5
      if (sl == "UL") {
        // no change
      }

      if (sl == "LL") {
        // x = no change
        y += 0.5
      }

      if (sl == "UR") {
        x += 0.5
        // y = no change
      }

      if (sl == "LR") {
        x += 0.5
        y += 0.5
      }
    }

    var sn = loc.specNumber
    if (sn != null) {
      width = 0.25
      height = 0.25
      if (sn == 1) {
        // no change
      }
      
      if (sn == 2) {
        x += 0.25
        //y = no change
      }

      if (sn == 3) {
        // x = no change
        y += 0.25
      }

      if (sn == 4) {
        x += 0.25
        y += 0.25
      }
    }

    var coords = [[x,y],
      [x + width, y],
      [x, y + height],
      [x + width, y + height]]

    return coords
  }
  
  
  var lastSelectedPoint = null

  function connectRegion(objectID) {
    var fragLocations = sourceData.objectData.get(objectID).fragments.map(fragID => {
      var frag = sourceData.fragmentData.get(fragID)
      return [frag.x, frag.y]
    })
    var hull = convexHull(fragLocations).map(i => fragLocations[i])

    lines.append("g")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0.6)
      .attr("id", objectID + "lines")
      .selectAll("lines")
      .data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat()) //.data(hull.map((l, index, array) => ({x: l[0], y: l[1], xNext: array[(index + 1) % array.length][0], yNext: array[(index + 1) % array.length][1]})).flat())
      .join("line")
        .attr("x1", d => plotX(d.x))
        .attr("y1", d => plotY(d.y))
        .attr("x2", d => plotX(d.xNext))
        .attr("y2", d => plotY(d.yNext))

  }

  function removeLines(objectID) {
    d3.select("#" + objectID + "lines").remove()
  }

  function shadeObjectRegion(objectID) {
    var fragLocations = sourceData.objectData.get(objectID).fragments.map(fragID => {
      var frag = sourceData.fragmentData.get(fragID)
      return [frag.x, frag.y]
    })
    var hull = convexHull(fragLocations).map(i => fragLocations[i])

    shaded.append("g")
      .attr("id", objectID + "shading")
      .selectAll("polygon")
      .data([hull])
      .enter().append('polygon')
      .attr("points", d => {
        return d.map(d => {
            return [x(d[0]), y(d[1])].join(',')
        }).join(' ')
      })
      .attr("fill", "blue")
  }

  function removeShading(objectID) {
    d3.select("#" + objectID + "shading").remove()
  }

  function toggleMap(toggle) {
    if (toggle) {
      image.style('visibility', 'visible')
    } else {
      image.style('visibility', 'hidden')
    }
  }

  function togglePithoi(toggle) {
    if (toggle) {
      points.append("g")
      .attr("id", "pithoi")
      .selectAll("pithoi")
      .data([[66, 13], [77,12], [69, 20], [70, 12]]) //TODO: Real Data
      .join("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("stroke", "pink")
        //.attr("data", d => (d))
        .attr("r", 20)
        .attr("id", d =>  "point" + d.x + "-" + d.y + "")
    // .style("cursor", "pointer")
    //     .on("click", mapIconClicked)
    } else {
      points.select("#pithoi").remove()
    }
  }

  var rockSVG = d3.xml('imgs/rock.svg')
  function toggleRocks(toggle) {
    if (toggle) {
      points.append("g")
      .attr("id", "rocks")
      .selectAll("rock")
      .data([[68,15], [72,12], [73, 20], [74, 10]]) //TODO: Real Data
      .join("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("stroke", "grey")
        //.attr("data", d => (d))
        .attr("r", 20)
        .attr("id", d =>  "point" + d.x + "-" + d.y + "")
    // .style("cursor", "pointer")
    //     .on("click", mapIconClicked)
    } else {
      points.select("#rocks").remove("*")
    }
  }

  function toggleMouseCoordinates(visible) {
    const coordinates = d3.select('#coordinates')
    if (visible && model.globalState.mouseInsideMap) {
      coordinates.style('color', 'black')
    } else {
      coordinates.style('color', 'transparent')
    }
  }
