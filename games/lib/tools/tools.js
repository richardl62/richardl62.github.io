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

function $_checked(name) {
    const js_elem = $(name);
    assert(js_elem.length > 0,
        `"${name}" matched ${js_elem.length} elements`);

    return js_elem;
}

class PromiseTimeout extends Error {
    constructor(message) {
        super(message);
    }
}
// Return a new Promise that will be rejected after the given timeout
function promiseWithTimeout(timeout_ms, resolve_or_reject) {
    // Based on 
    // https://stackoverflow.com/questions/32461271/nodejs-timeout-a-promise-if-failed-to-complete-in-time
    return new Promise(function(resolve, reject) {
        // Set up the real work
        resolve_or_reject(resolve, reject);

        // Set up the timeout
        setTimeout(function() {
            reject(new PromiseTimeout('Timed out after ' + timeout_ms/1000 + ' seconds'));
        }, timeout_ms);
    });
}
    
function getElementById_Checked(id)
{
    let elem = document.getElementById(id);
    assert(elem, 'Element "' + id + '" not found');
    return elem;
}

function getElementsByClassName_checked(class_name)
{
    let elems = document.getElementsByClassName(class_name);
    assert(elems.length > 0, 'No elements of class "' + class_name + '" found');
    return elems;
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

// Copy-and-edit of CssDisplay
class CssVisibility
{
    constructor(elem)
    {
        this._elem = $(elem);
        assert(this._elem.length == 1, "CssVisiblity requires exactly 1 element");

        this._hidden = this._elem.css("visibility") == "hidden";

        Object.seal(this);
    }

    hidden(hidden)
    {
        if(hidden === undefined) {
            return this._hidden;
        }
        this._hidden = hidden;
        this._elem.css("visibility", hidden ? "hidden" : "visible");
    }

    toggle() {
        this.hidden(!this.CssDisplay());
    }
}

// Copy-and-edit of CssVisibility
// Used to set css 'display' to 'none' or restore to original value.
class CssDisplay
{
    constructor(elem)
    {
        this._elem = $(elem);
        assert(this._elem.length == 1, "CssDisplay requires exactly 1 element");

        this._intial_css_value = this._elem.css("display");
        this._none = false;

        Object.seal(false);
    }


    none(none)
    {
        if(none === undefined) {
            return this._none;
        }
        this._none = none;
        this._elem.css("display", none ?  "none" : this._intial_css_value);
    }

    toggle() {
        this.none(!this.none());
    }
}
// Take an array of strings and return the inner html for a select element
// with these strings as list items.
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

// Name should include the initial '--'
function get_css_variable(name) {

    var bodyStyles = window.getComputedStyle(document.body); 
    var value = bodyStyles.getPropertyValue(name);
    
    assert(value, `Value for CSS variable "${name}" not found`);

    return value;
}

// Uses colours defined in preferred-colours.css
function get_default_player_color(player)
{
    return get_css_variable('--game-board-player-colours-' + player);
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

// At time of writting this was not used.
//
// Return an array of sub-strings which together make up the input string.
// Each of the integers in the input string are in separate substrings.
// The other sub strings contain the characters between integers.
// Example: "00 + 11" => ["00", " + ", "11"]
function split_at_integers(input_str)
{
    //  Repeatedly search for this regex
    const regex = /[+-]?\d+/;;

    let str = input_str;
    let result = new Array;

    let match = str.match(regex);
    while(match) {
        let matched = match[0];
        
        if(match.index != 0) {
            result.push(str.substr(0, match.index));
        }
        
        result.push(matched);
        str = str.substr(match.index + matched.length);
        match = str.match(regex);
    }

    if(str != "")
        result.push(str);

    return result;
}

function get_integers_test(str)
{
    console.log('"'+str+'"', split_at_integers(str)); 
}

function shuffleArray(array) {
    // From https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// As parseInt, but return NaN if there are any unexpected characaters, so, 
// Examples: 
//  "12 cats" -> NaN
//  "1.1" -> NaN
//  "+1.0" -> 1

function strictParseInt(str) {
    const n = parseInt(str);
    if(n != str) {
        return NaN;
    }
    return n;
}

// Look for a number in the input string.  Return one of
// - null if no number is found
// - A number if exactly one number is found. The value is returned parsed, 
//   i.e. as a number rather than a string.
// - An Error if more than one number is found
function findAndParseInt(str) {
    // Look for a numbers in the input string.
    let match = str.match(/-?\d+/g);
    if (match && match.length > 1) {
        return new Error('More than one number found in "'
            + str + '"');
    }

    if (match) {
        let number = parseInt(match);
        assert(!isNaN(number));

        return number;
    }

    return null;
}

// get_integers_test("");
// get_integers_test("1 + 1");
// get_integers_test("00");
// get_integers_test("ab");
// get_integers_test("-00+2 != +333");
// get_integ


// let a = {1:11, 2:22}
// Object.assign(a, null);
// Object.assign(a, {2:222, 3:33});
// console.log(a);
