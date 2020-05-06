/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
 
const jq = { 
    board: $("#board"),
    bust: $("#bust"),
    move_options: $("#move-options"),
    dice: $(".csdice"),
    dont: $("#dont"),
    game: $("#game"),
    dice_options: $(".dice-option"), 
    num_players: $("#num-players"),
    required_roll: $("#required-roll"),
    restart: $("#restart"),
    roll: $("#roll"),
    pass: $("#pass"),
}

for (const [key, value] of Object.entries(jq)) {
    assert(value.length > 0,
        '"' + key + '"' + " matched " + value.length + " elements");
}

/*
 * Global variables (other the jq) and setup
 */

let current_player = null; // set by restart_game()
let num_players = null; // set by restart_game()
const n_dice = 4;
const last_column = 12;

assert(jq.dice.length == n_dice, "4 dice expected");

const max_move_options = 6;
assert(jq.dice_options.length == max_move_options, "6 move options expect");

let dice_array = make_dice_array();

let move_options_visibility = new SetVisiblity(jq.move_options);
let bust_visibility = new SetVisiblity(jq.bust);
let required_roll_visibility = new SetVisiblity(jq.required_roll)

var move_options = null;
var selected_precommits = null;

let game_board = make_game_board();


const selected_move = "selected-move";

// KLUDGE??: Show highlighting of in-play columns be done by the can't stop game board
// rather than in this file?
const in_play_column = "cs-in-play-column";
const current_precommit = "current-precommit";

set_num_players();
/*
 * helper functions
 */

 // Must call set_num_players() after make_game_board();
function make_game_board() {

    let board = new CantStopBoard(jq.board);
    
    let n_squares = 3;
    for (let cn = 2; cn <= last_column; ++cn) // cn -> column number
    {
        board.add_column(cn, n_squares);
        n_squares += (cn <= (last_column/2)) ? 2 : -2;
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
    move_options_visibility.off();
    required_roll_visibility.off();

    visible.on();
}


function clear_last_precommit()
{
    if(selected_precommits)
        game_board.remove_precommit(current_player, selected_precommits);

    selected_precommits = null;
}

function disable_roll_and_dont_buttons(disable)
{
    jq.roll.prop("disabled", disable);
    jq.dont.prop("disabled", disable);
}

function do_roll(spin)
{
    assert(spin != undefined, "spin option not set");
    
    if(selected_precommits)
    {
        for(let p of selected_precommits)
        {
            game_board.column(p).elem().addClass(in_play_column);
        }
        selected_precommits = null;
    }

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

    disable_roll_and_dont_buttons(true);

    if(move_options.length == 1)
    {
        select_move_option(0);
    }
 }

 function display_move_options()
 {
    clear_selected_move();

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

       $(jq.dice_options[n]).text(str);
     }
 }

 function set_num_players()
 {
    num_players = parseInt(jq.num_players.val());
    game_board.num_players(num_players);

    restart_game();
 }

 function restart_game()
 {
    game_board.reset();

    // Set the current_player to 1 and set apporpriate colours.
    // Method is a kludge.
    current_player = num_players;
    change_current_player();

    make_visible(required_roll_visibility);
 }

function change_current_player() {
    game_board.remove_all_precommits(current_player);
    selected_precommits = null;

    make_visible(required_roll_visibility);

    if (current_player == num_players) {
        current_player = 1;
    }
    else {
        ++current_player;
    }

    clear_in_play_columns();
    let col = get_default_player_color(current_player);
    jq.game.get(0).style.setProperty("--player-color", col);
}

function clear_in_play_columns() {
    for (let cn = 0; cn <= last_column; ++cn) {
        let elem = game_board.column(cn).elem();
        if (elem)
            elem.removeClass(in_play_column);
    }
}

function clear_selected_move() {
    jq.dice_options.removeClass(selected_move);
}

function select_move_option(index) {
    if (move_options[index]) {
        clear_selected_move();
        clear_last_precommit();

        selected_precommits = move_options[index];
        $(jq.dice_options[index]).addClass(selected_move);
        game_board.add_precommit(current_player, selected_precommits);

        // Remove all instances of a class current_precommit, then readd for the selected
        // precommits
        $("."+ current_precommit).removeClass(current_precommit);
        
        for(let sp of selected_precommits)
        {
            game_board.column(sp).last_precommit(current_player).elem().addClass(current_precommit);
        }

        disable_roll_and_dont_buttons(false);
    }
}
 /*
 * Game interaction
 */

jq.required_roll.click(function(elem){
    make_visible(move_options_visibility);
    do_roll(true /*spin*/); 
});

jq.dice_options.click(function (elem) {
    let move_index = jq.dice_options.index(this);
    select_move_option(move_index);
});

jq.roll.click(function (elem) {
    assert(selected_precommits);
    
    do_roll(true /*spin*/);
});

jq.dont.click(function(elem){
    assert (selected_precommits);

    game_board.commit(current_player);
    make_visible(required_roll_visibility);
    change_current_player();
});

jq.bust.click(function(elem){
    change_current_player();
});

jq.pass.click(function(elem){
    change_current_player();
});

jq.restart.click(function(elem){
    restart_game()
});

jq.num_players.change(function(elem){
    set_num_players();
});


function cs_fixed_size_columns(size)
{
    jq.board.empty();
    game_board = new CantStopBoard(jq.board);
    
    for (let cn = 2; cn <= 12; ++cn) // cn -> column number
    {
        game_board.add_column(cn, size);
    }
    set_num_players();
}

$("#debug").click(function (elem) {
    cs_fixed_size_columns(2);
});



