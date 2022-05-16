function loadNewModel(sourceData) {
    var globalState = {showBackground: true, selectedObject: 'none', pos: {x: 0, y: 0, z: 100.0}}

    var fragmentStates = new Map()
    sourceData.fragmentData.forEach((key, value) =>{
        fragmentStates.set(key, {show: false, color: "red", visualization: true})
    })

    var objectStates = new Map()
    sourceData.objectData.forEach((key, value) => {
        objectStates.set(key, {show: false, color: "red", visualization: true})
    })

    var categoryStates = new Map()
    sourceData.categoryData.forEach((key, value) => {
        categoryStates.set(key, {show: false, color: "red", visualization: true})
    })

    model = {globalState: globalState, fragmentStates: fragmentStates, objectStates: objectStates, categoryStates: categoryStates}
}

function loadModel(sourceData, states) {
    
}