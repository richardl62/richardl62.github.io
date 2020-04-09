"use strict";

var game_control = new GameControl;
setup_for_game_play();

$("#game-type").html(inner_html_for_select(
    game_control.game_names()
));

// kludge: Copied below
$("#game-option").html(inner_html_for_select(
    game_control.initial_status_names()
));

$("#game-type").change(function(param) {
    game_control.game_index(this.selectedIndex);
    
    // kludge: Copied above
    $("#game-option").html(inner_html_for_select(
        game_control.initial_status_names()
    ));
});

$("#game-option").change(function(param) {
    console.log("game-option");
    game_control.initial_status_index(this.selectedIndex);
});

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
    game_control.game_move_callback(display_game_state);
    
    display_game_state();
}

// For use during play rather than customisation
function display_game_state() {

    //game_play.display_status(current_player);

    // false -> check if possible, but don't make a change
    $("#undo").prop("disabled", game_control.undo(false));
    $("#redo").prop("disabled", game_control.redo(false));
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
 
$("#undo").click(() => game_control.undo());

$("#redo").click(() => game_control.redo());


document.onkeydown = function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
        undo();

    if (e.keyCode == 89 && e.ctrlKey)
        redo();
};

$("#pass").click(function(){
    game_control.next_player();
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
    var fixed_width = game_control.fixed_width_squares();
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
    game_control.fixed_width_squares(!game_control.fixed_width_squares()); //toggle
    set_fixed_width_options();

});

