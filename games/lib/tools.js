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

// Return sorted array containing the unique elements of arr
function sort_unique(arr,
     compare // Optional.  If supplied, should be a "-ve, 0, +ve" comparison function
          // suitable for use with standard array sort.
     )
{
    if(arr.length <= 1)
        return arr;

    function equal(a,b)
    {
        if(compare === undefined)
            return a == b;
        else
            return compare(a, b) == 0;
    }
    
    let sorted = arr.sort(compare);

    let result = [arr[0]];
    for(let i = 1; i < arr.length; ++i)
    {
        if(!equal(arr[i], arr[i-1]))
            result.push(arr[i]);
    }


    return result;
}

// const test_array = [3,3, 1,1,1, 5, 4];
// console.log(
//     test_array, 
//     sort_unique(test_array), 
//     sort_unique(test_array, (a, b) => b - a)
//     );
    
class SetVisiblity
{
    constructor(elem)
    {
        this.elem = $(elem);
        assert(elem.length == 1, "SetVisiblity requires exactly 1 element");
        this.intial_display_type = this.elem.css("display");
    }

    on() {
        this.elem.css("display", this.intial_display_type);
    }

    off() {
        this.elem.css("display", "none");
    }

    visible(on)
    {
        if(on)
            this.on();
        else
            this.off();
    }
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

// Uses colours defined in preferred-colours.css
function get_default_player_color(player)
{
    var css_var = '--game-board-player-colours-' + player;
    
    var bodyStyles = window.getComputedStyle(document.body); 
    var color = bodyStyles.getPropertyValue(css_var);
    
    assert(color, "Cannot get colour for player " + player + " - "
             + css_var + " was not found");

    return color;
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

