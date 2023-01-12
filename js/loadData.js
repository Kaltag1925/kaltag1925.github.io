function readWreckDataFile() {
    console.log("Start")
    d3.json("uluburun.json").then(data => {
        sourceData = loadSourceData(data);
        loadModel(sourceData)
        loadSaveStateModel()
        loadUI()
        startMap()
        console.log("Finish")
    })
}

function createFragment(fragID, fragLoc) {
    return {name: fragID, location: fragLoc}
}

function loadSourceData(rawData) {
    console.log("load")
    var sourceData = {categoryData: new Map(), objectData: new Map(), fragmentData: new Map(), categoryColorData: new Map()}

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
            typeName: o.objType.trim(),
            type: trimID(o.objType.trim()),
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
        return [o.objType.trim()]
    }

    // https://html-color.codes/
    var colorData = new Map()
    colorData.set("lamp", {
        shaded: "Red",
        border: "DarkRed",
        // selected: "Red"
    })
    colorData.set("br bowl", {
        shaded: "Green",
        border: "DarkGreen",
        // selected: "Lime"
    })
    colorData.set("br juglet", {
        shaded: "Yellow",
        border: "#999900",
        // selected: "Yellow"
    })
    colorData.set("ws bowl", {
        shaded: "LightBlue",
        border: "DarkBlue",
        // selected: "Blue"
    })
    colorData.set("bucchero jug", {
        shaded: "Plum",
        border: "Indigo",
        // selected: "Purple"
    })
    colorData.set("lug-handled bowl", {
        shaded: "LightSalmon",
        border: "#fb4f14",
        // selected: "Orange"
    })
    colorData.set("wall bracket", {
        shaded: "Cyan",
        border: "DarkCyan",
        // selected: "Cyan"
    })
    colorData.set("whsh juglet", {
        shaded: "Pink",
        border: "PaleVioletRed",
        // selected: "DeepPink"
    })
    colorData.set("spindle bottle", {
        shaded: "bisque",
        border: "burlywood"
    })
    colorData.set("jug (painted)", {
        shaded: "darkgoldenrod",
        border: "chocolate"
    })
    colorData.set("jug (trefoil)", {
        shaded: "darkseagreen",
        border: "darkslategrey"
    })
    colorData.set("krater", {
        shaded: "deeppink",
        border: "darkred"
    })
    colorData.set("pithos", {
        shaded: "greenyellow",
        border: "green"
    })
    colorData.set("pithos #8", {
        shaded: "greenyellow",
        border: "green"
    })
    colorData.set("pithos #9", {
        shaded: "greenyellow",
        border: "green"
    })
    colorData.set("mixed", {
        shaded: "DimGrey",
        border: "Grey",
        // selected: "DimGrey"
    })

    //load categories
    sourceData.objectData.forEach(function(object, objectID) {
        object.categories.forEach(c => {
            var id = trimID(c)
            if (!(sourceData.categoryData.has(id))) {
                sourceData.categoryData.set(id, {
                    name: c,
                    objects: []
                })
            }
            sourceData.categoryData.get(id).objects.push(objectID)
        })
    })

    categoryColorData = new Map()
    sourceData.categoryData.forEach((category, id) => {
        if (colorData.get(category.name.toLowerCase())) {
            categoryColorData.set(id, {
                colors: colorData.get(category.name.toLowerCase()),
                name: category.name,
                categoryID: id
            })
        }
    })
    categoryColorData.set("mixed", {
        colors: colorData.get("mixed"),
        name: "Mixed",
        categoryID: undefined
    })

    sourceData.categoryColorData = categoryColorData

    sourceData.objectData.forEach(object => {
        object.categories = object.categories.map(c => trimID(c))
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
    return sourceData.categoryColorData.get(type).colors
}

function sortObjectsByName(a, b) {
    var regex = /(?<type>[A-Z]+)\s*(?<number>\d+)\+*(?<number2>\d*)/;
    var aParsed = a.match(regex);
    var bParsed = b.match(regex);

    if (aParsed == null) {
    console.log("Could not parse name of " + a + " when sorting by name.");
    return 0;
    }

    if (bParsed == null) {
    console.log("Could not parse name of " + a + " when sorting by name.");
    return 0;
    }

    var compareType = aParsed.groups.type.localeCompare(bParsed.groups.type)
    if (compareType == 0) {
    var aNumber = parseInt(aParsed.groups.number);
    var bNumber = parseInt(bParsed.groups.number);
    
    if (aNumber == bNumber) {
        var aNumber2 = parseInt(aParsed.groups.number2);
        var bNumber2 = parseInt(bParsed.groups.number2);

        if (aNumber2 == NaN && bNumber2 != NaN) {
        return -1;
        };

        if (bNumber2 == NaN && aNumber2 != NaN) {
        return 1;
        };

        if (aNumber2 == NaN && bNumber2 == NaN) {
        return 0;
        }
        
        return aNumber2 - bNumber2;
    } else {
        return aNumber - bNumber;
    };
    } else {
    return compareType;
    };
}

function sortObjectsByProgramID(a, b) {
    var regex = /(?<type>[A-Z]+)(?<number>\d+)\+*(?<number2>\d*)/;
    var aParsed = a.match(regex);
    var bParsed = b.match(regex);

    if (aParsed == null) {
    console.log("Could not parse name of " + a + " when sorting by name.");
    return 0;
    }

    if (bParsed == null) {
    console.log("Could not parse name of " + a + " when sorting by name.");
    return 0;
    }

    var compareType = aParsed.groups.type.localeCompare(bParsed.groups.type)
    if (compareType == 0) {
    var aNumber = parseInt(aParsed.groups.number);
    var bNumber = parseInt(bParsed.groups.number);
    
    if (aNumber == bNumber) {
        var aNumber2 = parseInt(aParsed.groups.number2);
        var bNumber2 = parseInt(bParsed.groups.number2);

        if (aNumber2 == NaN && bNumber2 != NaN) {
        return -1;
        };

        if (bNumber2 == NaN && aNumber2 != NaN) {
        return 1;
        };

        if (aNumber2 == NaN && bNumber2 == NaN) {
        return 0;
        }
        
        return aNumber2 - bNumber2;
    } else {
        return aNumber - bNumber;
    };
    } else {
    return compareType;
    };
}