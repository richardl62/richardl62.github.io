"use strict";

var board = new BasicGameBoard($("#board"));
var game_history = new GameHistory(board);
var game_options = new GameOptions;

var game_play = null; // set below

function intial_setup() {
    $("#game-type").html(inner_html_for_select(
        game_options.game_names()
    ));

    select_game(0);
}
intial_setup();

function select_game(index)
{
    game_options.game(index);

    $("#game-option").html(inner_html_for_select(
        game_options.initial_status_names()
    ));

    game_play = game_options.new_game_play();
    //board.status(game_options.initial_status());
}
var selectElem = document.getElementById('game-type')

// When a new <option> is selected
selectElem.addEventListener('change', function() {
  var index = selectElem.selectedIndex;
    console.log(index);
    select_game(index);
})

// $("#game-type").change(function() {
//     console.log($("#game-type").selectedIndex);
//     select_game($("#game-type").selectedIndex);
// });

function set_error_string(str)
{
    $("#error-box").text(str);
    $("#error-box").css("display","block");
}

function clear_error_string()
{
    $("#error-box").css("display","none");
}

function setup_for_customising()
{
    clear_error_string();

    $(".play-mode").css("display", "none");
    $(".setup-mode").css("display", "block");
    board.clickBoardSquare(on_click_setup);
}

function setup_for_game_play()
{
    clear_error_string();

    $(".play-mode").css("display", "block");
    $(".setup-mode").css("display", "none");
    board.clickBoardSquare(on_click_play);

    game_history.clear();
    current_player = 1;
    game_history.record(current_player);

    
    display_game_state();
}

function game_option_inner_html(starting_positions_json)
{
    var html = "";
    starting_positions_json.forEach(
        spj => html += option_elem(spj[0]) 
    );

    $("#game-option").html(html);
}

// function setup_for_specific_game(mode_index)
// {
    
//     var game_play_mode = game_play_modes[mode_index];

//     game_play = new game_play_mode(board);


//     // Kludge?  Hard coded to pick the first starting position
//     const starting_pos = game_play.starting_positions_json()[0][1];
//     board.status(JSON.parse(starting_pos));

//     setup_for_game_play();
// }

// // kludge? Default to the first game
// setup_for_specific_game(0);

var current_player = 1;
function other_player (player) {
    return (player%2)+1;
}


// function option_elem(name) {
//     return "<option>" + name + "</option>";
// }

// function game_type_inner_html()
// {
//     var html = "";
//     game_play_modes.forEach(
//         gpm => html += option_elem(gpm.mode()) 
//     );

//     return html;
// }




// For use during play rather than customisation
function display_game_state() {

    game_play.display_status(current_player);

    const history_pos = game_history.pos();
    const history_items = game_history.n_items();

    $("#undo").prop("disabled", history_pos == 0);
    $("#redo").prop("disabled", history_pos + 1 >= history_items);
}

function history_state_change()
{
    current_player = game_history.user_data();
    display_game_state();
}

function on_click_play(square)
{
    if(square.status().is_disabled())
        return;

    // Loose any old errror string
    clear_error_string();
    
    if(game_play.move(current_player, square))
    {
        current_player = other_player(current_player);
        game_history.record(current_player); 
    }

    display_game_state(); 
}

function on_click_setup(square)
{

    var status = square.status();
    if(status.is_empty())
    {
        status.player(1);
    }
    else if(status.player() == 1)
    {
        status.player(2);
    } 
    else if(status.player() == 2)
    {
        status.disable();
    }
    else
    {
        status.make_empty();
    }

    square.status(status);
}

board.clickBoardSquare(on_click_play);


function undo() {
    game_history.undo();

    history_state_change();
}

function redo() {
    game_history.redo();
    
    history_state_change();
}

$("#undo").click(undo);

$("#redo").click(redo);


document.onkeydown = function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
        undo();

    if (e.keyCode == 89 && e.ctrlKey)
        redo();
};

$("#pass").click(function(){
    current_player = other_player(current_player);
    display_game_state();
});


$("#json").click(function(){
    var json = JSON.stringify(board.status());
    var new_window = window.open("", "");
    new_window.document.write("<p>" + json + "</p>");
});

function reset_board()
{
    var n_rows = parseInt($("#num-rows").val());
    var n_cols = parseInt($("#num-cols").val());
    board.reset(n_rows, n_cols);
    game_history.clear();
}
$("#clear").click(reset_board);
$("#num-rows").change(reset_board);
$("#num-cols").change(reset_board);


function set_fixed_width_options()
{
    var fixed_width = board.fixedWidthSquares();
    if(fixed_width)
    {
        $("body").css("width", "auto");
        $("#scale-to-fit").css({
            border: "outset",
            // color: "black"
        });
    }
    else
    {
        $("body").css("width", "100%");
        $("#scale-to-fit").css({
            border: "inset",
            // color: "red"
        });
    }
}
set_fixed_width_options();

$("#scale-to-fit").click(function()
{
    board.fixedWidthSquares(!board.fixedWidthSquares());
    set_fixed_width_options();

});

