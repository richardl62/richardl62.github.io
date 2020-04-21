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
// are removed - e.g. [,1,] => "[,1]" rather than "[null,1]"
function cjson_stringify(arr)
{
    const json = JSON.stringify(arr);
    //console.log("raw json", json);
    //let res = json.replace(/\[null]/g,"[]").replace(/null]/g,"null,]").replace(/null/g,'');
    let res = json.replace(/\[null\]/g,"[,]").replace(/null/g,'');
    return res;
}


class NestedArrayStringify
{
    constructor(preprocess_elem, same_line_depth)
    {
        this.preprocess_elem = preprocess_elem; 
        this.same_line_depth = same_line_depth;

        if(this.preprocess_elem === undefined)
            this.preprocess_elem = (x) => x;  
            
        if(this.same_line_depth === undefined)
            this.same_line_depth = Number.MAX_VALUE;   
    }


    // Set function to preprocess elements before stringification.  More precisely, the
    // return of func(elem) will be stringify using the default JavaScript method.
    // The default is to pass the elem though unchanged.
    set_preprocessor(func) {this.preprocess_elem = func;}

    do_array(arr, indent, level)
    {
        let str = "[";

        for(let i = 0; i < arr.length; ++i)
        {
            str += this.do_element(arr[i], indent, level);
        }
        str += "]";

        return str;
    }

    do_element(elem, indent, level)
    {
        let str = "";
        if(Array.isArray(elem))
        {
            indent += "  ";
            level += 1;

            assert(this.same_line_depth !== undefined, "same_line_depth is undefined");
            const separate_line = level >= this.same_line_depth;
            if(separate_line)
            {
                str += "\n" + indent;
            }

            str += this.do_array(elem, indent + "  ", level+1) + ",";

            if(separate_line)
            {
                str += "\n" + indent;
            }
        }
        else
            str += this.preprocess_elem(elem, indent, level) + ",";

         return str;
    }
}

// See comments on NestedArrayStringify
function stringify_array(array, process_elems, same_line_depth)
{
    let nas = new NestedArrayStringify(process_elems, same_line_depth);
    return nas.do_array(array, "", same_line_depth)
}

function stringify_array_test(arr, remove_undefined, same_line_depth)
{
    function do_remove_undefined(elem) {   
        return elem === undefined ? "" : elem; 
    }

    let stringified = stringify_array(arr, 
        remove_undefined ? do_remove_undefined : undefined, 
        same_line_depth);

    let round_trip;
    try {
        round_trip = eval(stringified)
    }
    catch(err)
    {
        round_trip = "Can't evaluate string";
    }

    // KLUDGE: Use JSON stringfy to compare arrays.
    if (JSON.stringify(arr) == JSON.stringify(round_trip)) {
        console.log("stringified array is", stringified);
    }
    else
    {
        console.log("test object", arr);
        console.log("   test object (as json)", JSON.stringify(arr));
        console.log("   stringified", stringified);
        console.log("   round-trip", round_trip);
        console.log("   round-trip (as json)", JSON.stringify(round_trip));
        console.log("   Error: array changed by cjson_parse round trip");
    }
}

//stringify_array_test([]);
//stringify_array_test([,]);
// stringify_array_test([[undefined,undefined],[1,2]]);
// stringify_array_test([[undefined,undefined],[1,2]],true);
// stringify_array_test([[undefined,undefined],[1,2]],true,0);
// stringify_array_test([1,2,null]);
// stringify_array_test([1,2]);

