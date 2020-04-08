"use strict";
class GameControl {
    constructor()
    {
        this.board = new BasicGameBoard($("#board"));
        this.game_history = new GameHistory(this.board);
        this.game_options = new GameOptions;
        
        this.game_play = undefined; // set in reset()
        this.current_player = undefined; // set in reset()

        this.reset();
    }

    reset()
    {
        this.game_play = this.game_options.new_game_play(this.board);
        const init_stat = this.game_options.initial_status();
        this.board.status(init_stat);

        this.current_player = 1;
        this.game_history.clear();
        this.history_record();
    }

    game_index(index)
    {
        this.game_options.game_index(index);
        this.reset();
    }

    initial_status_index(index)
    {
        this.game_options.initial_status_index(index);
        this.reset();
    }

    current_player(player)
    {
        if(player)
        {
            this.current_player = player;
        }

        return this.current_player;
    }

    game_names() {return this.game_options.game_names();}
    initial_status_names() {return this.game_options.initial_status_names();}

    history_record()
    {
        this.game_history.record(this.current_player);
    }

    // If make_change is false (but not undefined) check if an undo is possible
    // but don't actually make the change.
    undo(make_change)
    {
        this.game_history.undo(make_change);
    }

    // Analogous to undo()
    redo(make_change)
    {
        this.game_history.redo(make_change);
    }

    game_move(square, player)
    {
        this.game_play.move(square, player);
    }

    clickBoardSquare(callback) {
        this.board.clickBoardSquare(callback);
    }

    fixedWidthSquares(opt)
    {
        return this.board.fixedWidthSquares(opt);
    }
}

function other_player (player) {
    return (player%2)+1;
}

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
    game_control.clickBoardSquare(on_click_play);
    
    display_game_state();
}



// For use during play rather than customisation
function display_game_state() {

    //game_play.display_status(current_player);

    // false -> check if possible, but don't make a change
    $("#undo").prop("disabled", game_control.undo(false));
    $("#redo").prop("disabled", game_control.redo(false));
}


function on_click_play(square)
{
    if(square.status().is_disabled())
        return;

    // Loose any old errror string
    clear_error_string();
    
    if(game_control.game_move(game_control.current_player, square))
    {
        game_control.current_player(other_player(game_control.current_player));
        game_control.history_record(); 
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

game_control.clickBoardSquare(on_click_play);


function undo() {
    game_control.undo();
}

function redo() {
    game_control.redo();
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
    game_control.current_player(
        other_player(game_control.current_player())
    );
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
    var fixed_width = game_control.fixedWidthSquares();
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
    game_control.fixedWidthSquares(!game_control.fixedWidthSquares());
    set_fixed_width_options();

});

