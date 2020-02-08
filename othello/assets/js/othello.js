"use strict;"

const n_rows = 8;
const n_cols = 8;

var board = new GamesBoard($("#board"), n_rows, n_cols);
var preamble = $("#preamble");

var mid_row = Math.floor(n_rows/2) - 1;
var mid_col = Math.floor(n_cols/2) - 1;

function restart_game()
{
    for(var row = 0; row < n_rows; ++row)
        for(var col = 0; col < n_cols; ++col)
            board.getSquare(row, col).clear();

    board.getSquare(mid_row, mid_col).playerNumber(1);
    board.getSquare(mid_row+1, mid_col).playerNumber(2);
    board.getSquare(mid_row, mid_col+1).playerNumber(2);
    board.getSquare(mid_row+1, mid_col+1).playerNumber(1);

    set_current_player(1);
}

restart_game();

var current_player = 1;
var other_player = 2;

function set_current_player(cp)
{
    current_player = cp;
    other_player = (current_player%2)+1;
    

    $(".next-player-color").css("color", GamesBoard.getPlayerColor(current_player));
    $(".next-player-number").text(current_player.toString());
}

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
        if(!sq || !sq.playerNumber())
        {
            return [];
        }
        else if (sq.playerNumber() == current_player) // Using current_player is a kludge
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
    constructor(square, player, other_player)
    {
        this.square = square;
        this.player = player;
        this.other_player = other_player;
        this.redo();
    }
    
    redo()
    {
        this.captured_squares = [];
        this.error_string = undefined;

        if (this.square.playerNumber()) {
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
                    this.captured_squares[i].playerNumber(this.player);
                }
                this.square.playerNumber(this.player);
            }
        }
    }
    
    errorString()
    {
        return this.error_string;
    }
}

var prev_state;
var prev_player;
function on_click_play(square)
{
    prev_state = board.state();
    prev_player = current_player;

    var game_move = new  GameMove(square, current_player, other_player)
    if(game_move.errorString())
    {
        alert(game_move.errorString());
    }
    else
    {
        set_current_player(other_player);
    } 
}

function on_click_setup(square)
{
    var player = square.playerNumber();
    if(!player)
    {
        square.playerNumber(1);
    }
    else if(player == 1)
    {
        square.playerNumber(2);
    } 
    else
    {
        square.clear();
    }
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
   board.state(prev_state);
   set_current_player(prev_player);
});

$("#pass").click(function(){
    set_current_player(other_player);
});

$("#new-game").click(restart_game);

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
