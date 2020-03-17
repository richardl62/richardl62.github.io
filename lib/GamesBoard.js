/*
GamesBoard: class to represent a games board

*/
'use strict';

class GamesBoard extends GridOfSquares {
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
        this.apply_click_callback();
    }

    // Return undefined if row or col are out of range.
    getSquare(row, col) {
        var s_row = this.squares[row];
        return s_row ? s_row[col] : undefined;
    }
    getSquareFromElem(elem) {
        var [row, col] = this.getPosition(elem);
        return this.getSquare(row, col);
    }
    click(callback) {
        var games_board = this; // record 'outer' this.
        this.click_callback = function () {
            callback(games_board.getSquareFromElem(this));
        };
        this.apply_click_callback();
    }
    apply_click_callback() {
        var the_callback = this.click_callback;
        this.for_each_square(function (square) {
            //only 1 callback is supported
            square.elem.off("click");
            if (the_callback) {
                square.elem.click(the_callback);
            }
        });
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
            return [this.n_rows, this.n_cols, squares];
        }
        else {
            let new_n_rows, new_n_cols, new_squares;
            [new_n_rows, new_n_cols, new_squares] = new_status;
            this.reset(new_n_rows, new_n_cols);
            for (var row = 0; row < this.n_rows; ++row) {
                for (var col = 0; col < this.n_cols; ++col) {
                    var sq = this.squares[row][col];
                    var sta = new_squares[row][col];
                    sq.status_value(sta);
                }
            }
        }
    }

    for_each_square(func) {
        for (var row = 0; row < this.n_rows; ++row) {
            for (var col = 0; col < this.n_cols; ++col) {
                func(this.squares[row][col]);
            }
        }
    }
    
}
