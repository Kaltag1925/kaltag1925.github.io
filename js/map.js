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
  setUpSpecificGrid();
  addColorKey();

  if (!(model.globalState.mouseInsideMap)) {
    toggleMouseCoordinates(false)
    toggleSpecificGrid(false)
  }

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

function setUpSpecificGrid() {
  gGrid.append('g')
    .attr('id', 'specificGrid')
    .attr("stroke-opacity", .3)
}

function drawSpecificGrid(event) { // maybe add an if statement that detects if it needs to redraw ie in a new cell, if this causes performance issues
  var mouse = d3.pointer(event)
  var mouseX = event.layerX
  var mouseY = event.layerY

  var mouseGridX = Math.floor(gridX.invert(mouseX))
  var mouseGridY = Math.floor(gridY.invert(mouseY))
  var leftGridX = gridX(mouseGridX)
  var upGridY = gridY(mouseGridY)
  var xCellSize = (gridX("F".charCodeAt(0)) - gridX("E".charCodeAt(0)))
  var yCellSize = (gridY(10)-gridY(9))

  // up right down left

  var specificGrid = d3.select("#specificGrid")
  specificGrid.html("")
  
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
      .text("")
  }

  function coordinateBoxMouseMove(event) {//doesnt work with zoom
    var mouse = d3.pointer(event)
    var mouseX = event.layerX
    var mouseY = event.layerY

    var cellSize = (gridX("F".charCodeAt(0)) - gridX("E".charCodeAt(0)))

    var xChar = Math.floor(gridX.invert(mouseX))
    var yNumber = Math.floor(gridY.invert(mouseY))

    var xCoord = gridX(xChar)
    var yCoord = gridY(yNumber)

    // sometimes these are negative not sure why, probably doesnt matter???
    var relativeMouseX = mouseX - xCoord
    var relativeMouseY = mouseY - yCoord
    
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

    var numberRelativeMouseX = mouseX - numberCellX
    var numberRelativeMouseY = mouseY - numberCellY

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

    d3.select('#coordinates').style("top", (mouseY-20)+"px").style("left",(mouseX+20)+"px")
      .text(`${String.fromCharCode(xChar)}${yNumber} ${directionCoord}${numberCoord}`)

    
    // var mouse = d3.pointer(event)
    // console.log(transform)
    // d3.select('#coordinateBox')
    //   .attr("transform", 'tranlate(' + mouse[0] + ',' + mouse[1] + ')') //'tranlateX(' + mouse[0] + ') translateY(' + mouse[1] + ')')
  }

  function alternativeClickMethod(event) {
    function mouseOver(event, objectID) {
      highlightSelection(objectID)
    }

    function mouseOut(event, objectID) {
      unhighlightSelection(objectID)
    }

    function click(event, objectID) {
      event.stopPropagation()
      removeOverlap()
      if (!(getObjectState(objectID).visible)) {
        objectVisible(objectID, true)
      }
      objectSelected(objectID)
    }

    if (model.globalState.clickMethod) {
      removeOverlap()
      event.stopPropagation()
      var mouse = d3.pointer(event)
      var mx = mouse[0]
      var my = mouse[1]
      var gridX = Math.floor(x.invert(mouse[0]))
      var gridY = Math.floor(y.invert(mouse[1]))

      var testPoly = {regions: [[
        [gridX, gridY],
        [gridX + 1, gridY],
        [gridX + 1, gridY + 1],
        [gridX, gridY + 1]
      ]], inverted: false}
      
      overlapShading.append("g")
        .attr("id", "alternativeClickShading")
        .attr("stroke", "green")
        //.attr("fill", "")
        .attr("fill-opacity", 0)
        .append('polygon')
          .attr("points", testPoly.regions[0].map(d => {
                return [x(d[0]), y(d[1])].join(',')
            }).join(' '))

      var objects = new Set()

      //TODO: CLEANUP: Change to filter idk too tired rn 11:00pm DX
      sourceData.fragmentData.forEach((fragment, id)=> {
        hull = fragmentBoundingBox(id)
        if (hull != null) {
          var poly = {regions: [hull], inverted: false}
          if (PolyBool.intersect(poly, testPoly).regions.length != 0) {
            objects.add(fragment.object)
          }
        }
      })

      displayOverlapBox(mx, my, objects, mouseOver, mouseOut, click)

      // overlap.append("g")
      //   .selectAll("rect")
      //   .data(objects)
      //   .join("rect")
      //     .attr("id", objectID => `${objectID}select`)
      //     .attr("fill", objectID => {
      //       if (getObjectState(objectID).selected) {
      //         return "greenyellow"
      //       } else {
      //         return "white"
      //       }
      //     })
      //     .attr("fill-opacity", 0.7)
      //     .attr('stroke', 'black')
      //     .attr("stroke-width", 3)
      //     .attr("width", 200)
      //     .attr("height", 50)
      //     .attr("x", (d,i) => mx + 10*(i % 10 + 1))
      //     .attr("y", (d, i) => my - 50*i)
      //     .on('mouseover', mouseOver)
      //     .on('mouseout', mouseOut)
      //     .style("cursor", "pointer")
      //     .on("click", click) 

      // overlap.append("g")
      //   .selectAll("text")
      //   .data(objects)
      //   .join("text")
      //     .attr("x", (d, i) => {
      //       console.log(i)
      //       mx + 15*(i % 10 + 1)
      //     })
      //     .style("font-size", "40px")
      //     .attr("y", (d, i) => my - 50*(i-1)-5)
      //     .text(objectID => getObjectData(objectID).name)
      //     .on('mouseover', mouseOver)
      //     .on('mouseout', mouseOut)
      //     .style("cursor", "pointer")
      //     .on("click", click) 

      
      //todo make selected/visible on left
    }
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
  var overlapShading;

  // has to be this way because for some reason  d3.select("#chart").attr('transform')  gives an error >:[ ??? DO I NEED THIS ?? TODO
  // var transformX = 0;
  // var transformY = 0;

  // Upper left corner of the map that is E9, used as a reference point to make the map in the correct position
  // need a different method, maybe the distance inbetween the ticks on the map and then add the size of the tick

  function setUpBackgroundImage() {
      var imageX1 = 205
      var imageY1 = 179
      var imageY2 = 501
      var x1 = "B"
      var y1 = 9
      var y2 = 10
      var yr = y2 - y1
      var imageCellSize = (imageY2 - imageY1) / yr
      var imageWidth = 5567
      var imageHeight = 10370
      
      var mapX1 = x(x1.charCodeAt(0))
      var mapY1 = y(y1)
      var mapY2 = y(y2)
      var mapCellSize = (mapY2 - mapY1) / yr
      var ratio = mapCellSize/imageCellSize
      var realImageX1 = imageX1 * ratio
      var realImageY1 = imageY1 * ratio
      var realImageWidth = imageWidth * ratio

      image = chart.append("image")
      .attr("xlink:href", "./imgs/1992mainsitepiecedfromjpg.png")
      .style('visibility', 'visible')
      .attr('id', 'backgroundImage')
      .attr('width', realImageWidth + 'px')
      .attr('x', mapX1 - realImageX1)
      .attr('y', mapY1 - realImageY1)
    // var imageX1 = 153
    // var imageY1 = 210
    // var imageY2 = 11168
    // var y1 = 9
    // var y2 = 40
    // var x1 = 'B'
    // var yr = y2 - y1
    // var imageCellSize = (imageY2 - imageY1) / yr
    // var imageWidth = 6296
    // var imageHeight = 11255
    
    // var mapE = x(x1.charCodeAt(0))
    // var mapY1 = y(y1)
    // var mapY2 = y(y2)
    // var mapCellSize = (mapY2 - mapY1) / yr
    // var ratio = mapCellSize/imageCellSize
    // var realImageE = imageX1 * ratio
    // var realImageY1 = imageY1 * ratio
    // var realImageWidth = imageWidth * ratio

    // image = chart.append("image")
    // .attr("xlink:href", "./imgs/full map expanded.jpg")
    // .style('visibility', 'visible')
    // .attr('id', 'backgroundImage')
    // .attr('width', realImageWidth + 'px')
    // .attr('x', mapE - realImageE)
    // .attr('y', mapY1 - realImageY1)
  }

  function addColorKey() {
    var div = d3.select("#map").append("div").attr("id", "colorKey")
      .style("border", "4px solid rgb(100, 100, 100)")
      .style("background", "rgb(200, 200, 200)")
      .style("position", "absolute")
      .style("right", "40px")
      .style("bottom", "40px")
      .style("dsiplay", "grid")
    div.append("p").html("Color Key").style("margin", "5px 10px").style("text-align", "center")
     
      //.style("display", "inline-block")

    sourceData.categoryColorData.forEach(category => {
      if (category.colors) {
        addColorKeyRow(div, category.name, category.colors)
      }
    })
  }

  function addColorKeyRow(div, type, colors) {
    var textDiv = div.append("div").append("div")//.style("display", "inline-block")
    
    textDiv.append("span")
    .style("width", "15px")
    .style("height", "15px")
    .style("margin", "5px 5px")
    .style("border", `2px solid ${colors.border}`)
    .style("vertical-align", "middle")
    .style("background", colors.shaded)
    .style("display", "inline-block")
    
    textDiv.append("p")
      .html(type)
      .style("font-size", "medium")
      .style("margin", "5px 5px")
      .style("display", "inline-block")
      
  }

  function setUpMap() {
    svg = d3.select('#map').append("svg").on("mousemove", event => {
      drawSpecificGrid(event)
      coordinateBoxMouseMove(event)
    }).attr("viewBox", [0, 0, width, height])
      .on("mouseenter", () => {
        model.globalState.mouseInsideMap = true
        toggleMouseCoordinates(true)
        toggleSpecificGrid(true)
      })
      .on("mouseleave", () => {
        model.globalState.mouseInsideMap = false
        toggleMouseCoordinates(false)
        toggleSpecificGrid(false)
      })
    
    chart2 = svg.append("g")
    chart = chart2.append("g").attr('id', '#chart').attr('width', width).attr('height', height)
    .on("click", alternativeClickMethod)
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
    overlapShading = chart.append("g")
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
    console.log("zoomed")
    gridX = transform.rescaleX(x).interpolate(d3.interpolateRound);
    gridY = transform.rescaleY(y).interpolate(d3.interpolateRound);
    gx.call(xAxis, gridX);
    gy.call(yAxis, gridY);
    
    chart.attr("transform", transform).attr("stroke-width", 5 / transform.k);
    console.log(event)
    console.log(transform)

    chart.style("stroke-width", 3 / Math.sqrt(transform.k));
    points.attr("r", 10 / Math.sqrt(transform.k));
    gGrid.call(grid, gridX, gridY)

    if (event) {
      drawSpecificGrid(event)
      coordinateBoxMouseMove(event) // depreciated but... :)
    }

    if (!model.globalState.mapStarting) {
      updateModel(function() {model.globalState.transform = transform})
    }
  };



  function readModel() {

    // if (model.globalState.transform != null) {
    //   zoom.scaleBy(svg, model.globalState.transform.k)
    //   zoom.translateBy(svg, model.globalState.transform.x, model.globalState.transform.y)
    // } // TODO FIX

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

    if (model.globalState.hideKey) {
      toggleKey(false)
    }
  }

  //#endregion

  function processObject(objectID, visible) {
    if (visible) {
      getObjectData(objectID).fragments.forEach(f => processFragment(f))
      addObjectDots(objectID)
      if (getObjectState(objectID).visualizations.showLabel) {
        addObjectLabels(objectID)
      }
    } else {
      getObjectData(objectID).fragments.forEach(f => processRemoveFragment(f))
      getObjectData(objectID).fragments.forEach(f => unhighlightFragment(f))
      removeObjectDots(objectID)
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

  function processRemoveFragment(fragID) {
    if (fragmentBoundingBox(fragID) != null) {
      var region = Array.from(regionsOnMap).find(([id, r]) => r.fragments.includes(fragID))[1]
      removeRegion(region)
      regionsOnMap.delete(regionID(region))

      region.fragments.splice(region.fragments.indexOf(fragID), 1)
      region.fragments.forEach(f => processFragment(f))
    }
  }

  function regionID(region) {
    return "region" + (region.fragments.join().split('').filter(char => /[a-zA-Z0-9]/.test(char)).join(''))
  }

  function regionType(region) {
    var type = "mixed"
    var firstObjType = getObjectData(getFragmentData(region.fragments[0]).object).type
    if (region.fragments.every(fID => 
      getObjectData(getFragmentData(fID).object).type == firstObjType
    )) {
      type = firstObjType
    }
    
    return type
  }

  function highlightRegion(region) {
    var poly = d3.select(`#${regionID(region)}shading`)
    var lines = d3.select(`#${regionID(region)}lines`)
    var labels = region.fragments.map(fradID => d3.select(`#${fradID}text`))

    var colors = getColorData(regionType(region))

    lines.attr("stroke", colors.border)
    poly.attr("fill", colors.shaded)
    labels.forEach(l => l.style("fill", "dodgerblue"))
  }

  function unhighlightRegion(region) {
    var poly = d3.select(`#${regionID(region)}shading`)
    var lines = d3.select(`#${regionID(region)}lines`)
    var labels = region.fragments.map(fradID => d3.select(`#${fradID}text`))

    var colors = getColorData(regionType(region))

    lines.attr("stroke", colors.border)
    poly.attr("fill", colors.shaded)
    labels.forEach(l => l.style("fill", "black"))
  }

  function highlightFragment(fragID) {
    unhighlightFragment(fragID)

    var colors = getColorData(getObjectData(getFragmentData(fragID).object).type)
    var hull = fragmentBoundingBox(fragID)
    if (hull != null) {
      selectedObject.append("g")
        .attr("id", fragID + "shading")
        .attr("stroke", colors.border)
        .attr("fill", colors.shaded)
        .attr("fill-opacity", 1)
        .append('polygon')
          .attr("points", hull.map(d => {
                return [x(d[0]), y(d[1])].join(',')
            }).join(' '))
    }

    //d3.select(`#${fragID}text`).style("color", "dodgerblue")
  }

  function unhighlightFragment(fragID) {
    d3.selectAll(`#${fragID}lines`).remove()
    d3.selectAll(`#${fragID}shading`).remove()
    //d3.select(`#${fragID}text`).style("color", "black")
  }

  function plotRegion(region) {
    var coords = region.polygon.regions[0]

    var colors = getColorData(regionType(region))

    lines.append("g")
      .attr("stroke", colors.border)
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
      .attr("fill", colors.shaded)
      .attr("fill-opacity", 0.5)
      .append('polygon')
        .attr("points", coords.map(d => {
              return [x(d[0]), y(d[1])].join(',')
          }).join(' '))

    //selection
    
    ///???
    mapIconSelection.append("g")
      .attr("stroke", colors.border)
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
      .attr("fill", colors.shaded)
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
    if (!(model.globalState.clickMethod)) {
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

    function mouseOver(event, objectID) {
      highlightSelection(objectID)
    }

    function mouseOut(event, objectID) {
      unhighlightSelection(objectID)
    }

    function click(event, objectID) {
      event.stopPropagation()
      removeOverlap()
      objectSelected(objectID)
    }

    displayOverlapBox(mx, my, objectsInRegion, mouseOver, mouseOut, click)
    
  }
  function displayOverlapBox(mx, my, objects, mouseOver, mouseOut, click) {
    const itemsPerColumn = 15

    objects = Array.from(objects)
    objects.sort(sortObjectsByName)

    overlap.append("g")
      .selectAll("rect")
      .data(objects)
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
        .attr("x", (d, i) => mx + 10 + 200*(Math.floor(i / itemsPerColumn)))
        .attr("y", (d, i) => my - 50*(i % itemsPerColumn + 1))
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .style("cursor", "pointer")
        .on("click", click) 

    overlap.append("g")
      .selectAll("text")
      .data(objects)
      .join("text")
        .attr("x", (d, i) => mx + 15 + 200*(Math.floor(i / itemsPerColumn)))
        .style("font-size", "40px")
        .attr("y", (d, i) => my - 50*(i % itemsPerColumn)-5)
        .text(objectID => getObjectData(objectID).name)
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .style("cursor", "pointer")
        .on("click", click) 
  }

  //TODO: CLEANUP: Should this and highlightObject be the same?
  function  highlightSelection(objectID) {
    multiSelectionHighlight.selectAll("*").remove();
    var frags = getObjectData(objectID).fragments
    var fragPolygons = frags.map(f => {
      var hull = fragmentBoundingBox(f)
      if (hull != null) {
        return hull.map(d => {
          return [x(d[0]), y(d[1])].join(',')
        }).join(' ')
      }
    })

    var colors = getColorData(getObjectData(objectID).type)

    //TODO: CLEANUP: make polygons like this
    multiSelectionHighlight.append("g")
      .attr("fill", colors.shaded)
      .attr("stroke", colors.border)
      .selectAll("polygon")
      .data(fragPolygons)
      .join('polygon')
        .attr("points", points => points)

    addHighlightLabels(objectID)

  }

  function unhighlightSelection(objectID) {
    multiSelectionHighlight.selectAll("*").remove();
    removeHighlightLabels(objectID)
  }

  function removeOverlap() {
    overlap.selectAll("*").remove();
    multiSelectionHighlight.selectAll("*").remove();
    overlapShading.selectAll("*").remove();
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


  function addHighlightLabels(objectID) {
    if (!(getObjectState(objectID).visualizations.showLabel)) {
      addObjectLabels(objectID)
    }
    d3.select(`#${objectID}Labels`)
      .selectAll("text")
      .style("paint-order", "stroke")
      .style("stroke", "black")
      .style("stroke-width", 8)
      .attr("fill", "lime")

    d3.select(`#${objectID}Dots`)
      .selectAll("circle")
      .attr("fill", "lime")
  }

  function removeHighlightLabels(objectID) {
    if (!(getObjectState(objectID).visualizations.showLabel)) {
      removeObjectLabels(objectID)
    } else {
      d3.select(`#${objectID}Labels`)
      .selectAll("text")
      .style("paint-order", "stroke")
      .style("stroke", "black")
      .style("stroke-width", 8)
      .attr("fill", "white")
    }

    d3.select(`#${objectID}Dots`)
      .selectAll("circle")
      .attr("fill", "white")
  }

  function highlightObject(objectID) {
    var object = getObjectData(objectID)
    var polys = object.fragments.map(fragmentBoundingBox).filter(p => p != null).map(p => { return {regions: [p], inverted: false}})
   // theres a faster way to do this on the github but this is easier to read and doesnt have much performance impact anyway 
    if (polys.length != 0) {
      var polygon = polys.reduce((previousPoly, currentPoly) => PolyBool.union(previousPoly, currentPoly), polys[0])
      var colors = getColorData(object.type)
      selectedObject.append("g")
          .attr("id", objectID + "shading")
          .attr("stroke", colors.border)
          .attr("fill", colors.shaded)
          .attr("fill-opacity", 1)
          .selectAll("polygon")
          .data(polygon.regions)
          .join('polygon')
            .attr("points", p => {
              return p.map(d => {
                  return [x(d[0]), y(d[1])].join(',')
              }).join(' ')
            })
    }
    removeHighlightLabels(objectID) // If its come from a multi selection, there will already be a highlight label, and if not there will be none 
    addHighlightLabels(objectID)
  }

  function unhighlightObject(objectID) {
    selectedObject.html("")
    removeHighlightLabels(objectID)
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

  //TODO: remove
  function labelID(c) {
    return (`l${c[0]},${c[1]}`).split('').filter(char => /[a-zA-Z0-9]/.test(char)).join('')
  }

  function findObjectLocations(objectID) {
    var mappedFrags = getObjectData(objectID).fragments.filter(f => fragmentBoundingBox(f) != null)
    var fragmentPolys = mappedFrags.map(f => {
      var hull = fragmentBoundingBox(f)
      return {regions: [hull], inverted: false}
    })

    var unionedPolys = fragmentPolys.reduce((previousPoly, currentPoly) => PolyBool.union(previousPoly, currentPoly), fragmentPolys[0])
    var centers = fragmentPolys.map(p => {
      //console.log(p.regions)
      return polylabel(p.regions, 1.0)
    })

    return centers
  }

  function addObjectDots(objectID) {
    var centers = findObjectLocations(objectID)

    var dotsHead = pointsLabels.append("g")
      .attr("id", `${objectID}Dots`)

    dotsHead
      .selectAll("circle")
      .data(centers)
      .join("circle")
      .attr("cx", p => x(p[0]))
      .attr("cy", p => y(p[1]))
      .attr("stroke", "black")
      .attr("fill", "white")
      .attr("r", 5)
  }

  function removeObjectDots(objectID) {
    d3.select(`#${objectID}Dots`).remove()
  }

  function addObjectLabels(objectID) {
    var centers = findObjectLocations(objectID)

    var labelsHead = pointsLabels.append("g")
      .attr("id", `${objectID}Labels`)
    
    labelsHead
        .selectAll("text")
        .data(centers)
        .join("text")
        .style("paint-order", "stroke")
        .style("stroke", "black")
        .style("stroke-width", 8)
        .attr("fill", "white")
        .attr("x", p => x(p[0])+10)
        .attr("y", p => y(p[1])+5)
        .style("font-size", "40px")
        .text(getObjectData(objectID).name)
  }

  function removeObjectLabels(objectID) {
    d3.select(`#${objectID}Labels`).remove()
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

  function toggleMouseCoordinates(visible) {
    const coordinates = d3.select('#coordinates')
    if (visible && model.globalState.mouseInsideMap && model.globalState.showMouseCoordinates) {
      coordinates.style('color', 'black')
    } else {
      coordinates.style('color', 'transparent')
    }
  }

  function toggleSpecificGrid(visible) {
    const grid = d3.select('#specificGrid')
    if (visible && model.globalState.mouseInsideMap && model.globalState.showSpecificGrid) {
      grid.style('color', 'black')
    } else {
      grid.style('color', 'transparent')
    }
  }

  function toggleKey(visible) {
    const key = d3.select("#colorKey")
    if (visible) {
      key.property("hidden", false)
    } else {
      key.property("hidden", true)
    }
  }
