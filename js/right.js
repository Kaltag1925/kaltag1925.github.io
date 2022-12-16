function updateSelectedObject(objectID) {
  if (model.globalState.selectedObject != null) {
    removeObjectInfoPanel(model.globalState.selectedObject) 
  }
  loadObjectInfoPanel(objectID)
  updateModel(function() {model.globalState.selectedObject = objectID})
}

function loadObjectInfoPanel(objectID) {
  object = sourceData.objectData.get(objectID)
  
  d3.select("#right").html("")

  var infoDiv = d3.select("#right")
    .append("div")
    .attr("id", `${objectID}InfoDiv`)
  
  infoDiv.append("button")
    .html("Info")
    .on("click", () => {
      d3.select(`#${objectID}TabHead`).html("")
      // updateModel(function(){getObjectState(objectID).ui.tab = "info"})
      displayObjectInfo(objectID)
    })
  
  infoDiv.append("button")
    .html("Properties")
    .on("click", () => {
      d3.select(`#${objectID}TabHead`).html("")
      // updateModel(function(){getObjectState(objectID).ui.tab = "properties"})
      displayObjectProperties(objectID)
    })

  infoDiv.append("div")
    .attr("id", `${objectID}InfoHead`)
    
    .append("div")
    .attr("id", `${objectID}TabHead`)

  displayObjectInfo(objectID)  

  infoDiv.append(displayObjectFragments(objectID))
}

function removeObjectInfoPanel(objectID) {
  d3.select(`#${objectID}InfoDiv`).remove()
  // updateModel(function(){
  //   getObjectState(objectID).ui.tab = "info"
  // })
  // updateModel(function(){getObjectData(objectID).fragments.forEach(f => {
  //   getFragmentState(f).ui.infoExpanded = false
  //   getFragmentState(f).ui.tab = "info"
  // })})

  d3.select("#right").html("No Object Selected")
}

function toggleInfo(id, state) {
  var collapsible  = d3.select(`#${id}InfoCollapsible`)
  
  var toggled = collapsible.classed("active")
  // updateModel(function(){state.ui.infoExpanded = !toggled})
  collapsible.classed("active", !toggled)
  
  var content = d3.select(`#${id}InfoDiv`)
  if (!toggled) {
    content.style("max-height", "fit-content")
  } else {
    content.style("max-height", null)// this should be a css class?
  }
}
var colors = [
      "red",
      "blue",
      "green",
      "gold",
      "purple",
      "orange",
      "grey"
    ]

function displayObjectInfo(objectID) {
  var object = getObjectData(objectID)
  d3.select(`#${objectID}TabHead`).append("button")
    .html("Hide Object")
    .on("click", e => {
      objectVisible(objectID, false)
    })
  
  d3.select(`#${objectID}TabHead`).append("div")
    .html(`<img src='./imgs/pot1.jpg'><br>This is <b>${object.name}</b>.

    <br><br>

    It is a piece of Cypriot pottery.</b>.<br>
    It has <b>${object.fragments.length}</b> fragments.<br>

    <br><br>

    <b>Location:</b> ${object.origLoc}<br>
    <b>Type:</b> ${object.type}<br>
    <b>Description:</b> ${object.desc}<br>
    <b>Location Notes:</b> ${object.locationNotes}<br>

    Fragments:<br>`)
}

function displayObjectFragments(objectID) {
  var object = getObjectData(objectID)
  var fragments = object.fragments

  var divs = d3.select(`#${objectID}InfoHead`).append("div")
    .selectAll("div")
    .data(fragments)
    .enter()
    .append("div")


  divs.append("button")
    .attr("id", fID => {
      console.log(fID)
      return `${fID}InfoCollapsible`
    })
    .attr("class", "collapsible")
    .html(fID => {
      f = getFragmentData(fID)
      return f.name
    })
    .on("click", function(event,fID) {
      toggleInfo(fID, getFragmentState(fID))
    })

  var infoDiv = divs.append("div")
    .attr("class", "content")
    .attr("id", fID => `${fID}InfoDiv`)
    
  infoDiv.append("button")
    .html("Info")
    // .on("click", (e, fID) => {
    //   d3.select(`#${fID}TabHead`).html("")
    //   updateModel(function(){getFragmentState(fID).ui.tab = "info"})
    //   displayFragmentInfo(fID)
    // })
  
  // infoDiv.append("button")
  //   .html("Properties")
  //   .on("click", (e, fID) => {
  //     d3.select(`#${fID}TabHead`).html("")
  //     updateModel(function(){getFragmentState(fID).ui.tab = "properties"})
  //     displayFragmentProperties(fID)
  //   })

  infoDiv.append("div")
    .attr("id", fID => `${fID}InfoHead`)
    
    .append("div")
    .attr("id", fID => `${fID}TabHead`)

  infoDiv.each(fID => displayFragmentInfo(fID))

  // divs.each((fID, i) => {
  //   if (getFragmentState(fID).ui.infoExpanded) {
  //     toggleInfo(fID, getFragmentState(fID))
  //   }

  //   d3.select(`#${fID}${getFragmentState(fID).color}button`).attr("class", "color-button-toggled")

  //   if (getFragmentState(fID).ui.tab == "info") {
  //     displayFragmentInfo(fID)
  //   }

  //   if (getFragmentState(fID).ui.tab == "properties") {
  //     displayFragmentProperties(fID)
  //   }

  // })
}

function displayFragmentInfo(fragID) {
  d3.select(`#${fragID}TabHead`).html(fID => {
    var f = getFragmentData(fID)
    
    var importantText = ""
    if (f.important) {
      importantText =  "Important"
    } else {
      importantText = "Not Important"
    }

    var tentativeText = ""
    if (f.tentative) {
      tentativeText = "Tentative"
    } else {
      tentativeText = "Not Tentative"
    }
    return `
    <b>Location:</b> ${f.origLoc}<br>

    <br><br>

    This fragment is:<br>
    <b>${importantText}</b><br>
    <b>${tentativeText}</b>
    `
  })
}

function displayFragmentProperties(fragID) {
  var tabHead = d3.select(`#${fragID}TabHead`)

  // var colorGrid = tabHead.append("div")
  //   .attr("class", "color-grid")

  // colorGrid.selectAll("button")
  //   .data(colors)
  //   .join("button")
  //   .attr("id", c => fragID + c + "button")
  //   .style("background-color", c => c)
  //   .attr("class", "color-button")
  //   .on("click", (e, c) => {
  //     var button = e.target
  //     if (getFragmentState(fragID).color != c) {
  //       var objectID = getFragmentData(fragID).object
  //       if (getObjectState(objectID).color != "none") {
  //         d3.select(`#${objectID}${getObjectState(objectID).color}button`).attr("class", "color-button")
  //         updateModel(function() {getObjectState(objectID).color = "none"})
  //       }
  //       d3.select(`#${fragID}${getFragmentState(fragID).color}button`).attr("class", "color-button")
  //       d3.select(button).attr("class", "color-button-toggled")
  //       updateModel(function() {getFragmentState(fragID).color = c})

  //       changeFragmentColor(fragID, c)
  //     }
  //   })
}

function displayObjectProperties(objectID) {
  var objectState = getObjectState(objectID)
  var tabHead = d3.select(`#${objectID}TabHead`)

  var showLabel = tabHead.append("div")
  
  var showLabelButton = showLabel.append("input")
    .attr("type", "checkbox")
    .attr("id", "showLabel")
    .attr("name", "showLabel")
    .on("click", e => {
      var button = e.target
      if (objectState.visualizations.showLabel) {
        updateModel(function() {objectState.visualizations.showLabel = false})
      } else {
        updateModel(function() {objectState.visualizations.showLabel = true})
      }
    })

  if (objectState.visualizations.showLabel) {
    showLabelButton.property("checked", true)
  }

  showLabel.append("label")
    .html("Show Labels")
    .attr("for", "showLabel")
    
  // var colorGrid = tabHead.append("div")
  //   .attr("class", "color-grid")

  // colorGrid.selectAll("button")
  //   .data(colors)
  //   .join("button")
  //   .attr("id", (c, i, n) => objectID + c + "button")
  //   .style("background-color", c => c)
  //   .attr("class", "color-button")
  //   .on("click", (e, c) => {
  //     var button = e.target
  //     if (objectState.color != "none") {
  //       d3.select(`#${objectID}${objectState.color}button`).attr("class", "color-button")
  //     }
  //     d3.select(`#${objectID}${objectState.color}button`).attr("class", "color-button")
  //     d3.select(button).attr("class", "color-button-toggled")
  //     updateModel(function() {objectState.color = c})
  //     getObjectData(objectID).fragments.forEach(fragID => {
  //       d3.select(`#${fragID}${getFragmentState(fragID).color}button`).attr("class", "color-button")
  //       updateModel(function() {getFragmentState(fragID).color = c})
  //       changeFragmentColor(fragID, c)
  //     })
  //   })
    
  //   d3.select(`#${objectID}${getObjectState(objectID).color}button`).attr("class", "color-button-toggled")
}