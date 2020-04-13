"use strict";

// Take an array of strings and return the inner html for a select element
// with this strings as list items.
function inner_html_for_select(names)
{
    var html = "";

    names.forEach(name => {
        html += "<option>" + name + "</option>";
    });

    return html;
}

// My version of Edge does not support [].flat() do provide an alternative
function flatten(arr) {
    // From https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
    return [].concat.apply([], arr);
}

// cjson -> compact JSON - as JSON but 'null' removed. 
function cjson_stringify(object)
{
    const json = JSON.stringify(object);
    // console.log("json", json);
    return json.replace(/null/g,'');
}

// restore object created by cjson_stringify. (Not perfect, but good enough for current purposes.)
function cjson_parse(cjson)
{
    // A ',' after a special character is replaced by ',null'.
    function is_special(c1, c2)
    {
        if(c2 == ',')
            return c1 == ',' || c1 == '[';
        if(c2 == ']')
            return c1 == ',';
    }

    const chars = cjson.split('');
    
    var json = '';
    var last_ch = false;

    chars.forEach((c) => {
        if(is_special(last_ch, c))
            json+='null';
          
        json += c
        last_ch = c;
    });
    // console.log("processed string", json);
    return JSON.parse(json);
}

// const object = [,1,,2,];
// console.log("object", object, "(length", object.length, ")");
// const cjson = cjson_stringify(object);
// console.log("object stringified", cjson);
// console.log("string parsed", cjson_parse(cjson));

