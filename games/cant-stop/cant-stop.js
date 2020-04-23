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
    dice: $(".csdice"),
    dont: $("#dont"),
    move_options: $("#move-options td"), 
    num_players: $("#num-players"),
    roll: $("#roll"),
}

const n_dice = 4;
const max_move_options = 6;

function sanity_check() {
    for (const [key, value] of Object.entries(jq)) {
        assert(value.length > 0,
            key + " matched " + value.length + " elements");
    }

    assert(jq.dice.length == n_dice, "4 dice expected");
    assert(jq.move_options.length == max_move_options, "6 move option expect");
}
sanity_check();

var dice_array = new Array(n_dice);
for(let i = 0; i< n_dice; i++)
{
    dice_array[i] = new dice(jq.dice.get(i));
    dice_array[i].roll(false /* don't spin */);
}

let controls_visibility = new SetVisiblity(jq.controls);
let bust_visibility = new SetVisiblity(jq.bust);
bust_visibility.off();

jq.roll.click(() => {
    dice_array.forEach((d)=>d.roll());
});

jq.dont.click(()=>{
    controls_visibility.off();
    bust_visibility.on();
})

jq.bust.click(()=>{
    controls_visibility.on();
    bust_visibility.off();
})