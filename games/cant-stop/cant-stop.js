/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
 
const jq = { 
    board: $("#board"),
    bust: $("#bust"),
    controls: $("#controls"),
    dice: $(".csdice"),
    dont: $("#dont"),
    move_options: $("#move-options td"), 
    // num_players: $("#num-players"),
    roll: $("#roll"),
}

for (const [key, value] of Object.entries(jq)) {
    assert(value.length > 0,
        key + " matched " + value.length + " elements");
}

/*
 * Global variables (other the jq)
 */

const n_dice = 4;
assert(jq.dice.length == n_dice, "4 dice expected");

const max_move_options = 6;
assert(jq.move_options.length == max_move_options, "6 move options expect");

let game_board = make_game_board();
let dice_array = make_dice_array();

let controls_visibility = new SetVisiblity(jq.controls);
let bust_visibility = new SetVisiblity(jq.bust);
bust_visibility.off();


/*
 * 'make' functions
 */

function make_game_board() {

    let board = new CantStopBoard();

    function make_columm(n_squares, column_number) {
        let squares = new Array(n_squares);

        let col = $("<div class='column'></div>");

        col.append("<div class='top-number'>" + column_number + "</div>");
        

        for (let i = 0; i < n_squares; ++i)
            {
            squares[i] = $("<div class='square'></div>");
            col.append(squares[i]);
            }

        col.append("<div class='bottom-number'>" + column_number + "</div>");

        return [col, squares];
    }

    function array_css(arr, property, value)
    {
        arr.forEach((s)=>s.css(property, value));
    }
    
    let n_squares = 3;
    for (let cn = 2; cn <= 12; ++cn) // cn -> column number
    {
        let [col, squares] = make_columm(n_squares, cn);

        if (cn < 7)
            array_css(squares, "border-right-style", "none");
        if (cn > 7)
            array_css(squares, "border-left-style", "none");

        array_css(squares, "border-top-style", "none");
            
        squares[0].css("border-top-style", "solid");

        jq.board.append(col);

        n_squares += (cn < 7) ? 2 : -2;
    }

    return board;
}

function make_dice_array() {
    let arr = new Array(n_dice);

    for (let i = 0; i < n_dice; i++) {
        arr[i] = new dice(jq.dice.get(i));
        arr[i].roll(false /* don't spin */);
    }

    return arr;
}

/*
 * Game interaction
 */

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