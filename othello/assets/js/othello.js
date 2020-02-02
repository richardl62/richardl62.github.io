"use strict;"

const n_rows = 8;
const n_cols = 8;

var board = new GamesBoard($("#board"), n_rows, n_cols);

var mid_row = Math.floor(n_rows/2) - 1;
var mid_col = Math.floor(n_cols/2) - 1

board.getSquare(mid_row, mid_col).playerNumber(1);
board.getSquare(mid_row+1, mid_col).playerNumber(2);
board.getSquare(mid_row, mid_col+1).playerNumber(2);
board.getSquare(mid_row+1, mid_col+1).playerNumber(1);


// Kludge: Start out of order that swap as lazy way to set color of preamble
var current_player = 2;
var other_player = 1;
change_player();

function change_player()
{
    var tmp = current_player;
    current_player = other_player;
    other_player = tmp;

    $("#preamble").css("background-color", GamesBoard.getPlayerColor(current_player));
}

var captured_squares = [];
function set_captured_squares(player)
{
    for(i = 0; i < captured_squares.length; ++i)
    {
        captured_squares[i].playerNumber(player);
    }
}

function on_click(square)
{
    var n_captured = captured_squares.length;
    if(square.playerNumber())
    {
        alert("Select an empty square");
    }
    else if(n_captured  == 0)
    {
        alert("You must capture some of your oppoents squares");
    }
    else
    {
        captured_squares = [];

        change_player();
    } 
}


function on_hover_in(square)
{
    if (!square.playerNumber()) {

        for (col = 0; col < n_cols; ++col) {
            var sq = board.getSquare(square.row, col);
            if (sq.playerNumber() == other_player) {
                captured_squares.push(sq);
            }
        }

        for (row = 0; row < n_rows; ++row) {
            var sq = board.getSquare(row, square.col);
            if (sq.playerNumber() == other_player) {
                captured_squares.push(sq);
            }
        }

        set_captured_squares(current_player);
    }
}

function on_hover_out()
{
    set_captured_squares(other_player);
    captured_squares = [];
}

board.click(on_click);

board.hover(on_hover_in, on_hover_out);

$( window ).resize(function(){
    board.resize();
});

