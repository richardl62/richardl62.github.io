"use strict";
/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
const jq = { 
    automatic_filling: $_checked("#automatic-filling"),
    board: $_checked("#board"),
    bust: $_checked("#bust"),
    leave: $_checked("#leave"),
    game_over: $_checked("#game-over"),
    loading: $_checked("#loading"),
    load_error: $_checked("#load-error"),
    move_options: $_checked("#move-options"),
    dice: $_checked(".csdice"),
    dont: $_checked("#dont"),
    game: $_checked("#game"),
    dice_options: $_checked(".dice-option"),
    manual_filling: $_checked("#manual-filling"), 
    num_players: $_checked("#num-players"),
    options_button: $_checked("#options-button"),
    options_div: $_checked("#options-div"),
    required_roll: $_checked("#required-roll"),
    restart: $_checked("#restart"),
    roll: $_checked("#roll"),
    pass: $_checked("#pass"),
    player_name: $_checked("#player-name"),
}

const disable_at_end_of_game = [jq.pass, jq.leave];
/*
 * Global variables (other the jq)
 */

let current_player = null; // set by restart_game()
let num_players = null; // set by restart_game()
const n_dice = 4;
const last_column = 12;

let option_div_display = new CssDisplay(jq.options_div);
option_div_display.none(true);

jq.automatic_filling.prop("checked", true);
function automatic_filling() {
    return jq.automatic_filling.prop("checked");
}

function manual_filling() {
    return jq.manual_filling.prop("checked");
}

assert(jq.dice.length == n_dice);

const max_move_options = 6;
assert(jq.dice_options.length == max_move_options);

let dice_array = make_dice_array();

let game_over_visibility = new CssVisibility(jq.game_over);
let move_options_visibility = new CssVisibility(jq.move_options);
let bust_visibility = new CssVisibility(jq.bust);
let required_roll_visibility = new CssVisibility(jq.required_roll)

var move_options = null;
var selected_precommits = null;
var player_left = null;

const max_players = 8;
var player_names = new Array(max_players + 1);

const selected_move = "selected-move";
const in_play_column = "cs-in-play-column";

// Setup to the board
let game_board;
try {
    game_board = make_game_board();
    set_num_players();
    jq.game.css("visibility", "visible");
}
catch (err) {
    jq.load_error.css("display", "block");
    console.log(err);

}
finally {
    jq.loading.css("display", "none");
}


/*
 * helper functions
 */

 function remove_class_instances(class_name)
 {
    $("."+ class_name).removeClass(class_name);
 }

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

function show_one(to_show)
{
    game_over_visibility.hidden(true);
    bust_visibility.hidden(true);
    move_options_visibility.hidden(true);
    required_roll_visibility.hidden(true);

    to_show.hidden(false);
}

function disable_roll_and_dont_buttons(disable)
{
    jq.roll.prop("disabled", disable);
    jq.dont.prop("disabled", disable);
}

function do_roll(spin)
{
    assert(spin != undefined, "spin option not set");

    game_board.promot_all_provisional_precommits(current_player);
    
    if(selected_precommits)
    {
        for(let p of selected_precommits)
        {
            game_board.column(p).top_elem().addClass(in_play_column);
        }
        selected_precommits = null;
    }

    dice_array.forEach((d)=>d.roll(spin));
    
    let dice_numbers = [];
    dice_array.forEach((d)=> dice_numbers.push(d.number()));

    move_options = game_board.options(current_player, dice_numbers);
    if (move_options.length == 0) {
        show_one(bust_visibility);
    }
    else {
        display_move_options();
    }

    if (automatic_filling()) { // On by default
        if(!manual_filling()) {
            disable_roll_and_dont_buttons(true);

            if (move_options.length == 1) {
                select_move_option(0);
            }
        }
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

    player_left = new Array(num_players+1).fill(false);
    // Set the current_player to 1 and set apporpriate colours.
    // Method is a kludge.
    current_player = num_players;
    change_current_player();

    show_one(required_roll_visibility);

    disable_at_end_of_game.forEach(e => e.prop("disabled", false));
 }

// Return null if all players have left
function next_unfinished_player(in_p)
{
    let p = in_p;

    do {
        ++p;
        if(p > num_players)
            p = 1;
    } while(player_left[p] && p != in_p);

    return player_left[p] ? null : p;
}

function change_current_player() {
    assert(current_player);

    game_board.remove_all_provisional_precommits(current_player);

    game_board.remove_all_precommits(current_player);
    selected_precommits = null;

    show_one(required_roll_visibility);

    current_player = next_unfinished_player(current_player);

    let player_color;
    if(current_player) {
        player_color = get_default_player_color(current_player);
    } else {
        player_color = "var(--games-board-non-player-color)"
        show_one(game_over_visibility); 
        disable_at_end_of_game.forEach(e => e.prop("disabled", true));
    }

    clear_in_play_columns();
    jq.game.get(0).style.setProperty("--player-color", player_color);

    set_current_player_name();
}

function clear_in_play_columns() {
    for (let cn = 0; cn <= last_column; ++cn) {
        let elem = game_board.column(cn).top_elem();
        if (elem)
            elem.removeClass(in_play_column);
    }
}

function clear_selected_move() {
    jq.dice_options.removeClass(selected_move);
}

function select_move_option(index) {
    const auto_move = move_options[index] && automatic_filling();
    if (auto_move || manual_filling()) {
        clear_selected_move();
        game_board.remove_all_provisional_precommits(current_player);
    }

    if(auto_move) {
        selected_precommits = move_options[index];
        $(jq.dice_options[index]).addClass(selected_move);

        game_board.remove_all_provisional_precommits(current_player);
        game_board.add_provisional_precommit(current_player, selected_precommits);

        disable_roll_and_dont_buttons(false);
    }
}


function set_current_player_name() {
    let elem = jq.player_name[0];

    if(!current_player)
    {
        // All player have left the game
        elem.placeholder = "Player";
        elem.value = "";
    }
    else if (player_names[current_player]) {
        elem.value = player_names[current_player];
    } else {
        elem.placeholder = "Player " + current_player;
        elem.value = "";
    }
}

 /*
 * Game interaction
 */

jq.options_button.click(function(elem){
    option_div_display.toggle();

    const div_hidden = option_div_display.none();
    $(this).toggleClass("in-out-button-pressed", !div_hidden);
});

jq.required_roll.click(function(elem){
    show_one(move_options_visibility);
    do_roll(true /*spin*/); 
});

jq.dice_options.click(function (elem) {
    let move_index = jq.dice_options.index(this);
    select_move_option(move_index);
});

jq.roll.click(function (elem) {
    do_roll(true /*spin*/);
});

jq.dont.click(function(elem){
    game_board.commit(current_player);
    show_one(required_roll_visibility);
    change_current_player();
});

jq.bust.click(function(elem){
    change_current_player();
});

jq.pass.click(function(elem){
    change_current_player();
});

jq.leave.click(function(elem){
    player_left[current_player] = true;
    game_board.commit(current_player);

    for(let c of game_board.columns())
    {
        if(!c.is_owned())
            c.reset_player(current_player);
    }
    change_current_player();
});

jq.restart.click(function(elem){
    restart_game()
});

jq.num_players.change(function(elem){
    set_num_players();
});

jq.player_name.change(function(elem){
    let new_name = this.value;
    player_names[current_player] = new_name;
});

jq.manual_filling.change(function(elem){
    game_board.allow_manual_filling($(this).prop('checked'));
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




