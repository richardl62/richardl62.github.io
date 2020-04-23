const board = $("#board");


function column_html(n_squares, column_number)
{
    let str = "<div class='column'>"

    // Nested div to help with alignment
    str += "<div class='top-number'>" + column_number + "</div>"

    for(let i = 0; i < n_squares; ++i)
        str += "<div class='square'></div>";
        
    str += "<div class='bottom-number'>" + column_number + "</div>"
    str += "</div>"; 

    return str
}

let n_squares = 3;
for(let cn = 2; cn <= 12; ++cn) // cn -> column number
{
    let col = $(column_html(n_squares, cn));
    
    let squares = col.children(".square");

    if(cn < 7)
        squares.css("border-right-style", "none");
    if(cn > 7)
        squares.css("border-left-style", "none");
    
    squares.css("border-top-style", "none");
    squares.first().css("border-top-style", "solid");
    
    board.append(col);

    n_squares += (cn < 7) ? 2 : -2;
}
