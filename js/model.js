//https://stackoverflow.com/questions/1063813/listener-for-property-value-changes-in-a-javascript-object possibly this for detecting changes
function updateModel(func) {
    func()
    saveModel()
}

function updateSaveModel(func) {
    func()
    saveSaveStateModel()
}
// is there a better way?

//document.addEventListener("beforeunload", saveModel)

//$(window).bind('beforeunload', saveModel);


function saveModel() {
    window.localStorage.setItem("model", serializeAModel(model))
}

function saveSaveStateModel() {
    window.localStorage.setItem("saveStateModel", serializeAModel(saveStateModel))
}

function serializeAModel(m) {
    return JSON.stringify(m, replacer)
}

function importModel(modelStr) {
    try {
        modelObj = JSON.parse(modelStr, reviver)
        if (modelObj.isModel) {
            model = modelObj
            reload()
            return true
        } else { //corrupt or smthn
            //alert("Invalid Code or something went wrong")
            return false
        }
    } catch (error) {
        console.log(error)
        //alert("Invalid Code or something went wrong")
        return false
    }
}

function loadModel(sourceData) {
    try {
        var modelStr = window.localStorage.getItem("model")
        if (modelStr != null) {
            modelObj = JSON.parse(window.localStorage.getItem("model"), reviver)
            if (modelObj.isModel) {
                model = modelObj
            } else { //corrupt or smthn
                loadNewModel(sourceData)
            }
        } else {
            loadNewModel(sourceData)
        }
    } catch (error) {
        alert("Something went wrong with loading state, reseting")
        loadNewModel(sourceData)
    }
}

//todo error checkin
function loadSaveStateModel() {
    try {
        var modelStr = window.localStorage.getItem("saveStateModel")
        if (modelStr != null) {
            modelObj = JSON.parse(window.localStorage.getItem("saveStateModel"), reviver)
            if (modelObj.isModel) {
                saveStateModel = modelObj
            } else { //corrupt or smthn
                loadNewSaveStateModel()
            }
        } else {
            loadNewSaveStateModel()
        }
    } catch (error) {
        alert("Something went wrong with loading saves, reseting")
        loadNewSaveStateModel()
    }
}

//https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(key, value) {
    if(value instanceof Map) {
        return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
        return new Map(value.value);
        }
    }
    return value;
}

// TODO: CLEANUP to load a blank one by default then update with saved values
var saveStateModel = {
    saves: []
}

function loadSave(save) {
    model = save.data
}

function loadNewSaveStateModel() {
    saveStateModel = {
        isModel: true,
        saves: []
    }
    
}

function loadNewModel(sourceData) {
    console.log("New Model Loaded")
    console.trace()
    var globalState = {
        selectedObject: null,
        showMap: true, 
        showPithoi: false, 
        showRocks: false,
        showMouseCoordinates: true,
        showSpecificGrid: true,
        averageCellSize: false,
        transform: null,
        mapStarting: false,
        mergeOverlapingRegions: false,
        multiRegionSelected: false,
        activeFilters: [],
        navigationSort: null,
        mouseInsideMap: false,
        clickMethod: false,
        hideKey: false
        }

//TODO: CLEANUP

    var fragmentStates = new Map()
    sourceData.fragmentData.forEach((value, key) =>{
        fragmentStates.set(key, {visible: false, color: "red", visualizations: true, opacity: 1})
    })

    var objectStates = new Map()
    sourceData.objectData.forEach((value, key) => {
        objectStates.set(key, {visible: false, color: "red",  opacity: 1,
            visualizations: {
                showLabel: false
            }
        })
    })

    var categoryStates = new Map()
    sourceData.categoryData.forEach((value, key) => {
        categoryStates.set(key, {visible: false, color: "red", visualizations: true})
    })

    model = {isModel: true, globalState: globalState, 
        fragmentStates: fragmentStates, 
        objectStates: objectStates, 
        categoryStates: categoryStates}

    saveModel()
}

function getObjectState(objectID) {
    return model.objectStates.get(objectID)
}

function getFragmentState(fragID) {
    return model.fragmentStates.get(fragID)
}
