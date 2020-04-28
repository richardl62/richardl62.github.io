/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
 
const jq = { 
    board: $("#board"),
    bust: $("#bust"),
    controls: $("#controls"),
    dice: $(".csdice"),
    dont: $("#dont"),
    move_options_td: $("#move-options td"), 
    num_players: $("#num-players"),
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

let current_player = null; // set by start_game()
let num_players = null; // set by start_game()
const n_dice = 4;
assert(jq.dice.length == n_dice, "4 dice expected");

const max_move_options = 6;
assert(jq.move_options_td.length == max_move_options, "6 move options expect");

let dice_array = make_dice_array();

let controls_visibility = new SetVisiblity(jq.controls);
let bust_visibility = new SetVisiblity(jq.bust);
let required_roll_visibility = new SetVisiblity(jq.required_roll)

var move_options = undefined;;
var selected_precommits = undefined;

let game_board = make_game_board();
set_num_players();

/*
 * helper functions
 */

 // Must call set_num_players() after make_game_board();
function make_game_board() {

    let board = new CantStopBoard;

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


function clear_last_precommit()
{
    if(selected_precommits)
        game_board.remove_precommit(current_player, selected_precommits);

    selected_precommits = undefined;
}

function do_roll(spin)
{
    assert(spin != undefined, "spin option not set");
    
    selected_precommits = undefined;
    
    dice_array.forEach((d)=>d.roll(spin));
    
    let dice_numbers = [];
    dice_array.forEach((d)=> dice_numbers.push(d.number()));

    move_options = game_board.options(current_player, dice_numbers);
    if(move_options.length == 0)
    {
        make_visible(bust_visibility);
    }
    else {
        display_move_options();
    }
 }

 function display_move_options()
 {
     function option_string(opt)
     {
        assert(opt.length == 1 || opt.length == 2);
        let str = "" + opt[0]; 
        if(opt.length == 2)
            str += " & " + opt[1];

        return str;
     }

     for(let n = 0; n < max_move_options; ++n)
     {
         let str = "";
         if(n < move_options.length)
            str = option_string(move_options[n]);

        $(jq.move_options_td[n]).text(str);
     }
 }

 function set_num_players()
 {
    num_players = parseInt(jq.num_players.val());
    game_board.num_players(num_players);

    start_game();
 }

 function start_game()
 {
    // Set the current_player to 1 and set apporpriate colours.
    // Method is a kludge.
    current_player = num_players;
    change_current_player();

    make_visible(required_roll_visibility);
 }

 function change_current_player()
 {
     if(current_player == num_players)
     {
         current_player = 1;
     }
     else
     {
         ++current_player;
     }

     let col = get_default_player_color(current_player);
     jq.move_options_td.css("background-color", col);
     $("button").css("color", col);
 }
 /*
 * Game interaction
 */

jq.roll.click(function (elem) {
    if (selected_precommits) {
        do_roll(true /*spin*/);
    }
    else {
        alert("Select option before rolling");
    }
});

jq.required_roll.click(function(elem){
    make_visible(controls_visibility);
    do_roll(true /*spin*/); 
});

jq.move_options_td.click(function (elem) {
    let move_index = jq.move_options_td.index(this);

    clear_last_precommit();

    selected_precommits = move_options[move_index];
    
    game_board.add_precommit(current_player, selected_precommits);
});

jq.dont.click(function(elem){
    if (selected_precommits) {
        game_board.commit(current_player);
        make_visible(required_roll_visibility);
        change_current_player();
    }
    else {
        alert("Select option before stopping");
    }
});

jq.bust.click(function(elem){
    game_board.remove_all_precommits(current_player);
    change_current_player();
    make_visible(required_roll_visibility);
});

jq.restart.click(function(elem){
    start_game()
});

jq.num_players.change(function(elem){
    set_num_players();
});

