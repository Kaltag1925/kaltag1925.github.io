
  /*
  https://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
  */
  var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
      if (!uniqueId) {
        uniqueId = "Don't call this twice without a uniqueId";
      }
      if (timers[uniqueId]) {
        clearTimeout (timers[uniqueId]);
      }
      timers[uniqueId] = setTimeout(callback, ms);
    };
  })();

  window.onresize = function() {
    waitForFinalEvent(function() {
      d3.select("#map").html("")
      startMap() // need to save zoom/pan
    })
  }

  function reset() {
    d3.select("#menuBar").html("")
    d3.select("#map").html("")
    d3.select("#navigationToolbar").html("")
    d3.select("#navigationSearch").html("")
    d3.select("#navigation").html("")
    d3.select("#mapOptions").html("")
    d3.select("#right").html("No Object Selected")

    w2ui["navigation"].destroy()

    loadNewModel(sourceData)
    loadUI()
    startMap()
  }

  function reload() {
    d3.select("#menuBar").html("")
    d3.select("#map").html("")
    d3.select("#navigationToolbar").html("")
    d3.select("#navigationSearch").html("")
    d3.select("#navigation").html("")
    d3.select("#mapOptions").html("")
    d3.select("#right").html("No Object Selected")

    w2ui["navigation"].destroy()

    loadUI()
    startMap()
  }

  $(document).ready(function () {
    readWreckDataFile()
    
    d3.select("#main").on("click", e => {
      //console.log(e.path)
      //console.log(e.path.includes(el => el.id == "overlap"))
      if (model.globalState.multiRegionSelected && !e.path.includes(el => el.id == "overlap")) {
        removeOverlap()
      }
    })
  })

function loadUI() {
  console.log("Started Loading UI")

  loadMenuBar();
  loadNavigation();
  loadNavigationToolbar();
  loadMapOptions();
  
  console.log("Finished Loading UI");
}

function loadMenuBar() {
  var menuBar = d3.select("#menuBar")

  menuBar.append("button")
    .html("Reset")
    .on("click", (e) => {
      var oldModel = serializeAModel(model)
      reset()
      displayNotification("Reset", () => {
        updateModel(() => {
          if (importModel(oldModel)) {
            displayNotification("Undone Reset")
          } else {
            displayNotification("Error undoing reset, corrupt model or something went wrong, contact Davis")
          }
        })
      })
    })

  menuBar.append("button")
    .html("Export")
    .on("click", saveExport)

  function saveExport() {
    var exportText = serializeAModel(model)
    navigator.clipboard.writeText(exportText).then(() => {
      alert("Copied Code to Clipboard");
    })
    .catch(() => {
      alert("something went wrong");
    });
  }

  menuBar.append("button")
    .html("Import")
    .on("click", loadImport)

  function loadImport() {
    var importText = prompt("Paste Code", "code here")
    if (importText != null && importText != "") {
      var oldModel = serializeAModel(model)
      
      if (importModel(importText)) {
        displayNotification("Model Imported", () => {
          updateModel(() => {
            if (importModel(oldModel)) {
              displayNotification("Undone Import")
            } else {
              displayNotification("Error undoing import, corrupt model or something went wrong, contact Davis")
            }
          })
        })
      } else {
        displayNotification("Error importing, corrupt model or something went wrong, contact Davis")
      }
    }
  }

  menuBar.append("button")
    .html("Export Screenshot (Does Nothing)")

  menuBar.append("div")
    .html("|")
    .style("display", "inline-block")

  var saveDiv = menuBar.append("div")
    .attr("class", "dropdown")

  saveDiv.append("button")
    .html("Saves")

  var dropDown = saveDiv.append("div")
    .attr("class", "dropdown-content")
    
    var saveContent = dropDown.append("div")
  
    // TODO? There might be a way to do this with d3 joins but I cant think of it

    saveStateModel.saves.forEach(s => addSaveButton(s))

    function addSaveButton(save) {
        var saveOptionsDivs = saveContent.append("div")
        .classed("dropdown2", true)
        .attr("id", `${save.name}Div`)
        
        saveOptionsDivs.append("button")
        .classed("save-button", true)
        .attr("id", `${save.name}Button`)
        .html(save.name)
        
        var saveOptionsDrownDown = saveOptionsDivs.append("div")
        .classed("dropdown-content-side", true)

        saveOptionsDrownDown.append("button")
        .html("Save")
        .style("width", "100%")
        .on("click", (e) => {
            if (window.confirm("Are you sure you want to overwrite " + save.name + "?")) {
                var oldModel = save.model
                updateSaveModel(
                    () => saveStateModel.saves.find(e => e.name = save.name).model = serializeAModel(model)// TODO make this a functioN?
                )
                
                displayNotification("Saved to " + save.name, () => {
                  updateSaveModel(
                    () => saveStateModel.saves.find(e => e.name = save.name).model = oldModel
                  )
                })
            }
        })
    
        saveOptionsDrownDown.append("button")
        .html("Load")
        .style("width", "100%")
        .on("click", (e) => {
            if (window.confirm("Are you sure you want to load " + save.name + "?")) {
                var oldModel = serializeAModel(model)
                if (importModel(save.model)) {
                  displayNotification("Loaded " + save.name, () => {
                    updateModel(() => {
                      if (importModel(oldModel)) {
                        displayNotification("Undone Load")
                      } else {
                        displayNotification("Error undoing load, corrupt model or something went wrong, contact Davis")
                      }
                    })
                  })
                } else {
                  displayNotification("Error loading, corrupt model or something went wrong, contact Davis")
                }
            }
        })

        saveOptionsDrownDown.append("button")
        .html("Rename")
        .style("width", "100%")
        .on("click", (e) => {
            var newName = getName()
            if (newName != null) {
                updateSaveModel(
                    () => saveStateModel.saves.find(e => e.name = save.name).name = newName
                )

                d3.select(`#${save.name}Button`).html(newName)
            }
        })

        saveOptionsDrownDown.append("button")
        .html("Delete")
        .style("width", "100%")
        .on("click", (e) => {
            if (window.confirm("Are you sure you want to delete " + save.name + "?")) {
                var indexOfSave = saveStateModel.saves.findIndex(e => e.name = save.name)
                updateSaveModel(
                    () => saveStateModel.saves.splice(saveStateModel.saves.findIndex(e => e.name = save.name), 1)
                )
                d3.select(`#${save.name}Div`).remove()
                
                displayNotification("Deleted " + save.name, () => {
                  updateSaveModel(
                    () => saveStateModel.saves.splice(indexOfSave, 0, save)
                  )
                })
            }
        })
        
    }

    dropDown.append("button")
        .html("New Save")
        .classed("save-button", true)
        .on("click", () => {
            var name = getName()
            if (name != null) {
                var newSave = {
                    name: name,
                    model: serializeAModel(model)
                }
                updateSaveModel(
                    () => saveStateModel.saves.push(newSave)
                )
                
                addSaveButton(newSave)
            }
        })

    function getName() {
        var name = prompt("Give it a name", "")
        if (name != null) {
            if (name == "") {
                alert("Invalid Name")
                return getName()
            } else {
                return name
            }
        }
    }
}

//TODO: CLEANUP: please make better
var notifications = 0
function displayNotification(text, callback) {
    if (callback == null) {
      //"temporary" fix until I figure out how I want to handle notifications
    } else {
    if (callback != null) {
      d3.select("#undoButton").style("display", "")
    } else {
      d3.select("#undoButton").style("display", "none")
    }
    //need to plan this out, what if another undo is put up by a new save or load
    // updatingUndo = true
    notifications++
    d3.select("#notificationDiv").classed("notification-instant-hide", true)
    
    d3.select("#notificationDiv").style("transform")
    
    d3.select("#notificationDiv").classed("notification-hide", false)
    .classed("notification-instant-hide", false)
      
    d3.select("#notificationText").html(text + " ")
    d3.select("#undoButton").on("click", () => {
      callback()
      console.log("done")
      d3.select("#undoButton").style("display", "none")
      d3.select("#notificationDiv").classed("notification-hide", true)
    })
    new Promise(r => {
      setTimeout(r, 10000)
    }).then(() =>{
      if (notifications <= 1) {
        //TODO: hide button once transition complete?
        d3.select("#undoButton").style("display", "none")
        d3.select("#notificationDiv").classed("notification-hide", true)
      }
    }).then(notifications--)
    // updatingUndo = false
    // TODO: umm race conditions 🤓
  }
}

function toggleObject(objectID) {
  if (getObjectState(objectID).visible) { 
    objectVisible(objectID, false)   
  } else { // hidden
    objectVisible(objectID, true)   
  }
}

function loadNavigation() {
  $("#navigation").w2sidebar({
    name: 'navigation',
    img: null,
    handle: {
        size: 22,
        style: `height: 22px; width: 22px; margin-top: 1px; margin-left: 0px`,
        html: `<div name="toggle" onclick='w2ui.navigation.toggle(this, event)'></div>`
    },
    // https://blog.davidcassel.net/2010/01/why-is-it-flickering/ i love this man <3<3<3 TODO: tooltips?
    toggle(el) { // TODO??? If you double click it it comes up with a different element that doenst have an ID?
      console.log(query(el))
      var objectID = query(el).closest('.w2ui-node')[0].id.substring(5)
      
      toggleObject(objectID)

      event.preventDefault()
      event.stopPropagation()
    },
    onClick: function(event) {
      console.log(event.object)
      var objectID = event.object.id

      if (getObjectState(objectID).visible) {
        if (model.globalState.selectedObject != null) {
          processObjectDeselected(model.globalState.selectedObject)
        } // TODO: CLEANUP this pattern or function or whatever exists in multiple places in the code, need to unify it
        // P.S. le techincal debt has arrived
        processObjectSelected(objectID)
        updateModel(function() {model.globalState.selectedObject = objectID})
      } else {
        toggleObject(objectID)
      }
    },
    onRefresh(event) {
      event.done(() => {
        var nodeParent = w2ui.navigation.box.querySelector(".w2ui-sidebar-body")
    
        var nodes = d3.select(nodeParent).selectAll(".w2ui-level-0")
          .datum((d, i, n) => {
            return d3.select(n[i]).attr("id").substring(5)
          })
          //TODO: is this gonna cause issues with the sort function since it uses the same method ie replacing the data bad?
          //maybe i dont need to do this just store it in the beginning?
        
        if (!nodes.empty()) {
          nodes.selectAll("[name=toggle]")
          .attr("class", (d, i, n) => {
            var objectID = d3.select(n[i].parentNode.parentNode).datum()
            if (getObjectState(objectID).visible) {
              return d3.select(n[i]).attr("class") + " toggle"
            } else {
              return d3.select(n[i]).attr("class")
            }
          })
        }
      })
    }
  });
  var nodes = Array.from(sourceData.objectData, o => objectToNode(o));
  w2ui['navigation'].add(nodes);

  function objectToNode(pair) {
      var objectID = pair[0]
      var object = pair[1]

      var mainNode = {categories: object.categories, id: objectID, text: object.name, count: object.fragments.length}//, nodes: object.fragments.map(f => fragmentToNode(f, sourceData))};
      return mainNode;
  }

  d3.select("#search").on("keyup", function(event) { 
      if(event.code == "Enter") {
        search(event.target)
      };
    })

  d3.select("#searchButton").on("click", function(event) { 
      search(document.getElementById("search"))
    })

}

function search(searchBar) {
  var value = searchBar.value
  let sb = w2ui.navigation
  sb.last_search = value

  var regex = new RegExp(value, "i")
  var count = 0;
  sb.nodes.forEach(n => {
    var object = getObjectData(n.id)
    var filtered = !object.categories.every(objCat => !model.globalState.activeFilters.includes(objCat))
    var notSearched = object.name.search(regex) == -1
    if (filtered || notSearched) {
      sb.hide(n.id)
    } else {
      sb.show(n.id)
      count += 1
    }
  })

  //sb.refresh()
  //let count = sb.search(value)
  sb.expandAll()
  query(sb.box).find('#empty-search').remove()
  if (count == 0) {
      query(sb.box)
          .append('<div id="empty-search" style="font-size: 13px; color: #666; z-index: 1400; top: 45%; left: 50%; transform: translateX(-50%); width: 100%!important; text-align: center">No nodes found</div>')
  }

}

function objectVisible(objectID, isVisible) {
  var toggle = document.getElementById(`node_${objectID}`).querySelector("div[name='toggle']")
  if (isVisible) {
    query(toggle).addClass("toggle")
    if (model.globalState.selectedObject != null) {
      removeObjectInfoPanel(model.globalState.selectedObject)
      unhighlightObject(model.globalState.selectedObject) //TODO: CLEANUP Does this need to call deselect object?
    }

    loadObjectInfoPanel(objectID)
    updateModel(function() {model.globalState.selectedObject = objectID})
  } else {
    query(toggle).removeClass("toggle")
    if (model.globalState.selectedObject == objectID) {
      removeObjectInfoPanel(objectID)
      updateModel(function() {model.globalState.selectedObject = null})
      unhighlightObject(objectID)
    }
  }
  updateModel(function() {getObjectState(objectID).visible = isVisible});
  sourceData.objectData.get(objectID).fragments.forEach(fID => updateModel(function() {getFragmentState(fID).visible = isVisible}))

  processObject(objectID, isVisible)
  
  if (isVisible) {
    highlightObject(objectID)
  }
}

function loadMapOptions() {
  var mapOptions = d3.select("#mapOptions")//.style("overflow", "auto")

  var mapToggle = mapOptions.append("div")

  mapToggle.append("input")
    .attr("id", "mapToggle")
    .attr("type", "checkbox")
    .property("checked", () => {return model.globalState.showMap})
    .on("click", (e) => {
      if (d3.select(e.target).property("checked")) {
        updateModel(function() {model.globalState.showMap = true})
        toggleMap(true)
      } else {
        updateModel(function() {model.globalState.showMap = false})
        toggleMap(false)
      }
    })

  mapToggle.append("label")
    .attr("for", "mapToggle")
    .html("Show Map")

  var mouseCoordinatesToggle = mapOptions.append("div")

  mouseCoordinatesToggle.append("input")
    .attr("id", "mouseCoordinatesToggle")
    .attr("type", "checkbox")
    .property("checked", () => {return model.globalState.showMouseCoordinates})
    .on("click", (e) => {
      if (d3.select(e.target).property("checked")) {
        updateModel(function() {model.globalState.showMouseCoordinates = true})
        toggleMouseCoordinates(true)
      } else {
        updateModel(function() {model.globalState.showMouseCoordinates = false})
        toggleMouseCoordinates(false)
      }
    })
  
  mouseCoordinatesToggle.append("label")
    .attr("for", "mouseCoordinatesToggle")
    .html("Show Mouse Coordinantes")

  
  var specificGridToggle = mapOptions.append("div")
  
  specificGridToggle.append("input")
    .attr("id", "specificGridToggle")
    .attr("type", "checkbox")
    .property("checked", () => {return model.globalState.showSpecificGrid})
    .on("click", (e) => {
      if (d3.select(e.target).property("checked")) {
        updateModel(function() {model.globalState.showSpecificGrid = true})
        toggleSpecificGrid(true)
      } else {
        updateModel(function() {model.globalState.showSpecificGrid = false})
        toggleSpecificGrid(false)
      }
    })

    specificGridToggle.append("label")
    .attr("for", "specificGridToggle")
    .html("Show Specfic Grid")

  var hideKey = mapOptions.append("div")

  hideKey.append("input")
    .attr("id", "hideKey")
    .attr("type", "checkbox")
    .property("checked", () => {return !model.globalState.hideKey})
    .on("click", (e) => {
      if (d3.select(e.target).property("checked")) {
        updateModel(function() {model.globalState.hideKey = false})
        toggleKey(true)
      } else {
        updateModel(function() {model.globalState.hideKey = true})
        toggleKey(false)
      }
    })

  hideKey.append("label")
    .attr("for", "hideKey")
    .html("Show Key")

    //000000//

  var clickMethod = mapOptions.append("div")

  var toggle = clickMethod.append("label").attr("class", "switch")

  toggle.append("input")
    .attr("id", "clickMethod")
    .attr("type", "checkbox")
    .property("checked", () => {return model.globalState.clickMethod})
    .on("click", (e) => {
      var label = d3.select("#clickMethodLabel")
      removeOverlap()
      console.log(d3.select(e.target).property("checked"))
      if (d3.select(e.target).property("checked")) {
        label.html("Click on Grid Square")
        updateModel(function() {model.globalState.clickMethod = true})
      } else {
        label.html("Click on Region")
        updateModel(function() {model.globalState.clickMethod = false})
      }
    })

  toggle.append("span")
    .attr("class", "slider round")
  //.attr("class", "toggle")

  clickMethod.append("label")
  .attr("id", "clickMethodLabel")
  .attr("for", "clickMethod")
  .html(() =>{
    if (model.globalState.clickMethod) {
      return "Click on Grid Square"
    } else {
      return "Click on Region"
    }
    })
}

function loadNavigationToolbar() {
  var toolbar = d3.select("#navigationToolbar").style("display", "flex").style("align-items", "stretch")

  if (debug) {
    toolbar.append("button")
      .html("Select All")
      .on("click", selectAll)
  }

    /*
  toolbar.append("button")
    .html("Deselect All")
    .on("click", deselectAll)*/

  var categories = Array.from(sourceData.categoryData.keys())

  function filter(c, hide) {
    w2ui.navigation.nodes.forEach(n => {
      if (n.categories.includes(c) && hide) {
        w2ui.navigation.hide(n.id)
      } else {
        if (n.categories.every(objCat => !model.globalState.activeFilters.includes(objCat))) {
          w2ui.navigation.show(n.id)
        }
      };
    });
  }

  var filterNode = toolbar.append("div").style("width", "auto")
    .attr("class", "dropdown").style("flex-grow", "100")
  
  filterNode.append("button").style("width", "100%")
    .attr("class", "dropbtn")
    .html("Filter")//.style("flex-grow", "100")

  var div = filterNode.append("div")
    .attr("class", "dropdown-content")
    
  div.selectAll("button")
    .data(categories)
    .enter()
    .append("button")
    .attr("class", "button-toggled")
    .attr("id", c => `${c}button`)
    .html(c => sourceData.categoryData.get(c).name)
    .on("click", (e, c) => {
      var button = d3.select(e.target)
      var index = model.globalState.activeFilters.indexOf(c)
      if (index != -1) {
        button.attr("class", "button-toggled")
        updateModel(function() {model.globalState.activeFilters.splice(index, 1)})
        filter(c, false)
      } else {
        button.attr("class", "button")
        updateModel(function() {model.globalState.activeFilters.push(c)})
        filter(c, true)
      }
      w2ui.navigation.refresh()
    })
    .each(c => {
      // d3.select(this) is supposed to work but it just returns the window
      var button = d3.select(`#${c}button`)
      var index = model.globalState.activeFilters.indexOf(c)
      if (index != -1) {
        button.attr("class", "button")
        filter(c, true)
      }
    })

    var buttonDiv = div.append("div").style("display", "flex")

    buttonDiv.append("button")
      .attr("id", "showAll")
      .html("Show All")
      //.style("width", "30%")
      .style("flex-grow", "1")
      .on("click", (e) => {
        var filtered = model.globalState.activeFilters
        updateModel(function() {model.globalState.activeFilters = []})
        filtered.forEach(c => {
          filter(c, false)
          d3.select(`#${c}button`).attr("class", "button-toggled")
        })
      })

    buttonDiv.append("button")
    .attr("id", "hideAll")
    .html("Hide All")
    //.style("width", "30%")
    .style("flex-grow", "1")
    .on("click", (e) => {
      var filtered = Array.from(categories)
      updateModel(function() {model.globalState.activeFilters = filtered})
      filtered.forEach(c => {
        filter(c, true)
        d3.select(`#${c}button`).attr("class", "button")
      })
    })


    /*
  model.globalState.activeFilters.forEach(f => {
    var i = filters.findIndex(e => e.type == f)
    if (i != -1) {
      filters[i].filterFunc(true)
    } else {
      console.log("No filter found for " + f)
    }
  })*/

  var sortDiv = toolbar.append("div").style("margin", "2px").style("margin-left", "4px")
  
  sortDiv.append("label")
    .attr("for", "sortBy")
    .html("Sort By: ")
    .style("vertical-align", "middle")

  var sorts = [
    {type: "Spreadsheet Order", sortFunc: sortSpreadsheet},
    {type: "Name", sortFunc: sortName},
    {type: "ID Number", sortFunc: sortIDNumber}
  ];

  function sortIDNumber() {
    var nodeParent = w2ui.navigation.box.querySelector(".w2ui-sidebar-body")
    
    var nodes = d3.select(nodeParent).selectAll(".w2ui-level-0")
      .datum((d, i, n) => {
        var objectID = n[i].id.substring(5)
        return getObjectData(objectID).name
      })

    var sorted = nodes.sort((a, b) => {
      var regex = /(?<type>[A-Z]+)\s(?<number>\d+)\+*(?<number2>\d*)/;
      var aParsed = a.match(regex);
      var bParsed = b.match(regex);


      if (aParsed == null) {
        console.log("Could not parse name of " + a + " when sorting by name.");
        return -1;
      }

      if (bParsed == null) {
        console.log("Could not parse name of " + a + " when sorting by name.");
        return 1;
      }

      var aNumber = parseInt(aParsed.groups.number);
      var bNumber = parseInt(bParsed.groups.number);
      
      if (aNumber == bNumber) {
        var aNumber2 = parseInt(aParsed.groups.number2);
        var bNumber2 = parseInt(bParsed.groups.number2);

        if (aNumber2 == NaN && bNumber2 != NaN) {
          return -1;
        };

        if (bNumber2 == NaN && aNumber2 != NaN) {
          return 1;
        };

        if (aNumber2 == NaN && bNumber2 == NaN) {
          return 0;
        }
        
        return aNumber2 - bNumber2;
      } else {
        return aNumber - bNumber;
      };
    });
  }

  function sortName() {
    var nodeParent = w2ui.navigation.box.querySelector(".w2ui-sidebar-body")
    
    var nodes = d3.select(nodeParent).selectAll(".w2ui-level-0")
      .datum((d, i, n) => {
        var objectID = n[i].id.substring(5)
        return getObjectData(objectID).name
      })

    var sorted = nodes.sort(sortObjectsByName)
  }

  function sortSpreadsheet() {
    var nodeParent = w2ui.navigation.box.querySelector(".w2ui-sidebar-body")
    
    var nodes = d3.select(nodeParent).selectAll(".w2ui-level-0")
      .datum((d, i, n) => {
        var objectID = n[i].id.substring(5)
        return objectID
      })

    var objArray = Array.from(sourceData.objectData.keys())

    var sorted = nodes.sort((a, b) => {
      return objArray.indexOf(a) - objArray.indexOf(b)
    })
  }

  var sortBy = sortDiv.append("select")
    .attr("name", "sorts")
    .attr("id", "sorts").style("vertical-align", "middle")
    .on("change", (e) => {
      var option = d3.select(e.target.options[e.target.selectedIndex])
      var data = option.data()[0]
      updateModel(function(){model.globalState.navigationSort = data.type})
      data.sortFunc()
    }) //toi tired rn but use event or params or smthn TODO
  
  if (model.globalState.navigationSort != null) {
    var i = sorts.findIndex(s => s.type == model.globalState.navigationSort)
    if (i != -1) {
      sorts[i].sortFunc()
    } else {
      updateModel(function() {model.globalState.navigationSort = sorts[0].type})
    }
  } else {
    updateModel(function() {model.globalState.navigationSort = sorts[0].type})
  }

  sortBy.html(model.globalState.navigationSort)

  sortBy.selectAll("option")
    .data(sorts)
    .enter()
    .append("option") 
    .attr("value", d => d)
    .html(d => d.type)
  // #endRegion
}

function selectAll() {
  sourceData.objectData.forEach((object, id) => {
    if (!getObjectState(id).visible) {
      objectVisible(id, true)
    }
  })
}

function deselectAll() {
  sourceData.objectData.forEach((object, id) => {
    if (getObjectState(id).visible) {
      objectVisible(id, false)
    }
  })
}

