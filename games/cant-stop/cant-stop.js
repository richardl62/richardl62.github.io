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


const jq = { // Get the jQuery elements that are used in this file.
    bust: $("#bust"),
    controls: $("#controls"),
    dice: $(".dice"),
    dont: $("#dont"),
    move_options: $("#move-options td"), 
    num_players: $("#num-players"),
    roll: $("#roll"),
}

function sanity_check() {
    for (const [key, value] of Object.entries(jq)) {
        assert(value.length > 0,
            key + " matched " + value.length + " elements");
    }

    assert(jq.dice.length == 4, "4 dice expected");
    assert(jq.move_options.length == 6, "6 move option expect");
}
sanity_check();

class SetVisiblity
{
    constructor(elem)
    {
        this.elem = $(elem);
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

let controls_visibility = new SetVisiblity(jq.controls);
let bust_visibility = new SetVisiblity(jq.bust);
bust_visibility.off();

jq.dont.click(()=>{
    controls_visibility.off();
    bust_visibility.on();
})

jq.bust.click(()=>{
    controls_visibility.on();
    bust_visibility.off();
})