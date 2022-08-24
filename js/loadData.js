function readWreckDataFile() {
    console.log("read")
    d3.json("uluburun.json").then(data => {
        sourceData = loadSourceData(data)
        loadNewModel(sourceData)
        startMap()
        setUpSidebarData(sourceData)
    })
}

// function readObjects(rawData) {
//     objects = new Array()
//     rawData.forEach(o => {
//         var fragments = o.fragments.map(f => f.id)
//         var object = {name: o.id,
//             type: o.objType,
//             desc: o.desc,
//             locationNotes: o.locationNotes,
//             locs: o.locs,
//             origLoc: o.origLoc,
//             fragments: fragments,
//             }

//         objects.push(object)
//     })

//     return objects
// }

function createFragment(fragID, fragLoc) {
    return {name: fragID, location: fragLoc}
}

function loadSourceData(rawData) {
    console.log("load")
    var sourceData = {categoryData: new Map(), objectData: new Map(), fragmentData: new Map()}
    
    //Load fragments
    rawData.artifacts.forEach(o => {
        o.fragments.forEach(f => {
            var id = fragmentToID(f.id, o.id)

            var fragment = {name: f.id,
                object: objectToID(o.id),
                origLoc: f.origLoc,
                important: f.important,
                tentative: f.tentative,
                locs: parseLocs(f.locs, f.id)
            }

            sourceData.fragmentData.set(id, fragment)


            // var location = fragmentLocation(frag)

            // var fragmentID = fragmentToID(location, index, object)
            // var fragmentName = frag.name
            // var objectID = objectToID(object)
            // var x = location.x
            // var y = location.y
            
            // var fragObj = {name: fragmentName, object: objectID, x: x, y: y}
            // sourceData.fragmentData.set(fragmentID, fragObj)
        })
    })
    
    //load objects
    rawData.artifacts.forEach(o => {
        var fragments = o.fragments.map(f => fragmentToID(f.id, o.id))
        var id = objectToID(o.id)

        var object = {name: o.id,
            type: o.objType,
            desc: o.desc,
            locationNotes: o.locationNotes,
            locs: parseLocs(o.locs, o.id),
            origLoc: o.origLoc,
            fragments: fragments,
            }

        sourceData.objectData.set(id, object)


        // var objectID = objectToID(object)
        // var objectName = object.name

        // var fragmentIDs = object.fragments.map((fragment, index) => {
        //     var location = fragmentLocation(fragment)
        //     return fragmentToID(location, index, object)
        // })
        // var categoryIDs = objectTocategoryIDs(object)
        
        // var objectObj = {name: objectName, fragments: fragmentIDs, categories: categoryIDs}
        // sourceData.objectData.set(objectID, objectObj)
    })

    //load categories
    sourceData.objectData.forEach(function(value, key) {
        var type = value.type

        if (sourceData.categoryData.has(type)) {
            sourceData.categoryData.get(type).objects.push(key)
        } else {
            sourceData.categoryData.set(type, {name: type, objects: [key]})
        }

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

function objectToID(objectID) {
    return "object" + trimID(objectID) // this is lossy since there are +'s n stuff need to replace them with words?
}

function fragmentToID(fragID, objectID) { // We (probably) wont need index when we have the real data, this is just cause I took out some info on the data to make it easier to plot
    return trimID(objectID + "f" + fragID);
}



function parseLocs(locs, id) {
    return locs.map(l => {
        var regex = /(?<letter>[A-Z])(?<number>\d+)\s*(?<specifierLetter>[A-Z][A-Z])*(?<specifierNumber>[1-4])*/ //N13 LL4 // N13 LL// N13 //Should work?
        var parsed = l.match(regex)
        if (parsed == null) {

            console.log("Could not parse location of " + id)
            console.log("Location: " + l)
            
            return {x: -1, y: -1}
        } else {
            var x = parsed.groups.letter.charCodeAt(0)
            var y = parseInt(parsed.groups.number)
            
            var r = {x: x, y:y, specLetter: parsed.groups.specifierLetter, specNumber: parsed.groups.specifierNumber}
            return {x: x, y:y, specLetter: parsed.groups.specifierLetter, specNumber: parsed.groups.specifierNumber};
        }
    })
}

// var debug = false
// function fragmentLocation(fragment) {
//     var regex = /(?<letter>[A-Z])\s*(?<number>\d+)\s(?<specifierLetter>[A-Z]{1,2})\s*(?<specifierNumber>)*/ //N16 UL4 or N16 UL 4 or N16 UL
//     var regex2 = /(?<letter1>[A-Z])(?<letter2>[A-Z])(?<number1>\d+)\/(?<number2>d+)/ //MN15/16
//     var regex3 = /(?<letter1>[A-Z])(?<letter2>[A-Z])(?<number>\d+)/ //IJ10
//     var regex4 = / /
//     var parsed = fragment.location.match(regex)
//     if (parsed == null) {
//         if (debug) {
//             console.log("Could not parse location of fragment " + fragment.name)
//             console.log("Location: " + fragment.location)
//         }
//         return {x: -1, y: -1}
//     } else {
//         var x = parsed.groups.letter.charCodeAt(0)
//         var y = parseInt(parsed.groups.number);
        
//         // console.log(loc[0][0], alphaToInt(loc[0][0]))
//         // const x = loc[0][0].charCodeAt(0)
//         // const y = parseInt(loc[0].slice(1));
        
//         return {x: x, y:y};
//     }
// }

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