"use strict;"

const n_rows = 8;
const n_cols = 8;

var board = new GamesBoard($("#board"), n_rows, n_cols);

var mid_row = Math.floor(n_rows/2) - 1;
var mid_col = Math.floor(n_cols/2) - 1

board.getSquare(mid_row, mid_col).addCounter(1);
board.getSquare(mid_row+1, mid_col).addCounter(2);
board.getSquare(mid_row, mid_col+1).addCounter(2);
board.getSquare(mid_row+1, mid_col+1).addCounter(1);

$( window ).resize(function(){
    board.resize();
});

