function readWreckDataFile(file) {
    console.log("read")
    d3.json(file).then(data => {
        sourceData = loadSourceData(data)
        loadNewModel(sourceData)
        startMap(sourceData)
    })
}

function trimID(nameString) {
    return nameString.split('').filter(char => /[a-zA-Z0-9]/.test(char)).join('')
}

function catagoryToID() {

}



function objectToCatagoryIDs(object){
    var objectName = object._name
    var type1 = objectName.substr(0, objectName.indexOf(' ')); 
    var strEnd = objectName.substr(objectName.indexOf(' ') + 1);
    var type2 = strEnd.substr(strEnd.indexOf(' ') + 1);
    return [type1, type2].map(t => trimID(t))
}

function objectToID(object) {
    return trimID(object._name)
}

/* temp stuff */
function fragmentLocation(fragment) {
    var loc = fragment.split(" ");
    const y = alphaToInt(loc[0][0])
    const x = parseInt(loc[0].slice(1))
    
    return {x: x, y:y};
}

function alphaToInt(a) {
    return a.charCodeAt(0) - 65;
}
/* temp stuff */

function fragmentToID(fragment, index, object) { // We (probably) wont need index when we have the real data, this is just cause I took out some info on the data to make it easier to plot
    return trimID(object._name + fragment.x + fragment.y + index);
}

function fragmentToName(fragment) {
    return "Fragment @ (" + fragment.x + ", " + fragment.y + ")";
}

function loadSourceData(rawFile) {
    console.log("load")
    var sourceData = {catagoryData: new Map(), objectData: new Map(), fragmentData: new Map()}
    var rawData = rawFile.UluburunShipwreck.artifact;

    rawData.forEach(object => {
        object.location.forEach((frag, index) => {
            var location = fragmentLocation(frag)

            var fragmentID = fragmentToID(location, index, object)
            var fragmentName = fragmentToName(location)
            var objectID = objectToID(object)
            var x = location.x
            var y = location.y
            
            var fragObj = {name: fragmentName, object: objectID, x: x, y: y}
            sourceData.fragmentData.set(fragmentID, fragObj)
        })
    })


    rawData.forEach(object => {
        var objectID = objectToID(object)
        var objectName = object._name

        var fragmentIDs = object.location.map((fragment, index) => {
            var location = fragmentLocation(fragment)
            return fragmentToID(location, index, object)
        })
        var catagoryIDs = objectToCatagoryIDs(object)
        
        var objectObj = {name: objectName, fragments: fragmentIDs, catagories: catagoryIDs}
        sourceData.objectData.set(objectID, objectObj)
    })

    sourceData.objectData.forEach(function(value, key) {
        value.catagories.forEach(catagory => {
            if (sourceData.catagoryData.has(catagory)) {
                sourceData.catagoryData.get(catagory).objects.push(key)
            } else {
                sourceData.catagoryData.set(catagory, {name: catagory, objects: [key]})
            }
        })
    })

    loadNewModel(sourceData) // remove later!!!

    return sourceData
}