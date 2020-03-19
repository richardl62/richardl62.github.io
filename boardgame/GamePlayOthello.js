/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayOthello {
    constructor(board) {
        this.board = board;
    }

    type()
    {
        return "othello";
    }

    starting_positions_json()
    {
        return [
        ["Standard", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,2,-1,-1,-1],[-1,-1,-1,2,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
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
                    var captures = this.get_captures(square, c_step, r_step);
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
                
            }
        }

        if(this.error_string && legal_move)
        {
            throw Error("Internal problem with error reporting");
        }
        return legal_move;
    }

    get_captures(square, r_step, c_step) {
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

    get_error_string()
    {
        return this.error_string;
    }

    display_status() {
        var p1_score = $("#player1-score");
        var p2_score = $("#player2-score");

        function score_css(elem, player_number) {
            const underline = player_number == current_player;
            elem.css({
                textDecoration: underline ? "underline" : "none",
            });
        }
        score_css(p1_score, 1);
        score_css(p2_score, 2);

        var s1 = 0;
        var s2 = 0;

        for (var row = 0; row < board.n_rows; ++row) {
            for (var col = 0; col < board.n_cols; ++col) {
                var sq = board.getSquare(row, col);
                if (sq.player() == 1)
                    ++s1;

                if (sq.player() == 2)
                    ++s2;
            }
        }

        p1_score.text(s1.toString());
        p2_score.text(s2.toString());
    }
}