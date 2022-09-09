function loadNewModel(sourceData) {
    var globalState = {showMap: false, 
        showPithoi: false, 
        showRocks: false, 
        pos: {x: 0, y: 0, z: 100.0},
        mergeOverlapingRegions: false,
        multiRegionSelected: 
            {
                region: null,
                mx: 0,
                my: 0
            }
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

    model = {globalState: globalState, 
        fragmentStates: fragmentStates, 
        objectStates: objectStates, 
        categoryStates: categoryStates}
}

function getObjectState(objectID) {
    return model.objectStates.get(objectID)
}

function getFragmentState(fragID) {
    return model.fragmentStates.get(fragID)
}

function loadModel(sourceData, states) {
    
}

function setUpSidebarData(sourceData) {
    var nodes = Array.from(sourceData.objectData, o => objectToNode(o, sourceData));
    w2ui['navigation'].add(nodes);
}

function objectToNode(pair, sourceData) {
    var objectID = pair[0]
    var object = pair[1]

    var mainNode = {id: objectID, text: object.name, count: object.fragments.length, nodes: object.fragments.map(f => fragmentToNode(f, sourceData))};
    return mainNode;
}

function fragmentToNode(fragmentID, sourceData) {
    return { id: fragmentID, text: sourceData.fragmentData.get(fragmentID).name, onClick: function(event) {
        // find svg node based on position ID
        // make it beeeg
    // d3.select("#" + "point" + fragment.x + "-" + fragment.y + "").attr("r", 100)
    }}
}
