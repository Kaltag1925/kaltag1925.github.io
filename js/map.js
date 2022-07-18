var width
var height
var k

//reizable https://bl.ocks.org/anqi-lu/5c793fb952dd9f9204abe6ebbd657461

function readDataFile() {
  d3.json("artifacts.json").then(f => startMap(f))
}

function startMap() {
  width = w2ui['layout'].get('main').width
  height = w2ui['layout'].get('main').height

  k = height / width

  setUpMapHelpers()
  setUpCoordinateBox()
  setUpMap()
  readModel()
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

  if (height > width) {
    dimension = height
  } else {
    dimension = width
  }

  

  x = d3.scaleLinear()
    .domain(["E".charCodeAt(0), "E".charCodeAt(0) + (27-9)]).nice() //hOW TO MAKE EQUAL SIZED TICKS?
    .range([0, dimension])

  gridX = x.copy()
    
  y = d3.scaleLinear()
    .domain([9, 27]).nice()
    // how to LIMIT SCROLL
    .range([0, dimension])

  gridY = y.copy()
}
    
function xAxis(g, x) {
    g.attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(dimension/(x("F".charCodeAt(0)) - x("E".charCodeAt(0)))).tickFormat(d => String.fromCharCode(d)))
    .call(g => g.select(".domain").attr("display", "none"))
    .style("font-size","30px");
    }
    
function yAxis(g, y) {
    g.call(d3.axisRight(y).ticks(dimension/(y(10)-y(9))))
    .call(g => g.select(".domain").attr("display", "none"))
    .style("font-size","30px");
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
      .style("position", "absolute")
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
        numberCoord = "3"
      }
    } else {
      // left
      if (numberRelativeMouseY > cellSize / 4) {
        // bottom left
        numberCoord = "2"
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

  // has to be this way because for some reason  d3.select("#chart").attr('transform')  gives an error >:[
  var transformX = 0;
  var transformY = 0;

  // Upper left corner of the map that is E9, used as a reference point to make the map in the correct position
  // need a different method, maybe the distance inbetween the ticks on the map and then add the size of the tick
  var imageE = 80
  var image9 = 45
  var image10 = 109.5 // top of the 10 row, used to get the cell size for scaling
  var imageCellSize = image10 - image9
  var imageWidth = 1004
  var imageHeight = 1310

  function setUpBackgroundImage() {
    var mapE = x('E'.charCodeAt(0))
    var map9 = y(9)
    var map10 = y(10)
    var mapCellSize = map10 - map9
    var ratio = mapCellSize/imageCellSize
    //console.log(ratio, mapCellSize, imageCellSize)
    var realImageE = imageE * ratio
    var realImage9 = image9 * ratio
    var realImageWidth = imageWidth * ratio

    image = chart.append("image")
    .attr("xlink:href", "./imgs/reallysmallsitemap.png")
    .style('visibility', 'hidden')
    .attr('id', 'backgroundImage')
    .attr('width', realImageWidth + 'px')
    .attr('x', mapE - realImageE)
    .attr('y', map9 - realImage9)
  }

  function setUpMap() {
    svg = d3.select('#map').append("svg").on("mousemove", event => {
      drawSpecificGrid(event)
      coordinateBoxMouseMove(event)
    }).attr("viewBox", [0, 0, width, height])
    
    
    chart2 = svg.append("g")
    chart = chart2.append("g").attr('id', '#chart').attr('width', width).attr('height', height)
    setUpBackgroundImage()
    polygons = chart.append("g")

    gGrid = svg.append("g")

    gx = svg.append("g")

    gy = svg.append("g")
    
    points = chart.append("g")
    overlap = chart.append("g")
    shaded = chart.append("g")
    lines = chart.append("g")
    pointsLabels = chart.append("g")

    const zoom = d3.zoom().scaleExtent([0.5, 32])
      .on("zoom", zoomed)

    function zoomed({transform}) {
      // x = transform.rescaleX(defaultX).interpolate(d3.interpolateRound);
      // y = transform.rescaleY(defaultY).interpolate(d3.interpolateRound);
      gridX = transform.rescaleX(x).interpolate(d3.interpolateRound);
      gridY = transform.rescaleY(y).interpolate(d3.interpolateRound);
      gx.call(xAxis, gridX);
      gy.call(yAxis, gridY);
      
      chart.attr("transform", transform).attr("stroke-width", 5 / transform.k);
      // k = transform.k
      // transformX = transform.x
      // transformY = transform.y

      chart.style("stroke-width", 3 / Math.sqrt(transform.k));
      points.attr("r", 10 / Math.sqrt(transform.k));
      gGrid.call(grid, gridX, gridY)
      // add draw specific grid here somehow, need an event or mouse location
      // maybe need to store mouse coordinates or something
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

  function readModel() {
    dotsOnMap = new Map()
    model.objectStates.forEach((obj, id) => {
      if (obj.visible) {
        plotObject(id)
      }
    })

    toggleMap(model.globalState.showMap)
    togglePithoi(model.globalState.showPithoi)
    toggleRocks(model.globalState.showRocks)
  }

  //#endregion

  // {id : "point{x}-{y}" , fragmentIds: Array}
  var dotsOnMap = new Map()

  function processObject(objectID, visible) {
    if (visible) {
      sourceData.objectData.get(objectID).fragments.forEach(f => processFragment(f))
    } else {
      sourceData.objectData.get(objectID).fragments.forEach(f => processRemoveFragment(f))
    }
  }

  function processFragment(fragID) { // multiple fragments of the same object, should be fine // called again when resizing
    var frag = getFragmentData(fragID)
    var pointID = "point" + frag.x + "-" + frag.y
    var fragmentArray = dotsOnMap.get(pointID)
    if (fragmentArray == null) {
      dotsOnMap.set(pointID, [fragID])
      plotFragment(frag, pointID)
      addFragmentLabel(frag)
    } else {
      if (fragmentArray.length == 0) {
        fragmentArray.push(fragID)
        plotFragment(frag, pointID)
        addFragmentLabel(frag)
      } else {
        fragmentArray.push(fragID)
        updateFragmentLabel([frag.x, frag.y]) 
      }
    }
  }

  function plotFragment(frag, pointID) {
    points.append("circle")
        .attr("cx", x(frag.x))
        .attr("cy", y(frag.y))
        .attr("stroke", "green")
        .attr("r", 10)
        .attr("id", pointID)
    .style("cursor", "pointer")
        .on("click", mapIconClicked)
  }

  function addFragmentLabel(frag) {
    pointsLabels.append("text")
      .attr("x", x(frag.x)+10)
      .attr("y", y(frag.y)-10)
      .attr("id", "point" + frag.x + "-" + frag.y + "text")
      .attr("transform", d => `rotate(-45,${x(frag.x) + 10},${y(frag.y) - 10})`)
      .text(frag.name)
  }

  function processRemoveFragment(fragID) {
    var frag = getFragmentData(fragID)
    var pointID = "point" + frag.x + "-" + frag.y
    var fragmentArray = dotsOnMap.get(pointID)
    var fragIDIndex = fragmentArray.indexOf(fragID)
    fragmentArray.splice(fragIDIndex, 1)
    console.log(fragmentArray)
    
    updateFragmentLabel([frag.x, frag.y])
    console.log(fragmentArray.length)
    if (fragmentArray.length == 0) {
      d3.select("#"+pointID).remove()
    } else {
      var someObjectSelected = fragmentArray.map(f => getObjectState(f.object)).some(o => o.selected)
      if (!someObjectSelected) {
        d3.select(pointID).attr("fill", "black")
      }
    }
  }
  
  function updateFragmentLabel (location) {
    var fragments = dotsOnMap.get("point" + location[0] + "-" + location[1]).map(f => getFragmentData(f))
    var svgElement = d3.select("#point" + location[0] + '-' + location[1] + "text")
    if (fragments.length == 0) {
      svgElement.remove()
    } else {
      if (fragments.length == 1) {
        svgElement.text(fragments[0].name)
      } else {
        svgElement.text(fragments[0].name + " + " + (fragments.length - 1))
      }
    }
  }
  
  var lastSelectedPoint = null

  function mapIconClicked(event) {
    if (lastSelectedPoint != null) {
      d3.select(`#${lastSelectedPoint}text`).attr("visibility", "visible")
    }
    
    overlap.selectAll("*").remove();


    let fragmentsOnPoint = dotsOnMap.get(event.srcElement.id)
    if (fragmentsOnPoint.length > 1) {
        multiobjectClicked(event, fragmentsOnPoint)
    } else {
        objectClicked(getFragmentData(fragmentsOnPoint[0]).object)
    }
  }

  function multiobjectClicked(event, fragmentsOnPoint) {
    var cx = event.srcElement.cx.baseVal.value
    var cy = event.srcElement.cy.baseVal.value
    var pointID = event.target.id
    d3.select(`#${pointID}text`).attr("visibility", "hidden")
    
    overlap.append("g")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .selectAll("overlap")
      .data(fragmentsOnPoint)
      .join("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 10)
      .attr("id", d => d)
      .attr("fill", d => {
        var state = getObjectState(getFragmentData(d).object)
        if (state.selected) {
          return "greenyellow"
        } else {
          return "black"
        }
      })
      .on("click", event => {
        overlap.selectAll("*").remove()
        d3.select(`#${pointID}text`).attr("visibility", "visible")
        objectClicked(getFragmentData(event.target.id).object)
      })
      .style("cursor", "pointer")
      .transition()
      .duration(500)
      .attr("cy", (d, i) => cy - i * 20)


    // labels
    overlap.append("g")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .selectAll("text")
      .data(fragmentsOnPoint)
      .join("text")
      .attr("x", cx+15)
      .attr("y", cy-10)
      .attr("id", d => "multi" + d + "text")
      .attr("transform", d => `rotate(-45,${cx + 15},${cy - 10})`)
      .text(d => getFragmentData(d).name)
      .transition()
      .duration(500)
      .attr("transform", (d, i) => `rotate(-45,${cx + 15},${cy - i * 20 - 10})`)
      .attr("y", (d, i) => cy - i * 20 - 10)
  }



  function objectClicked(objectID) {
    var objState = getObjectState(objectID)
    console.log(objectID, objState)
    if (!(objState.selected)) {
      objState.selected = true

      loadObjectInfoPanel(objectID)

      if (model.objectStates.get(objectID).visualizations.lines) {
        connectRegion(objectID)
      }
      console.log("shaded" + model.objectStates.get(objectID).visualizations.shaded)
      if (model.objectStates.get(objectID).visualizations.shaded) {
        shadeObjectRegion(objectID)
      }

      //highlight fragments
      getObjectIDFragments(objectID).forEach(f => {
        d3.select(`#point${f.x}-${f.y}`).attr("fill", "greenyellow")
      })
    } else {
      objState.selected = false

      removeLines(objectID)
      removeShading(objectID)

      document.getElementById(`${objectID}InfoCollapsible`).remove()
      document.getElementById(`${objectID}InfoDiv`).remove()
      w2ui[`${objectID}visualizations`].destroy()
      w2ui[`${objectID}info`].destroy()

      getObjectIDFragments(objectID).forEach(f => {
        var pointID = `point${f.x}-${f.y}`
        var someObjectSelected = dotsOnMap.get(pointID).some(f => {
          return getObjectState(getFragmentData(f).object).selected
        })
        console.log(someObjectSelected)
        if (!someObjectSelected) {
          d3.select("#" + pointID).attr("fill", "black")
        }
      })
    }
  }

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
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("x2", d => x(d.xNext))
        .attr("y2", d => y(d.yNext))

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

  var pithosSVG = d3.xml('imgs/pithos.svg')
  function togglePithoi(toggle) {
    if (toggle) {
      points
      .selectAll("pithos")
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
      points.selectAll("pithos").remove()
    }
  }

  var rockSVG = d3.xml('imgs/rock.svg')
  function toggleRocks(toggle) {
    if (toggle) {
      points
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
      points.selectAll("rock").remove()
    }
  }

  function toggleMouseCoordinates(toggle) {
    const coordinates = d3.select('#coordinates')
    if (toggle) {
      coordinates.style('color', 'transparent')
    } else {
      coordinates.style('color', 'black')
    }
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

// $(window).resize(function() {
//   if(this.resizeTO) clearTimeout(this.resizeTO);
//   this.resizeTO = setTimeout(function() {
//       $(this).trigger('resizeEnd');
//   }, 500);
// });

// $(window).bind('resizeEnd', function() {
//     var height = $("#ma-p").width()/2;
//     $("#map svg").css("height", height);
//     draw(height);
// });
