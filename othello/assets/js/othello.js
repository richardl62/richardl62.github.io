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
var move_number = 0;

change_player();

function change_player()
{
    var tmp = current_player;
    current_player = other_player;
    other_player = tmp;
    
    ++move_number;


    $("#preamble").css("background-color", GamesBoard.getPlayerColor(current_player));
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

            //var captures = get_captures(this.square, 1, 0);
            //this.captured_squares.push(...captures);

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
    
    undo()
    {
        if(!this.error_string) {
            for(var i = 0; i < this.captured_squares.length; ++i)
            {
                this.captured_squares[i].playerNumber(this.other_player);
            }
            this.square.clear();
        }
    }

    errorString()
    {
        return this.error_string;
    }
}


function on_click(square)
{
    var game_move = new  GameMove(square, current_player, other_player)
    if(game_move.errorString())
    {
        alert(game_move.errorString());
    }
    else
    {
        change_player();
        clear_square_on_hover_out = false;
    } 
}


function on_hover_in(square)
{
    clear_square_on_hover_out = false;
    if(!square.playerNumber())
    {
        square.color(GamesBoard.getPlayerColor(current_player));
        clear_square_on_hover_out = true;
    }
}

function on_hover_out(square)
{
    if(clear_square_on_hover_out)
    {
        square.clear();
    }
}

board.click(on_click);

board.hover(on_hover_in, on_hover_out);

$( window ).resize(function(){
    board.resize();
});

