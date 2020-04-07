"use strict";

var board = new BasicGameBoard($("#board"));
var game_history = new GameHistory(board);
var game_play_modes = [GamePlayDropdown, GamePlayOthello, GamePlayUnrestricted];

var game_play = 1234; // set below


var play_mode_elems = $(".play-mode");
var setup_mode_elems = $(".setup-mode");


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

    play_mode_elems.css("display", "none");
    setup_mode_elems.css("display", "block");
    board.clickBoardSquare(on_click_setup);
}

function setup_for_game_play()
{
    clear_error_string();

    play_mode_elems.css("display", "block");
    setup_mode_elems.css("display", "none");
    board.clickBoardSquare(on_click_play);

    game_history.clear();
    current_player = 1;
    game_history.record(current_player);

    
    display_game_state();
}

function setup_for_specific_game(mode_index, start_pos_index)
{
    
    var game_play_mode = game_play_modes[mode_index];

    window.game_play = new game_play_mode(board);
    
    const starting_pos = game_play_mode.starting_positions_json()[start_pos_index][1];
    board.status(JSON.parse(starting_pos));

    setup_for_game_play();
}

// kludge? Default to the first game
setup_for_specific_game(0,0);

var current_player = 1;
function other_player (player) {
    return (player%2)+1;
}

const custom_setup_string = "setup";
const custom_play_string = "play";
const default_mode_string = "Game type ...";

/* INITIAL SETUP */
function mode_inner_html()
{
    function option_elem(name) {
        return "<option>" + name + "</option>";
    }

    var html = option_elem(default_mode_string);
    for(var mi = 0; mi < game_play_modes.length; ++mi)
    {
        var mode = game_play_modes[mi].mode();
        var starting_positions = game_play_modes[mi].starting_positions_json();

        html += '<optgroup label=' + mode + '>';
        for (var si = 0; si < starting_positions.length; si++) {
            html += option_elem(starting_positions[si][0]);
        }
        html += "</optgroup>";
    }

    html += '<optgroup label="custom">';
    html += option_elem(custom_setup_string);
    html += option_elem(custom_play_string);
    html += "</optgroup>";

    return html;
}

$("#mode").html(mode_inner_html());

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

$("#mode").change(function() {

    const selected_name = $("#mode").find("option:selected").text();

    if(selected_name == default_mode_string)
    {
        return;
    }

    if(selected_name == custom_setup_string)
    {
        setup_for_customising();
    }
    else if(selected_name == custom_play_string)
    {
        setup_for_game_play();
    }
    else
    {
        function select_choosed_game() {
            const selected_index = document.getElementById("mode").selectedIndex; // Not JQuery!

            var index_count = 0;
            for (var mi = 0; mi < game_play_modes.length; ++mi) {
                var starting_positions = game_play_modes[mi].starting_positions_json();
                for (var si = 0; si < starting_positions.length; si++) {
                    ++index_count;
                    if (index_count == selected_index) {
                        setup_for_specific_game(mi, si);
                        return true;
                    }
                }
            }
            return false;
        }

        if(!select_choosed_game())
             throw Error("Unrecognised game selection");

    }

    // Return to the default
    $('#mode option').prop('selected', function() {
        return this.defaultSelected;
    });
});

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

