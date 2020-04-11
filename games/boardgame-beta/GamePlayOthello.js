/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";


class GamePlayOthello {
    constructor(board) {
        this.board = board;
    }

    static mode()
    {
        return "othello";
    }

    static initial_statuses_json()
    {
        return [
        ["8x8", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
        ["7x7", "[7,7,[[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,1,2,1,-1,-1],[-1,-1,2,1,2,-1,-1],[-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1]]]"],
        ["6x6", "[6,6,[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,1,2,-1,-1],[-1,-1,2,1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1]]]"],
        ["5x5", "[5,5,[[-1,-1,-1,-1,-1],[-1,2,1,2,-1],[-1,1,2,1,-1],[-1,2,1,2,-1],[-1,-1,-1,-1,-1]]]"],
        ["Cornerless", "[8,8,[[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-2,-2,-1,-1,-1,-1,-2,-2],[-2,-2,-1,-1,-1,-1,-2,-2]]]"],
        ]
    };

    // Returns true if the next player should have the next move
    move(player, square) {

        var captured_squares = [];
        this.error_string = undefined;
        var legal_move = true;
        if (square.player()) {
            // Clicks on squares that are ignored without an error message.
            legal_move = false;
        }
        else {
            for (var c_step = -1; c_step <= 1; ++c_step) {
                for (var r_step = -1; r_step <= 1; ++r_step) {
                    var captures = this.get_captures(square, c_step, r_step, player);
                    captured_squares.push(...captures);
                }
            }
            if (captured_squares.length == 0) {
                this.error_string = "Nothing captured";
                legal_move = false;
            }
            else {
                for (var i = 0; i < captured_squares.length; ++i) {
                    captured_squares[i].player(player);
                }
                square.player(player);
            }
        }

        if(this.error_string && legal_move)
        {
            throw Error("Internal problem with error reporting");
        }
        return legal_move;
    }

    get_captures(square, r_step, c_step, current_player) {
        var row = square.row;
        var col = square.col;

        var captures = [];

        for (; ;) {
            col += c_step;
            row += r_step;

            var sq = this.board.getSquare(row, col);
            if (!sq || !sq.player()) {
                return [];
            }
            else if (sq.player() == current_player) // Using current_player is a kludge
            {
                return captures;
            }
            else {
                captures.push(sq);
            }
        }
    }

    get_game_status()
    {
        if(this.error_string)
        {
            return this.error_string;
        }
        else
        {
            var s1 = 0;
            var s2 = 0;
            const n_rows = this.board.rows();
            const n_cols = this.board.cols();
            for (var row = 0; row < n_rows; ++row) {
                for (var col = 0; col < n_cols; ++col) {
                    var sq = this.board.getSquare(row, col);
                    if (sq.player() == 1)
                        ++s1;
    
                    if (sq.player() == 2)
                        ++s2;
                }
            }

            return [s1, s2];
        }
    }
}