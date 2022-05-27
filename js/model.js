function loadNewModel(sourceData) {
    var globalState = {showMap: false, showPithoi: false, showRocks: false, selectedObject: 'none', pos: {x: 0, y: 0, z: 100.0}}

    var fragmentStates = new Map()
    sourceData.fragmentData.forEach((value, key) =>{
        fragmentStates.set(key, {visible: false, color: "red", visualizations: true})
    })

    var objectStates = new Map()
    sourceData.objectData.forEach((value, key) => {
        objectStates.set(key, {visible: false, color: "red", 
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
        categoryStates: categoryStates,
        getSelectedObject() {
            return model.globalState.selectedObject
        }}
}

function loadModel(sourceData, states) {
    
}