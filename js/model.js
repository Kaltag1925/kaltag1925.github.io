//https://stackoverflow.com/questions/1063813/listener-for-property-value-changes-in-a-javascript-object possibly this for detecting changes
function updateModel(func) {
    func()
    saveModel()
}
// is there a better way?

//document.addEventListener("beforeunload", saveModel)

//$(window).bind('beforeunload', saveModel);


function saveModel() {
    window.localStorage.setItem("model", JSON.stringify(model, replacer))
}

function loadModel(sourceData) {
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

function loadNewModel(sourceData) {
    console.log("New Model Loaded")
    console.trace()
    var globalState = {showMap: true, 
        showPithoi: false, 
        showRocks: false,
        showMouseCoordinates: true,
        averageCellSize: false,
        transform: null,
        mapStarting: false,
        mergeOverlapingRegions: false,
        multiRegionSelected: 
            {
                region: null,
                mx: 0,
                my: 0
            },
        activeFilters: [],
        navigationSort: null,
        mouseInsideMap: false
        }

    var fragmentStates = new Map()
    sourceData.fragmentData.forEach((value, key) =>{
        fragmentStates.set(key, {visible: false, color: "red", visualizations: true})
    })

    var objectStates = new Map()
    sourceData.objectData.forEach((value, key) => {
        objectStates.set(key, {visible: false, selected: false, color: "red", 
        visualizations: {
            lines: false,
            shaded: false
        }})
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
