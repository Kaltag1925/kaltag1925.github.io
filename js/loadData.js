function readWreckDataFile() {
    console.log("Start")
    d3.json("uluburun.json").then(data => {
        sourceData = loadSourceData(data);
        loadModel(sourceData)
        startMap()
        loadUI()
        console.log("Finish")
    })
}

function createFragment(fragID, fragLoc) {
    return {name: fragID, location: fragLoc}
}

function loadSourceData(rawData) {
    console.log("load")
    var sourceData = {colorData: new Map(), categoryData: new Map(), objectData: new Map(), fragmentData: new Map()}

    // https://html-color.codes/
    var colorData = new Map()
    colorData.set("lamp", {
        shaded: "Red",
        border: "DarkRed",
        selected: "Red"
    })
    colorData.set("BR bowl", {
        shaded: "Green",
        border: "DarkGreen",
        selected: "Lime"
    })
    colorData.set("BR juglet", {
        shaded: "Yellow",
        border: "#999900",
        selected: "Yellow"
    })
    colorData.set("WS bowl", {
        shaded: "LightBlue",
        border: "DarkBlue",
        selected: "Blue"
    })
    colorData.set("Bucchero jug", {
        shaded: "Plum",
        border: "Indigo",
        selected: "Purple"
    })
    colorData.set("lug-handled bowl", {
        shaded: "Salmon",
        border: "DarkOrange",
        selected: "Orange"
    })
    colorData.set("wall bracket", {
        shaded: "Cyan",
        border: "DarkCyan",
        selected: "Cyan"
    })
    colorData.set("WhSh juglet", {
        shaded: "Pink",
        border: "PaleVioletRed",
        selected: "DeepPink"
    })
    colorData.set("mixed", {
        shaded: "DimGrey",
        border: "Grey",
        selected: "DimGrey"
    })

    sourceData.colorData = colorData

    function getPieces(object) {
        if (object.fragments.length == 0) {
            return [[pieceToID(object.id, object.id, 0), {name: object.id,
                object: objectToID(object.id),
                origLoc: object.origLoc,
                important: false,
                tentative: false,
                locs: parseLocs(object.locs, object.id)
            }]]
        } else {
            if (object.locs.length != 0) {
                var arr = object.fragments.map((f, i) => { return [pieceToID(f.id, object.id, i), {name: f.id,
                    object: objectToID(object.id),
                    origLoc: f.origLoc,
                    important: f.important,
                    tentative: f.tentative,
                    locs: parseLocs(f.locs, f.id)
                }]})
                arr.push([pieceToID(object.id + " Cluster", object.id, object.fragments.length), {name: object.id + " Cluster",
                    object: objectToID(object.id),
                    origLoc: object.origLoc,
                    important: false,
                    tentative: false,
                    locs: parseLocs(object.locs, object.id)
                }])
                return arr
            } else {
                return object.fragments.map((f, i) => { return [pieceToID(f.id, object.id, i), {name: f.id,
                    object: objectToID(object.id),
                    origLoc: f.origLoc,
                    important: f.important,
                    tentative: f.tentative,
                    locs: parseLocs(f.locs, f.id)
                }]})
            }
        }
    }
    //load objects and fragments
    rawData.artifacts.forEach(o => {
        var peices = getPieces(o)

        var id = objectToID(o.id)

        var object = {name: o.id,
            type: o.objType.trim(),
            desc: o.desc,
            locationNotes: o.locationNotes,
            locs: parseLocs(o.locs, o.id),
            origLoc: o.origLoc,
            fragmentsOrginal: o.fragments.map(f => pieceToID(f.id, o.id)),
            fragments: peices.map(a => a[0]),  //used to display fragments + whole object if its one peice
            categories: parseCategories(o)

        }

        sourceData.objectData.set(id, object)
        
        peices.forEach(a => sourceData.fragmentData.set(a[0], a[1]))
    })

    function parseCategories(o) {
        var letterRegex = /(?<letter>[A-Z]+).*/
        var letterParsed = o.id.match(letterRegex)
        return [letterParsed.groups.letter, o.objType.trim()]
    }

    //load categories
    sourceData.objectData.forEach(function(value, key) {
        var type = value.type

        if (sourceData.categoryData.has(type)) {
            sourceData.categoryData.get(type).objects.push(key)
        } else {
            sourceData.categoryData.set(type, {name: type, objects: [key]})
        }

    })

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

function pieceToID(id, objectID, i) { // We (probably) wont need index when we have the real data, this is just cause I took out some info on the data to make it easier to plot
    return trimID(objectID + "f" + id + "p" + i);
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

function getColorData(type) {
    return sourceData.colorData.get(type)
}