function readWreckDataFile() {
    console.log("read")
    d3.json("realArtifacts.json").then(data => {
        sourceData = loadSourceData(data)
        loadNewModel(sourceData)
        startMap()
        setUpSidebarData(sourceData)
    })
}

function readObjects(rawData) {
    objects = new Array()
    rawData.forEach(object => {
        var fragments = new Array()
        
        /* this is terrible but because of the way the excel sheet is setup when I turn it into json
        looks I'm doing this for now just to get the data in, maybe we can find a way to read xsl or whatever
        files or edit it into json, but at the very least this is temporary
        */
        if (object.Status == "intact") {
            fragments.push(createFragment(object.ID, object.Location))
        } else {
            if (object.Fragment1ID != null) {
                fragments.push(createFragment(object.Fragment1ID, object.Fragment1Location))
            }
            if (object.Fragment2ID != null) {
                fragments.push(createFragment(object.Fragment2ID, object.Fragment2Location))
            }
            if (object.Fragment3ID != null) {
                fragments.push(createFragment(object.Fragment3ID, object.Fragment3Location))
            }
            if (object.Fragment4ID != null) {
                fragments.push(createFragment(object.Fragment4ID, object.Fragment4Location))
            }
            if (object.Fragment5ID != null) {
                fragments.push(createFragment(object.Fragment5ID, object.Fragment5Location))
            }
            if (object.Fragment6ID != null) {
                fragments.push(createFragment(object.Fragment6ID, object.Fragment6Location))
            }
            if (object.Fragment7ID != null) {
                fragments.push(createFragment(object.Fragment7ID, object.Fragment7Location))
            }
            if (object.Fragment8ID != null) {
                fragments.push(createFragment(object.Fragment8ID, object.Fragment8Location))
            }
            if (object.Fragment9ID != null) {
                fragments.push(createFragment(object.Fragment9ID, object.Fragment9Location))
            }
            if (object.Fragment10ID != null) {
                fragments.push(createFragment(object.Fragment10ID, object.Fragment10Location))
            }
            if (object.Fragment11ID != null) {
                fragments.push(createFragment(object.Fragment11ID, object.Fragment11Location))
            }
            if (object.Fragment12ID != null) {
                fragments.push(createFragment(object.Fragment12ID, object.Fragment12Location))
            }
            if (object.Fragment13ID != null) {
                fragments.push(createFragment(object.Fragment13ID, object.Fragment13Location))
            }
        }

        var object = {name: object.ID,
            type: object.Type,
            fragments: fragments}

        objects.push(object)
    })

    return objects
}

function createFragment(fragID, fragLoc) {
    return {name: fragID, location: fragLoc}
}

function loadSourceData(rawData) {
    console.log("load")
    var sourceData = {categoryData: new Map(), objectData: new Map(), fragmentData: new Map()}

    var objects = readObjects(rawData)
    
    //Load fragments
    objects.forEach(object => {
        object.fragments.forEach((frag, index) => {
            var location = fragmentLocation(frag)

            var fragmentID = fragmentToID(location, index, object)
            var fragmentName = frag.name
            var objectID = objectToID(object)
            var x = location.x
            var y = location.y
            
            var fragObj = {name: fragmentName, object: objectID, x: x, y: y}
            sourceData.fragmentData.set(fragmentID, fragObj)
        })
    })
    
    //load objects
    objects.forEach(object => {
        var objectID = objectToID(object)
        var objectName = object.name

        var fragmentIDs = object.fragments.map((fragment, index) => {
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

function objectTocategoryIDs(object){
    return [object.type]
    
    // var objectName = object._name
    // var type1 = objectName.substr(0, objectName.indexOf(' ')); 
    // var strEnd = objectName.substr(objectName.indexOf(' ') + 1);
    // var type2 = strEnd.substr(strEnd.indexOf(' ') + 1);
    // return [type1, type2].map(t => trimID(t))
}

function objectToID(object) {
    return "object" + trimID(object.name) // this is lossy since there are +'s n stuff need to replace them with words?
}

/* temp stuff */
var debug = false
function fragmentLocation(fragment) {
    var regex = /(?<letter>[A-Z])\s*(?<number>\d+)\s(?<specifierLetter>[A-Z]{1,2})\s*(?<specifierNumber>)*/ //N16 UL4 or N16 UL 4 or N16 UL
    var regex2 = /(?<letter1>[A-Z])(?<letter2>[A-Z])(?<number1>\d+)\/(?<number2>d+)/ //MN15/16
    var regex3 = /(?<letter1>[A-Z])(?<letter2>[A-Z])(?<number>\d+)/ //IJ10
    var regex4 = / /
    var parsed = fragment.location.match(regex)
    if (parsed == null) {
        if (debug) {
            console.log("Could not parse location of fragment " + fragment.name)
            console.log("Location: " + fragment.location)
        }
        return {x: -1, y: -1}
    } else {
        var x = parsed.groups.letter.charCodeAt(0)
        var y = parseInt(parsed.groups.number);
        
        // console.log(loc[0][0], alphaToInt(loc[0][0]))
        // const x = loc[0][0].charCodeAt(0)
        // const y = parseInt(loc[0].slice(1));
        
        return {x: x, y:y};
    }
}

function alphaToInt(a) {
}
/* temp stuff */

function fragmentToID(fragment, index, object) { // We (probably) wont need index when we have the real data, this is just cause I took out some info on the data to make it easier to plot
    return trimID(object.name + fragment.x + fragment.y + index);
}

function getObjectData(id) {
    return sourceData.objectData.get(id)
}

function getObjectFragments(object) {
    return object.fragments.map(f => sourceData.fragmentData.get(f))
}

function getObjectIDFragments(id) {
    return getObjectFragments(sourceData.objectData.get(id))
}

function getFragmentData(id) {
    return sourceData.fragmentData.get(id)
}