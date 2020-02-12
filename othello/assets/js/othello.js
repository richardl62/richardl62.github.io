"use strict;"

const n_rows = 8;
const n_cols = 8;


var preamble = $("#preamble");


var board = new GamesBoard($("#board"), n_rows, n_cols);
var game_history = new GameHistory(board);

var current_player = 1;
function other_player (player) {
    return (player%2)+1;
}

function setup_board()
{
    for(var row = 0; row < n_rows; ++row)
        for(var col = 0; col < n_cols; ++col)
            board.getSquare(row, col).make_empty();

    var mid_row = Math.floor(n_rows/2) - 1;
    var mid_col = Math.floor(n_cols/2) - 1;

    board.getSquare(mid_row, mid_col).player(1);
    board.getSquare(mid_row+1, mid_col).player(2);
    board.getSquare(mid_row, mid_col+1).player(2);
    board.getSquare(mid_row+1, mid_col+1).player(1);

    current_player = 1;
    game_history.record(current_player);
    display_game_state();
}

setup_board();




function get_captures(square, r_step, c_step)
{
    var row = square.row;
    var col = square.col;

    var captures = [];


    for(;;)
    {
        col += c_step;
        row += r_step;
        
        var sq = board.getSquare(row, col);
        if(!sq || !sq.player())
        {
            return [];
        }
        else if (sq.player() == current_player) // Using current_player is a kludge
        {
            return captures;
        }   
        else
        {
            captures.push(sq);
        }
    } 
}

class GameMove
{
    constructor(square, player)
    {
        this.square = square;
        this.player = player;
        this.redo();
    }
    
    redo()
    {
        this.captured_squares = [];
        this.error_string = undefined;

        if (this.square.player()) {
            this.error_string = "you must select an empty square";
        }
        else {

            for(var c_step = -1; c_step <= 1; ++c_step)
            {
                for(var r_step = -1; r_step <= 1; ++r_step)
                {
                    var captures = get_captures(this.square, c_step, r_step);
                    this.captured_squares.push(...captures);
                }
            }

            if(this.captured_squares.length == 0)
            {
                this.error_string = "you must capture at least one square";
            }
            else{
                for(var i = 0; i < this.captured_squares.length; ++i)
                {
                    this.captured_squares[i].player(this.player);
                }
                this.square.player(this.player);
            }
        }
    }
    
    errorString()
    {
        return this.error_string;
    }
}

function disable_button(button, disable)
{
    button.prop("disabled", disable);

    if(disable)
    {
        button.addClass("button-disabled");
    }
    else
    {
        button.removeClass("button-disabled");
    }
}


function display_game_state()
{
    var p1_score = $("#player1-score");
    var p2_score = $("#player2-score");

    // Setting colors here isa kludge in that they do not depend on the state
    // of the game.
    function score_css(elem, player_number)
    {
        const underline = player_number == current_player;
        elem.css({
            color: gamesBoardPlayerColor(player_number),
            textDecoration: underline ? "underline" : "none",
        });

    }
    score_css(p1_score, 1);
    score_css(p2_score, 2);

    var s1 = 0;
    var s2 = 0;
    board.for_each_square(function(sq){
        if(sq.player() == 1)
            ++s1;

        if(sq.player() == 2)
            ++s2;
    });

    p1_score.text(s1.toString());
    p2_score.text(s2.toString());

    const history_pos = game_history.pos();
    const history_items = game_history.n_items();

    disable_button($("#undo"), history_pos == 0);
    disable_button($("#redo"), history_pos + 1>= history_items);
}

function history_state_change()
{
    current_player = game_history.user_data();
    display_game_state();
}


function on_click_play(square)
{
    prev_status = board.status();
    prev_player = current_player;

    var game_move = new  GameMove(square, current_player)
    if(game_move.errorString())
    {
        alert(game_move.errorString());
    }
    else
    {
        current_player = other_player(current_player);
        game_history.record(current_player);
        display_game_state();
    } 
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

board.click(on_click_play);


function mode_change()
{
    var mode = $("#mode").children("option:selected").val();
    
    if(mode === "play")
    {
        $("#play-buttons").css("display", "block");
        $("#setup-buttons").css("display", "none");
        board.click(on_click_play);

        game_history.clear();
        game_history.record(1);
        display_game_state();

    }
    else
    {
        $("#play-buttons").css("display", "none");
        $("#setup-buttons").css("display", "block");
        board.click(on_click_setup);
    }
}
mode_change(); //kludge?

$("#mode").change(mode_change);

$("#undo").click(function(){
    if(!game_history.undo())
        alert("Cannot undo");

    history_state_change();
});
$("#redo").click(function(){
    if(!game_history.redo())
        alert("Cannot redo");
    
    history_state_change();
});

$("#new-game").click(function(){
    game_history.select(0);

    history_state_change();
});

$("#pass").click(function(){
    current_player = other_player(current_player);
    display_game_state();
});


function reset_board()
{
    var n_rows = parseInt($("#num-rows").val());
    var n_cols = parseInt($("#num-cols").val());
    board.reset(n_rows, n_cols);
}
$("#clear").click(reset_board);
$("#num-rows").change(reset_board);
$("#num-cols").change(reset_board);

function do_resize()
{
    // Ensure the squares in the board are actually square.
    board.resize();

    // Resize the preamble to match the board size.
    // (It will overflow if the board is too small, but that is OK.)
    var bw = board.outerWidth();
    preamble.width(bw);
}

$( window ).resize(do_resize);
do_resize();
