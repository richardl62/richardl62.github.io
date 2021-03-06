/*
GamesBoard: class to represent a basic games board.
It is a grid of GameBoardSquares.
*/
"use strict";

class BasicGameBoard extends GridOfSquares {
    constructor(elem) {
        super(elem);
    }

    reset(n_rows, n_cols) {
        super.reset(n_rows, n_cols);

        this.squares = new Array(n_rows);
        for (var row = 0; row < n_rows; ++row) {
            this.squares[row] = new Array(n_cols);
            for (var col = 0; col < n_cols; ++col) {
                var elem = this.getElement(row, col);
                this.squares[row][col] = new gamesBoardSquare(elem, row, col);
            }
        }
    }

    // Return undefined if row or col are out of range.
    getSquare(row, col) {
        var s_row = this.squares[row];
        return s_row ? s_row[col] : undefined;
    }

    status(new_status) {
        if (new_status === undefined) {
            var squares = new Array(this.n_rows);
            for (var row = 0; row < this.n_rows; ++row) {
                squares[row] = new Array(this.n_cols);
                for (var col = 0; col < this.n_cols; ++col) {
                    squares[row][col] = this.squares[row][col].status_value();
                }
            }
            return squares;
        }
        else {
            let new_n_rows = new_status.length;
            let new_n_cols = new_status[0].length;
            
            this.reset(new_n_rows, new_n_cols);
            for (var row = 0; row < this.n_rows; ++row) {
                assert(new_status[row].length == new_n_cols,"inconsisent board status");
                for (var col = 0; col < this.n_cols; ++col) {
                    var sq = this.squares[row][col];
                    var sta = new_status[row][col];
                    sq.status_value(sta);
                }
            }
        }
    }

    clickBoardSquare(callback) {
        super.clickGridSquare((row, col) =>
            callback(this.getSquare(row, col))
        );
    }
}


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