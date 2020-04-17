"use strict";

function assert(cond /* + optional arguments*/) {
    if(!cond)
        {
        let message = "Assertion failed";
        if(arguments.length > 1)
        {
            const args = [...arguments];
            message += ": " + args.slice(1).join(" ");
        }
        throw Error(message);
        }
}

// My version of Edge does not support [].flat() do provide an alternative
function flatten(arr) {
    // From https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
    return [].concat.apply([], arr);
}

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

function make_hidden(elem, hidden, 
    display_mode // Used when visible. Defaults to block
    )
{
    let mode;
    if(hidden)
    {
        mode = "none";
    }
    else
    {
        if(display_mode == undefined)
            mode = "block";
        else
            mode = display_mode;
    }

    $(elem).css("display", mode);

}


// cjson -> compact JSON. As JSON but the "null"s that arise from parsing undefined
// are removed - e.g. [,1] => "[,1]" rather than "[null,1]"
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

// let obj = [undefined,1,undefined];
// console.log(obj);

// let cj = cjson_stringify(obj);
// console.log(cj);

// let parsed = cjson_parse(cj);
// console.log(parsed);



