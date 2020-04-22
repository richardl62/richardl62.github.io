const board = $("#board");


function column_html(n_squares, column_number)
{
    let str = "<div class='column'>"

    // Nested div to help with alignment
    str += "<div class='top-number'>" + column_number + "</div>"

    for(let i = 0; i < n_squares; ++i)
        str += "<div class='square bt'></div>";
        
    str += "<div class='bottom-number bt'>" + column_number + "</div>"
    str += "</div>"; 

    return str
}

let n_squares = 3;
for(let cn = 2; cn <= 12; ++cn) // cn -> column number
{
    let col = $(column_html(n_squares, cn));
    board.append(col);
    if(cn <= 7)
        col.addClass("bl");
    if(cn >= 7)
        col.addClass("br");
    
    n_squares += (cn < 7) ? 2 : -2;
}
