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
    required_roll: $("#required-roll"),
    restart: $("#restart"),
    roll: $("#roll"),
}

for (const [key, value] of Object.entries(jq)) {
    assert(value.length > 0,
        key + " matched " + value.length + " elements");
}

/*
 * Global variables (other the jq) and setup
 */

const n_players = 2; // For now at least.
const n_dice = 4;
assert(jq.dice.length == n_dice, "4 dice expected");

const max_move_options = 6;
assert(jq.move_options.length == max_move_options, "6 move options expect");

let game_board = make_game_board();
let dice_array = make_dice_array();

let controls_visibility = new SetVisiblity(jq.controls);
let bust_visibility = new SetVisiblity(jq.bust);
let required_roll_visibility = new SetVisiblity(jq.required_roll)

let move_options = []; // WIP
let selected_move_option = 0; // WIP

restart();
/*
 * helper functions
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

        board.add_column(cn, squares.reverse());
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

function make_visible(visible)
{
    bust_visibility.off();
    controls_visibility.off();
    required_roll_visibility.off();

    visible.on();
}


 function do_roll(spin)
 {
    assert(spin != undefined, "spin option not set");

    dice_array.forEach((d)=>d.roll(spin));
    
    let dice_numbers = [];
    dice_array.forEach((d)=> dice_numbers.push(d.number()));

    move_options = game_board.options(dice_numbers);
    if(move_options.length == 0)
    {
        make_visible(bust_visibility);
    }
 }

 function restart()
 {
    game_board.start_game(n_players);
    make_visible(required_roll_visibility);
 }

 /*
 * Game interaction
 */

jq.roll.click(function(elem){
    do_roll(true /*spin*/);
});

jq.required_roll.click(function(elem){
    make_visible(controls_visibility);
    do_roll(true /*spin*/); 
});

jq.move_options.click(function (elem) {
    // TEMPORARY KLUDGE
    let move = move_options[selected_move_option];
    ++selected_move_option;
    if(selected_move_option == move_options.length)
        selected_move_option = 0;

    console.log("move:",move);
    // END OF TEMPORARY KLUDGE

    game_board.clear_last_pre_commit();
    game_board.pre_commit(move);

});

jq.dont.click(function(elem){
    game_board.commit();
});

jq.bust.click(function(elem){
    make_visible(required_roll_visibility);
});

jq.restart.click(function(elem){
    restart()
});