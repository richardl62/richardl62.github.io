/*
 * Get and sanity-check the jQuery elements that are used in this file.
 */
 
const jq = { 
    board: $("#board"),
    bust: $("#bust"),
    leave: $("#leave"),
    game_over: $("#game-over"),
    loading: $("#loading"),
    load_error: $("#load-error"),
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
    player_name: $("#player-name"),
}

for (const [key, value] of Object.entries(jq)) {
    assert(value.length > 0,
        '"' + key + '"' + " matched " + value.length + " elements");
}

const disable_at_end_of_game = [jq.pass, jq.leave];
/*
 * Global variables (other the jq)
 */

let current_player = null; // set by restart_game()
let num_players = null; // set by restart_game()
const n_dice = 4;
const last_column = 12;

assert(jq.dice.length == n_dice, "4 dice expected");

const max_move_options = 6;
assert(jq.dice_options.length == max_move_options, "6 move options expect");

let dice_array = make_dice_array();

let game_over_visibility = new SetVisiblity(jq.game_over);
let move_options_visibility = new SetVisiblity(jq.move_options);
let bust_visibility = new SetVisiblity(jq.bust);
let required_roll_visibility = new SetVisiblity(jq.required_roll)

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

function make_visible(visible)
{
    game_over_visibility.off();
    bust_visibility.off();
    move_options_visibility.off();
    required_roll_visibility.off();

    visible.on();
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

    player_left = new Array(num_players+1).fill(false);
    // Set the current_player to 1 and set apporpriate colours.
    // Method is a kludge.
    current_player = num_players;
    change_current_player();

    make_visible(required_roll_visibility);

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

    make_visible(required_roll_visibility);

    current_player = next_unfinished_player(current_player);

    let player_color;
    if(current_player) {
        player_color = get_default_player_color(current_player);
    } else {
        player_color = "var(--games-board-non-player-color)"
        make_visible(game_over_visibility); 
        disable_at_end_of_game.forEach(e => e.prop("disabled", true));
    }

    clear_in_play_columns();
    jq.game.get(0).style.setProperty("--player-color", player_color);

    set_current_player_name();
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



