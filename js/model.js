function loadNewModel(sourceData) {
    var globalState = {showMap: false, showPithoi: false, showRocks: false, selectedObject: 'none', pos: {x: 0, y: 0, z: 100.0}}

    var fragmentStates = new Map()
    sourceData.fragmentData.forEach((value, key) =>{
        fragmentStates.set(key, {visible: false, color: "red", visualization: true})
    })

    var objectStates = new Map()
    sourceData.objectData.forEach((value, key) => {
        objectStates.set(key, {visible: false, color: "red", visualization: true})
    })

    var categoryStates = new Map()
    sourceData.categoryData.forEach((value, key) => {
        categoryStates.set(key, {visible: false, color: "red", visualization: true})
    })

    model = {globalState: globalState, fragmentStates: fragmentStates, objectStates: objectStates, categoryStates: categoryStates}
}

function loadModel(sourceData, states) {
    
}