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



