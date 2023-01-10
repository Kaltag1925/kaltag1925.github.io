# How to install/run

~~~sh
npm install
node app.cjs
~~~

Then go here: [localhost:5000](localhost:5000)

# Useful links

[User Stories](https://docs.google.com/document/d/1I1vr9eFYHYX-6HpOVjLMBmy1yX75cQWj7ELIRjTYFyI/edit?usp=sharing)

[Google Drive](https://drive.google.com/file/d/1123-OkrgLOjJL_gHSwlRZk0zlLD-ZgD9/view?usp=sharing)

[User Guide](https://docs.google.com/document/d/19VjY2Gr94Yhe_Sr8lX2hm3SVmbmiNEuvnQXIWcK6C6Q/edit?usp=sharing)

# Input Format

```JSON
{
  "description": "Input data for Uluburun mapping project",
  "type": "object",
  "properties": {
    "artifacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id" : { "type" : "string" },
          "objType" : { "type" : "string" },
          "status" : { "type" : "string" },
          "numFragments" : { "type" : "string" },
          "locationNotes" : { "type" : "string" },
          "locs" : { "type" : "array", "items": { "type": "string" } },
          "origLoc" : { "type" : "string" },
          "desc" : { "type" : "string" },
          "fragments" : {
            "type" : "array",
            "items" : { 
              "type" : "object",
              "properties" : {
                "id" : { "type" : "string" },
                "parentID" : { "type" : "string" },
                "locs" : { "type" : "array", "items": { "type": "string" } },
                "origLoc" : { "type" : "string" },
                "important" : { "type" : "boolean" },
                "tentative" : { "type" : "boolean" }
          }}}
    }}}
}}
```
