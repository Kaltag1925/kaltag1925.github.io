function readWreckDataFile(file) {
    console.log("read")
    d3.json(file).then(data => {
        sourceData = loadSourceData(data)
        loadNewModel(sourceData)
        startMap()
        setUpSidebarData()
    })
}

function setUpSidebarData() {
    var nodes = Array.from(sourceData.objectData, objectToNode);
    w2ui['navigation'].add(nodes);
  }

  function objectToNode(pair) {
    var objectID = pair[0]
    var object = pair[1]

    var mainNode = {id: objectID, text: object.name, count: object.fragments.length, nodes: object.fragments.map(fragmentToNode)};
    return mainNode;
  }
  
  function fragmentToNode(fragmentID) {
        return { id: fragmentID, text: sourceData.fragmentData.get(fragmentID).name, onClick: function(event) {
            // find svg node based on position ID
            // make it beeeg
        // d3.select("#" + "point" + fragment.x + "-" + fragment.y + "").attr("r", 100)
        }}
  }

function loadSourceData(rawFile) {
    console.log("load")
    var sourceData = {categoryData: new Map(), objectData: new Map(), fragmentData: new Map()}
    var rawData = rawFile.UluburunShipwreck.artifact;

    //Load fragments
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

    //load objects
    rawData.forEach(object => {
        var objectID = objectToID(object)
        var objectName = object._name

        var fragmentIDs = object.location.map((fragment, index) => {
            var location = fragmentLocation(fragment)
            return fragmentToID(location, index, object)
        })
        var categoryIDs = objectTocategoryIDs(object)
        
        var objectObj = {name: objectName, fragments: fragmentIDs, categories: categoryIDs}
        sourceData.objectData.set(objectID, objectObj)
    })

    //load categories
    sourceData.objectData.forEach(function(value, key) {
        value.categories.forEach(category => {
            if (sourceData.categoryData.has(category)) {
                sourceData.categoryData.get(category).objects.push(key)
            } else {
                sourceData.categoryData.set(category, {name: category, objects: [key]})
            }
        })
    })

    loadNewModel(sourceData) // remove later!!!

    return sourceData
}

function trimID(nameString) {
    return nameString.split('').filter(char => /[a-zA-Z0-9]/.test(char)).join('')
}

function categoryToID() {

}



function objectTocategoryIDs(object){
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
    //console.log(loc[0][0], alphaToInt(loc[0][0]))
    const x = loc[0][0].charCodeAt(0)
    const y = parseInt(loc[0].slice(1));
    
    return {x: x, y:y};
}

function alphaToInt(a) {
}
/* temp stuff */

function fragmentToID(fragment, index, object) { // We (probably) wont need index when we have the real data, this is just cause I took out some info on the data to make it easier to plot
    return trimID(object._name + fragment.x + fragment.y + index);
}

function fragmentToName(fragment) {
    return "Fragment @ (" + fragment.x + ", " + fragment.y + ")";
}