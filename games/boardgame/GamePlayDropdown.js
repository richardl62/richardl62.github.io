/*
 othello.js:  Code that is specific to Othello (but follows a pattern shared by other board games)
*/
"use strict";

class GamePlayDropdown {
    constructor(board) {
        this.board = board;
    }

    static mode()
    {
        return "dropdown";
    }

    static intial_statuses_json()
    {
        return [
            ["8x8", "[8,8,[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1]]]"],
        ]
    };

    // Updates board squares.
    // Returns true if the next player should have the next move
    move(player, square) {
        var col = square.getCol();
        for(var row = board.rows() -1; row >= 0; --row)
        {
            var sq = board.getSquare(row, col);
            if(sq.status().is_empty())
            {
                sq.player(player);
                return true;
            }
        }
         
        return false;
    }

    display_status(player) {
        $("#status").html(status_span("Player " + player, player));
    }
}